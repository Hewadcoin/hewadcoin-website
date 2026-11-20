
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2 | 3;

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-4 text-base text-gray-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100";

  const buttonClass =
    "w-full rounded-xl bg-[#E0B02E] px-5 py-4 text-center text-lg font-bold text-[#251B08] shadow-md transition hover:bg-[#D2A01F] disabled:cursor-not-allowed disabled:opacity-60";

  async function sendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail
      );

      if (error) throw error;

      setEmail(cleanEmail);
      setStep(2);
      setSuccess("Verification code sent. Please check your email.");
    } catch (err: any) {
      setError(err.message || "Unable to send verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(code)) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });

      if (error) throw error;

      setStep(3);
      setSuccess("Email verified successfully. Create your new password.");
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) throw error;

      setSuccess("A new verification code has been sent to your email.");
      setCode("");
    } catch (err: any) {
      setError(err.message || "Unable to resend verification code.");
    } finally {
      setLoading(false);
    }
  }

  async function updatePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setSuccess("Your password has been changed successfully!");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    setSuccess("");
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      setCode("");
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-x-hidden bg-[#F7F7F5] px-4 py-7 sm:px-6">

      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-[130px] font-black text-yellow-500/[0.035] sm:text-[190px]">
          HEWAD
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[460px] flex-col">

        {/* Main Logo */}
        <div className="mb-5 flex flex-col items-center text-center">
          <img
            src="/hewad-coin-logo.jpg"
            alt="HEWAD COIN Logo"
            className="h-24 w-24 rounded-full object-contain sm:h-28 sm:w-28"
          />

          <h1 className="mt-3 text-2xl font-extrabold tracking-wide text-[#A77A12] sm:text-3xl">
            HEWAD COIN
          </h1>

          <p className="mt-1 text-sm font-medium text-gray-500">
            The Future of Global Trading
          </p>
        </div>

        {/* Page Content */}
        <section className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-[0_8px_35px_rgba(0,0,0,0.07)] sm:px-8 sm:py-9">

          <div className="mb-7 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              {step === 1 && "Forgot Password?"}
              {step === 2 && "Verify Your Email"}
              {step === 3 && "Create New Password"}
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500 sm:text-base">
              {step === 1 &&
                "Please enter your registered email address."}
              {step === 2 &&
                "We have sent a 6-digit verification code to your registered email address."}
              {step === 3 &&
                "Please create a strong new password for your account."}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex items-center justify-center">
            {[1, 2, 3].map((number, index) => (
              <div key={number} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                    step >= number
                      ? "bg-[#DDB02F] text-white shadow-md"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step > number ? "✓" : number}
                </div>

                {index < 2 && (
                  <div
                    className={`h-[3px] w-12 sm:w-16 ${
                      step > number ? "bg-[#DDB02F]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
              {success}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={sendCode} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold tracking-wide text-gray-800">
                  EMAIL ADDRESS
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  required
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? "SENDING CODE..." : "CONTINUE"}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFICATION CODE */}
          {step === 2 && (
            <form onSubmit={verifyCode} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold tracking-wide text-gray-800">
                  ENTER VERIFICATION CODE
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  required
                  className={`${inputClass} text-center text-2xl font-bold tracking-[0.65em]`}
                />

                <p className="mt-3 break-all text-center text-xs text-gray-500">
                  Verification email: {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? "VERIFYING..." : "VERIFY CODE"}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn&apos;t receive the code?
                </p>

                <button
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="mt-2 font-bold text-[#A77A12] hover:underline disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={updatePassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold tracking-wide text-gray-800">
                  NEW PASSWORD
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className={`${inputClass} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#A77A12]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Password must contain at least 8 characters.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold tracking-wide text-gray-800">
                  CONFIRM NEW PASSWORD
                </label>

                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    required
                    className={`${inputClass} pr-16`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#A77A12]"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={buttonClass}
              >
                {loading ? "UPDATING PASSWORD..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          {/* Back Button */}
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              disabled={loading}
              className="mt-6 block w-full text-center text-sm font-bold text-[#A77A12] hover:underline"
            >
              ← Back
            </button>
          )}

          {/* Login Link */}
          <div className="mt-8 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm text-gray-500">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-bold text-[#A77A12] hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 pb-2 text-center text-xs text-gray-400">
          © 2026 HEWAD COIN. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
