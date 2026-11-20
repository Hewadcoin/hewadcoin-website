
"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function sendCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim()
      );

      if (error) {
        setError(error.message);
      } else {
        setStep(2);
        setSuccess("A 6-digit verification code has been sent to your email.");
      }
    } catch {
      setError("Unable to send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "recovery",
      });

      if (error) {
        setError("Invalid or expired verification code.");
      } else {
        setStep(3);
        setSuccess("Email verified. You can create a new password.");
      }
    } catch {
      setError("Code verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: FormEvent<HTMLFormElement>) {
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

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Your password has been successfully changed.");

        await supabase.auth.signOut();

        router.push("/login");
        router.refresh();
      }
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-[#F4F5F7] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-9">

        <div className="mb-8 text-center">
          <img
            src="/hewad-coin-logo.jpg"
            alt="HEWAD COIN Logo"
            className="mx-auto mb-3 h-28 w-28 object-contain"
          />

          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            The Future of Global Trading
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Forgot Password?
        </h2>

        <p className="mb-7 text-sm leading-6 text-gray-500">
          Recover your account securely using your registered email.
        </p>

        <div className="mb-7 flex items-center justify-between">
          {[1, 2, 3].map((number) => (
            <div key={number} className="flex flex-1 items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                  step >= number
                    ? "bg-[#C62828] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {number}
              </div>

              {number !== 3 && (
                <div className="mx-2 h-1 flex-1 rounded bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={sendCode} className="space-y-5">
            <label className="block text-sm font-semibold text-gray-800">
              REGISTERED EMAIL ADDRESS
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#C62828]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C62828] py-4 font-bold text-white hover:bg-[#8E1717] disabled:opacity-60"
            >
              {loading ? "SENDING..." : "SEND VERIFICATION CODE"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyCode} className="space-y-5">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to:
              <strong className="block mt-1">{email}</strong>
            </p>

            <label className="block text-sm font-semibold text-gray-800">
              VERIFICATION CODE
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              minLength={6}
              required
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="w-full rounded-xl border border-gray-300 px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-[#C62828]"
            />

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full rounded-xl bg-[#C62828] py-4 font-bold text-white hover:bg-[#8E1717] disabled:opacity-60"
            >
              {loading ? "VERIFYING..." : "VERIFY CODE"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm font-semibold text-[#C62828]"
            >
              CHANGE EMAIL ADDRESS
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                NEW PASSWORD
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#C62828]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                CONFIRM NEW PASSWORD
              </label>

              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 outline-none focus:border-[#C62828]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#C62828] py-4 font-bold text-white hover:bg-[#8E1717] disabled:opacity-60"
            >
              {loading ? "UPDATING..." : "RESET PASSWORD"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#C62828] hover:underline"
          >
            BACK TO LOGIN
          </Link>
        </p>

        <p className="mt-7 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
