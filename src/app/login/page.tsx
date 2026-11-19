
"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Welcome Back
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          Login to your HEWAD COIN account.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Email and username login will be activated after Supabase setup.");
          }}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Email Address or Username
            </label>

            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter email or username"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Password
            </label>

            <div className="flex rounded-lg border border-gray-300 focus-within:border-[#C62828]">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg p-3 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-3 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#C62828]"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white transition hover:bg-[#8E1717]"
          >
            Login
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <Link
          href="/auth/google"
          className="block w-full rounded-xl border border-gray-300 py-3 text-center font-semibold transition hover:bg-gray-50"
        >
          Continue with Google
        </Link>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#C62828]"
          >
            Create Account
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
        </p>

      </div>
    </main>
  );
}
