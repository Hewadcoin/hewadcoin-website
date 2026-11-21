
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { createClient } from "../../lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function sendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) throw error;

      setSuccess("Verification code sent to your email.");
      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "recovery",
      });

      if (error) throw error;

      setSuccess("Email verified successfully.");
      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) throw error;

      setSuccess("A new verification code has been sent.");
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resend verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Your password has been changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-[#111820] px-4 py-4 text-white placeholder:text-gray-500 outline-none transition focus:border-[#D8AE55] focus:ring-1 focus:ring-[#D8AE55]";

  const buttonClass =
    "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C99A3D] to-[#F0D18A] px-5 py-4 font-bold text-[#151515] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080D13] px-4 py-10 text-white">
      <div className="w-full max-w-[480px]">

        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#D8AE55]/50 bg-[#D8AE55]/10 shadow-[0_0_35px_rgba(216,174,85,0.12)]">
            <span className="text-3xl font-black text-[#E8BD55]">
              H
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-wider text-[#E8BD55]">
            HEWAD COIN
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Secure Account Recovery
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111820] p-6 shadow-2xl sm:p-9">

          <div className="mb-8 flex items-center gap-2">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className={`h-1.5 flex-1 rounded-full transition ${
                  step >= number
                    ? "bg-[#E8BD55]"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          <div className="mb-7 text-center">
            {step === 1 && (
              <>
                <Mail className="mx-auto mb-4 h-10 w-10 text-[#E8BD55]" />
                <h2 className="text-2xl font-bold">
                  FORGOT PASSWORD?
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Don't worry! Enter your registered email
                  address to reset your password.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-[#E8BD55]" />
                <h2 className="text-2xl font-bold">
                  VERIFY YOUR EMAIL
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Enter the 6-digit verification code sent to:
                </p>
                <p className="mt-2 break-all text-sm text-[#E8BD55]">
                  {email}
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <LockKeyhole className="mx-auto mb-4 h-10 w-10 text-[#E8BD55]" />
                <h2 className="text-2xl font-bold">
                  CREATE NEW PASSWORD
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Your email is verified. Create a strong
                  new password for your account.
                </p>
              </>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={sendCode} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#E8BD55]"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    SENDING...
                  </>
                ) : (
                  "CONTINUE"
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyCode} className="space-y-5">
              <div>
                <label
                  htmlFor="code"
                  className="mb-3 block text-sm font-semibold text-[#E8BD55]"
                >
                  6-DIGIT VERIFICATION CODE
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className={`${inputClass} text-center text-2xl font-bold tracking-[0.5em]`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "VERIFY CODE"
                )}
              </button>

              <button
                type="button"
                onClick={resendCode}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-[#E8BD55] hover:text-[#F5DFA8] disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                RESEND CODE
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={resetPassword} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-[#E8BD55]"
                >
                  NEW PASSWORD
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8BD55]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#E8BD55]"
                >
                  CONFIRM NEW PASSWORD
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E8BD55]"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Password must contain at least 8 characters.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    UPDATING...
                  </>
                ) : (
                  "RESET PASSWORD"
                )}
              </button>

              {success && (
                <Link
                  href="/login"
                  className={`${buttonClass} no-underline`}
                >
                  GO TO LOGIN
                </Link>
              )}
            </form>
          )}

          <div className="mt-7 border-t border-white/10 pt-5 text-center">
            {step === 1 ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8BD55] hover:text-[#F5DFA8]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");
                  setStep(step - 1);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#E8BD55] hover:text-[#F5DFA8]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © 2026 HEWAD COIN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
