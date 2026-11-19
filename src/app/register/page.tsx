
"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create Your Account
          </p>
        </div>

        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Register
        </h2>

        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <input required placeholder="First Name" className="w-full rounded-lg border p-3" />
            <input required placeholder="Last Name" className="w-full rounded-lg border p-3" />
            <input required placeholder="Username" className="w-full rounded-lg border p-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input required type="tel" placeholder="Mobile Number (+93...)" className="w-full rounded-lg border p-3" />
            <input placeholder="Referral Code (Optional)" className="w-full rounded-lg border p-3" />
          </div>

          <input required type="email" placeholder="Email Address" className="w-full rounded-lg border p-3" />

          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            required
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          {confirmPassword && (
            <p className={`text-sm ${password === confirmPassword ? "text-green-600" : "text-red-600"}`}>
              {password === confirmPassword ? "Passwords match" : "Passwords do not match"}
            </p>
          )}

          <button
            type="button"
            className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717]"
          >
            Continue
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          className="w-full rounded-xl border border-gray-300 py-3 font-semibold"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#C62828]">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
