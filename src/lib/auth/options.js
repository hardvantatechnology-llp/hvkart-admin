// NextAuth configuration — copied verbatim from hardvanta/src/lib/auth.js.
// Same providers, same callbacks, same session strategy: this app reads and
// writes the same User/Account/Session/VerificationToken/LoginOtp tables in
// the shared database, so a user's credentials behave identically here.
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { checkRateLimit, getClientIp } from "@/lib/auth/rateLimit";

// Fixed dummy hash used to keep authorize()'s response time constant whether
// or not the account exists — prevents timing-based email enumeration.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8n7t3T8n3Xs.3XkgKq7YbFvMRRZLXK";

export async function getAuthOptions() {
  const { prisma } = await import("@/lib/database/prisma");

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt", maxAge: 12 * 60 * 60 }, // 12h — shorter-lived than the 30-day default
    pages: {
      signIn: "/login",
    },

    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
          otp: { label: "OTP", type: "text" },
        },
        async authorize(credentials, req) {
          if (!credentials?.email || !credentials?.password || !credentials?.otp) {
            return null;
          }
          const email = credentials.email.toLowerCase().trim();

          // Rate limit login attempts per-email and per-IP to slow down
          // password/OTP guessing against this callback.
          const ip = getClientIp(req);
          const byEmail = checkRateLimit(`authorize:email:${email}`, { limit: 10, windowMs: 15 * 60 * 1000 });
          const byIp = checkRateLimit(`authorize:ip:${ip}`, { limit: 30, windowMs: 15 * 60 * 1000 });
          if (!byEmail.allowed || !byIp.allowed) return null;

          const user = await prisma.user.findUnique({ where: { email } });

          // Always run a bcrypt comparison, even for unknown/passwordless
          // accounts, so response time doesn't leak whether the email exists.
          const hashToCheck = user?.password || DUMMY_HASH;
          const valid = await bcrypt.compare(credentials.password, hashToCheck);
          if (!user || !user.password || !valid) return null;

          const otp = await prisma.loginOtp.findFirst({
            where: { email, code: credentials.otp.trim(), purpose: "LOGIN" },
            orderBy: { createdAt: "desc" },
          });
          if (!otp || otp.expires < new Date()) return null;

          await prisma.loginOtp.deleteMany({ where: { email, purpose: "LOGIN" } });

          return { id: user.id, name: user.name, email: user.email, role: user.role };
        },
      }),
    ],

    callbacks: {

      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
          token.role = user.role ?? "USER";
          token.pwdChangedAt = user.passwordChangedAt ? new Date(user.passwordChangedAt).getTime() : 0;
          token.validatedAt = Date.now();
        }

        // Google OAuth: first login, fetch the user from the DB.
        if (account?.provider === "google" && token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role ?? "USER";
            token.pwdChangedAt = dbUser.passwordChangedAt ? new Date(dbUser.passwordChangedAt).getTime() : 0;
            token.validatedAt = Date.now();
          }
        }

        // Periodically re-sync against the DB so a revoked/downgraded role,
        // a deleted account, or a password reset invalidates an
        // already-issued JWT well before its maxAge expires, instead of
        // silently keeping stale privileges for the full session lifetime.
        const REVALIDATE_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
        if (!user && token.id && (!token.validatedAt || Date.now() - token.validatedAt > REVALIDATE_INTERVAL_MS)) {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
          if (!dbUser) return {}; // account deleted — drop the session
          const dbPwdChangedAt = dbUser.passwordChangedAt ? new Date(dbUser.passwordChangedAt).getTime() : 0;
          if (dbPwdChangedAt !== (token.pwdChangedAt || 0)) return {}; // password changed since this token was issued
          token.role = dbUser.role ?? "USER";
          token.pwdChangedAt = dbPwdChangedAt;
          token.validatedAt = Date.now();
        }

        return token;
      },

      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
        }
        return session;
      },
    },

    // Fires once, the first time the PrismaAdapter creates a User row — i.e.
    // a brand-new Google OAuth signup.
    events: {
      async createUser({ user }) {
        try {
          const { sendWelcomeEmail } = await import("@/services/email");
          await sendWelcomeEmail(user.email, user.name);
        } catch (err) {
          console.error("[auth] welcome email failed:", err?.message || err);
        }
      },
    },

    secret: process.env.NEXTAUTH_SECRET,
  };
}
