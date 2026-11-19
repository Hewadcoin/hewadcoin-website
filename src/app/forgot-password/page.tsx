
"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);

  function sendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Email verification will be activated after Supabase setup.");
    setStep(2);
  }

  function verifyCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert("Code verification will be activated after Supabase setup.");
    setStep(3);
  }

  function resetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }

    alert("Password reset will be activated after Supabase setup.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm md:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            The Future of Global Trading
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold">
          Forgot Password?
        </h2>

        <p className="mb-7 text-sm leading-6 text-gray-500">
          Recover your account securely using your registered email address.
        </p>

        <div className="mb-7 flex items-center justify-between">
          {[1, 2, 3].map((number) => (
            <div key={number} className="flex flex-1 items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${
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

        {step === 1 && (
          <form onSubmit={sendCode} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717]"
            >
              Send Verification Code
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verifyCode} className="space-y-5">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code sent to your registered email.
            </p>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="w-full rounded-lg border border-gray-300 p-3 text-center text-xl tracking-[0.5em] outline-none focus:border-[#C62828]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717]"
            >
              Verify Code
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm font-semibold text-[#C62828]"
            >
              Change Email Address
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetPassword} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717]"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-gray-600">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-[#C62828]"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </main>
  );
}
