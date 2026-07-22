"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Button from "@/components/ui/Button";
import AuthShell from "@/components/auth/AuthShell";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

const fadeStep = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Only ever redirect to a same-origin relative path — a raw query-param
// callbackUrl (e.g. "https://evil.tld/...") would otherwise let an attacker
// craft a login link that redirects the victim off-site right after they
// authenticate with real credentials.
function sanitizeCallbackUrl(url) {
  if (!url || typeof url !== "string") return "/";
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return "/";
  return url;
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(params.get("callbackUrl"));
  const justRegistered = params.get("registered") === "1";
  const reduce = useReducedMotion();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("password");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(justRegistered ? "Account created! Please sign in to continue." : "");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotStage, setForgotStage] = useState("email"); // email | reset | done
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Invalid email or password."); return; }
    setStep("otp");
    setInfo(`We have emailed a 6-digit code to ${email}.`);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, otp, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid or expired code. Please try again."); }
    else { router.push(callbackUrl); router.refresh(); }
  }

  async function resendOtp() {
    setError(""); setInfo(""); setLoading(true);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error || "Could not resend the code."); return; }
    setInfo(`A new code was sent to ${email}.`);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotError("");
    setForgotInfo("");
    setForgotLoading(true);
    const res = await fetch("/api/auth/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    const data = await res.json().catch(() => ({}));
    setForgotLoading(false);
    if (!res.ok) {
      setForgotError(data.error || "Something went wrong. Please try again.");
      return;
    }
    setForgotStage("reset");
    setForgotInfo(`If an account exists for ${forgotEmail}, a 6-digit code is on its way.`);
  }

  async function handleResendCode() {
    setForgotError("");
    setForgotLoading(true);
    const res = await fetch("/api/auth/reset-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    const data = await res.json().catch(() => ({}));
    setForgotLoading(false);
    if (!res.ok) {
      setForgotError(data.error || "Could not resend the code.");
      return;
    }
    setForgotInfo(`A new code was sent to ${forgotEmail}.`);
  }

  async function handleResetConfirm(e) {
    e.preventDefault();
    setForgotError("");
    setForgotLoading(true);
    const res = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: forgotEmail,
        code: forgotCode,
        password: forgotNewPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setForgotLoading(false);
    if (!res.ok) {
      setForgotError(data.error || "Could not reset password.");
      return;
    }
    setForgotStage("done");
  }

  const motionProps = (key) =>
    reduce
      ? { key }
      : { key, variants: fadeStep, initial: "initial", animate: "animate", exit: "exit", transition: { duration: 0.2 } };

  // Forgot Password Screen
  if (forgotStep) {
    return (
      <AuthShell
        title={forgotStage === "done" ? "Password updated!" : "Reset your password"}
        subtitle={
          forgotStage === "email"
            ? "Enter your email and we'll send you a reset code."
            : forgotStage === "reset"
              ? `Enter the code sent to ${forgotEmail}.`
              : "You can now sign in with your new password."
        }
      >
        <div className="mt-6">
          {forgotStage !== "done" && (
            <button
              onClick={() => { setForgotStep(false); setForgotStage("email"); setForgotError(""); setForgotInfo(""); }}
              className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-blue mb-6 transition-colors"
            >
              <ArrowLeft size={15} /> Back to login
            </button>
          )}

          {forgotInfo && (
            <p className="mb-4 rounded-lg bg-brand-blue/10 border border-brand-blue/20 px-3 py-2 text-sm text-brand-blue">{forgotInfo}</p>
          )}
          {forgotError && (
            <p className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-600">{forgotError}</p>
          )}

          <AnimatePresence mode="wait">
            {forgotStage === "email" && (
              <motion.div {...motionProps("email")}>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      id="forgot-email"
                      type="email" name="username" autoComplete="username" required value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      aria-label="Email address"
                      className="w-full rounded-xl glass-brand-card pl-9 pr-4 py-2.5 text-sm text-brand-text outline-none focus:shadow-brand-glow transition-all placeholder:text-brand-muted"
                    />
                  </div>
                  <Button type="submit" variant="brand-gradient" size="lg" className="w-full" disabled={forgotLoading}>
                    {forgotLoading ? "Sending..." : "Send Reset Code"}
                  </Button>
                </form>
              </motion.div>
            )}

            {forgotStage === "reset" && (
              <motion.div {...motionProps("reset")}>
                <form onSubmit={handleResetConfirm} className="space-y-4">
                  <input
                    id="forgot-code"
                    type="text" name="one-time-code" autoComplete="one-time-code"
                    inputMode="numeric" maxLength={6} required autoFocus
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="------"
                    aria-label="6-digit reset code"
                    className="w-full rounded-xl glass-brand-card px-4 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-brand-text outline-none focus:shadow-brand-glow placeholder:text-brand-muted"
                  />
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      id="forgot-new-password"
                      type={showNewPassword ? "text" : "password"} name="new-password" autoComplete="new-password"
                      required minLength={8}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="New password (min 8 characters)"
                      aria-label="New password"
                      className="w-full rounded-xl glass-brand-card pl-9 pr-10 py-2.5 text-sm text-brand-text outline-none focus:shadow-brand-glow placeholder:text-brand-muted"
                    />
                    <button type="button" onClick={() => setShowNewPassword((v) => !v)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-blue">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <Button type="submit" variant="brand-gradient" size="lg" className="w-full" disabled={forgotLoading || forgotCode.length < 6}>
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>

                <p className="mt-4 text-center text-xs text-brand-muted">
                  Didn&apos;t get the code?{" "}
                  <button type="button" onClick={handleResendCode} disabled={forgotLoading}
                    className="font-semibold text-brand-blue hover:underline disabled:opacity-50">
                    Resend
                  </button>
                </p>
              </motion.div>
            )}

            {forgotStage === "done" && (
              <motion.div {...motionProps("done")} className="text-center py-2">
                <motion.div
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="flex justify-center mb-4"
                >
                  <CheckCircle2 size={52} className="text-brand-blue" />
                </motion.div>
                <Button
                  variant="brand-gradient"
                  onClick={() => { setForgotStep(false); setForgotStage("email"); setForgotEmail(""); setForgotCode(""); setForgotNewPassword(""); setForgotInfo(""); setForgotError(""); }}
                >
                  Back to login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AuthShell>
    );
  }

  // Main Login Screen
  return (
    <AuthShell
      title={step === "password" ? "Welcome back" : "Check your email"}
      subtitle={step === "password" ? "Sign in to your Hardvanta account" : `We sent a 6-digit code to ${email}`}
    >
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {step === "password" ? (
            <motion.div {...motionProps("password")}>
              {/* Google */}
              <button
                onClick={() => signIn("google", { callbackUrl })}
                className="flex w-full items-center justify-center gap-3 rounded-xl glass-brand-card py-2.5 text-sm font-semibold text-brand-text hover:shadow-brand-glow transition-all"
              >
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-brand-muted">
                <span className="h-px flex-1 bg-brand-border" /> OR <span className="h-px flex-1 bg-brand-border" />
              </div>

              {info && <p className="mb-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20 px-3 py-2.5 text-sm text-brand-blue">{info}</p>}
              {error && <p className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-600">{error}</p>}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-brand-text">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      id="login-email"
                      type="email" name="username" autoComplete="username" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl glass-brand-card pl-9 pr-4 py-2.5 text-sm text-brand-text outline-none focus:shadow-brand-glow transition-all placeholder:text-brand-muted"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-sm font-medium text-brand-text">Password</label>
                    <button type="button" onClick={() => setForgotStep(true)} className="text-xs text-brand-blue hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"} name="current-password" autoComplete="current-password"
                      required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl glass-brand-card pl-9 pr-10 py-2.5 text-sm text-brand-text outline-none focus:shadow-brand-glow transition-all placeholder:text-brand-muted"
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-blue transition-colors">
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" name="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-blue" />
                  <span className="text-sm text-brand-muted">Remember me for 30 days</span>
                </label>

                <Button type="submit" variant="brand-gradient" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Sending code..." : "Continue"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-brand-muted">
                Do not have an account?{" "}
                <Link href="/register" className="font-semibold text-brand-blue hover:underline">Create one</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div {...motionProps("otp")}>
              {info && <p className="mb-4 rounded-xl bg-brand-blue/10 border border-brand-blue/20 px-3 py-2.5 text-sm text-brand-blue">{info}</p>}
              {error && <p className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-600">{error}</p>}

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label htmlFor="login-otp" className="mb-1.5 block text-sm font-medium text-brand-text text-center">Enter 6-digit code</label>
                  <input
                    id="login-otp"
                    type="text" name="one-time-code" autoComplete="one-time-code"
                    inputMode="numeric" maxLength={6} required autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-xl glass-brand-card px-3 py-3 text-center text-2xl font-bold tracking-[0.6em] text-brand-text outline-none focus:shadow-brand-glow transition-all placeholder:text-brand-muted"
                  />
                </div>

                <Button type="submit" variant="brand-gradient" size="lg" className="w-full" disabled={loading || otp.length < 6}>
                  {loading ? "Verifying..." : "Verify & Sign in"}
                </Button>

                <div className="flex items-center justify-between text-sm pt-1">
                  <button type="button" onClick={() => { setStep("password"); setOtp(""); setError(""); setInfo(""); }}
                    className="flex items-center gap-1 text-brand-muted hover:text-brand-blue transition-colors">
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button type="button" onClick={resendOtp} disabled={loading}
                    className="font-semibold text-brand-blue hover:underline disabled:opacity-50">
                    Resend code
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-brand-muted mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-brand-blue hover:underline">Terms</Link> and{" "}
          <Link href="/privacy-policy" className="text-brand-blue hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
