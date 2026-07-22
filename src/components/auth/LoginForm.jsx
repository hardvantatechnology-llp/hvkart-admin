"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";

// Only ever redirect to a same-origin relative path — a raw query-param
// callbackUrl (e.g. "https://evil.tld/...") would otherwise let an attacker
// craft a login link that redirects the victim off-site right after they
// authenticate with real credentials. Copied verbatim from hardvanta's login page.
function sanitizeCallbackUrl(url) {
  if (!url || typeof url !== "string") return "/dashboard";
  if (!url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return "/dashboard";
  return url;
}

function LoginFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = sanitizeCallbackUrl(params.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("password");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState(false);
  const [forgotStage, setForgotStage] = useState("email"); // email | reset | done
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotInfo, setForgotInfo] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

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
    if (!res.ok) {
      setError(data.error || "Invalid email or password.");
      return;
    }
    setStep("otp");
    setInfo(`We have emailed a 6-digit code to ${email}.`);
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, otp, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid or expired code. Please try again.");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function resendOtp() {
    setError("");
    setInfo("");
    setLoading(true);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not resend the code.");
      return;
    }
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
      body: JSON.stringify({ email: forgotEmail, code: forgotCode, password: forgotNewPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setForgotLoading(false);
    if (!res.ok) {
      setForgotError(data.error || "Could not reset password.");
      return;
    }
    setForgotStage("done");
  }

  const card = "w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm";
  const input =
    "w-full rounded-lg border border-zinc-300 pl-9 pr-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-400";
  const banner = (variant) =>
    variant === "info"
      ? "mb-4 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700"
      : "mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600";

  if (forgotStep) {
    return (
      <div className={card}>
        <h1 className="text-lg font-bold text-zinc-900">
          {forgotStage === "done" ? "Password updated!" : "Reset your password"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {forgotStage === "email"
            ? "Enter your email and we'll send you a reset code."
            : forgotStage === "reset"
              ? `Enter the code sent to ${forgotEmail}.`
              : "You can now sign in with your new password."}
        </p>

        <div className="mt-6">
          {forgotStage !== "done" && (
            <button
              type="button"
              onClick={() => {
                setForgotStep(false);
                setForgotStage("email");
                setForgotError("");
                setForgotInfo("");
              }}
              className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-600"
            >
              <ArrowLeft size={15} /> Back to login
            </button>
          )}

          {forgotInfo && <p className={banner("info")}>{forgotInfo}</p>}
          {forgotError && <p className={banner("error")}>{forgotError}</p>}

          {forgotStage === "email" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="forgot-email"
                  type="email"
                  name="username"
                  autoComplete="username"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address"
                  className={input}
                />
              </div>
              <Button type="submit" disabled={forgotLoading}>
                {forgotLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          )}

          {forgotStage === "reset" && (
            <>
              <form onSubmit={handleResetConfirm} className="space-y-4">
                <input
                  id="forgot-code"
                  type="text"
                  name="one-time-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="------"
                  aria-label="6-digit reset code"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-lg font-semibold tracking-[0.5em] text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="forgot-new-password"
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="New password (min 8 characters)"
                    aria-label="New password"
                    className={input}
                  />
                </div>
                <Button type="submit" disabled={forgotLoading || forgotCode.length < 6}>
                  {forgotLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-zinc-500">
                Didn&apos;t get the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={forgotLoading}
                  className="font-semibold text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </>
          )}

          {forgotStage === "done" && (
            <div className="py-2 text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle2 size={48} className="text-blue-600" />
              </div>
              <Button
                onClick={() => {
                  setForgotStep(false);
                  setForgotStage("email");
                  setForgotEmail("");
                  setForgotCode("");
                  setForgotNewPassword("");
                  setForgotInfo("");
                  setForgotError("");
                }}
              >
                Back to login
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={card}>
      <h1 className="text-lg font-bold text-zinc-900">
        {step === "password" ? "Admin sign in" : "Check your email"}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {step === "password" ? "Sign in to the hardvanta admin panel" : `We sent a 6-digit code to ${email}`}
      </p>

      <div className="mt-6">
        {step === "password" ? (
          <>
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl })}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
              </svg>
              Continue with Google
            </button>

            <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" /> OR <span className="h-px flex-1 bg-zinc-200" />
            </div>

            {info && <p className={banner("info")}>{info}</p>}
            {error && <p className={banner("error")}>{error}</p>}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="login-email"
                    type="email"
                    name="username"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={input}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-zinc-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotStep(true)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="current-password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-blue-600"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Sending code..." : "Continue"}
              </Button>
            </form>
          </>
        ) : (
          <>
            {info && <p className={banner("info")}>{info}</p>}
            {error && <p className={banner("error")}>{error}</p>}

            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-otp" className="mb-1.5 block text-center text-sm font-medium text-zinc-700">
                  Enter 6-digit code
                </label>
                <input
                  id="login-otp"
                  type="text"
                  name="one-time-code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-center text-2xl font-bold tracking-[0.6em] text-zinc-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" disabled={loading || otp.length < 6}>
                {loading ? "Verifying..." : "Verify & Sign in"}
              </Button>

              <div className="flex items-center justify-between pt-1 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("password");
                    setOtp("");
                    setError("");
                    setInfo("");
                  }}
                  className="flex items-center gap-1 text-zinc-500 hover:text-blue-600"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="font-semibold text-blue-600 hover:underline disabled:opacity-50"
                >
                  Resend code
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
