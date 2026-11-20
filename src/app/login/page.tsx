
"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setGoogleLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message);
        setGoogleLoading(false);
      }
    } catch {
      setError("Google login could not start. Please try again.");
      setGoogleLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-[#F4F5F7] px-4 py-8">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035]">
        <img
          src="/hewad-coin-logo.jpg"
          alt=""
          className="w-[340px] max-w-full object-contain"
        />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-9">

        <div className="mb-7 text-center">
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

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome Back
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Login to your HEWAD COIN account.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              EMAIL ADDRESS
            </label>

            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-base outline-none transition focus:border-[#C62828] focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              PASSWORD
            </label>

            <div className="flex rounded-xl border border-gray-300 transition focus-within:border-[#C62828] focus-within:ring-2 focus-within:ring-red-100">
              <input
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full min-w-0 rounded-xl px-4 py-3.5 text-base outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 text-sm font-semibold text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-[#C62828] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl bg-[#C62828] py-4 font-bold text-white transition hover:bg-[#8E1717] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white py-4 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
        >
          <svg
            viewBox="0 0 48 48"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.95 46.98 31.86 46.98 24.55Z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.95 23.95 0 0 0 0 21.56l7.98-6.19Z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
          </svg>

          {googleLoading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
        </button>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#C62828] hover:underline"
          >
            CREATE ACCOUNT
          </Link>
        </p>

        <p className="mt-7 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
        </p>

      </div>
    </main>
  );
}
