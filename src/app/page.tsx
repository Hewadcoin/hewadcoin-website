
"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function continueWithGoogle() {
    try {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch {
      setError("Unable to connect with Google. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden bg-white px-5 py-8 text-[#171717]">

      {/* Background watermark */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <img
          src="/hewad-coin-logo.jpg"
          alt=""
          className="h-[75vw] w-[75vw] max-w-[480px] object-contain opacity-[0.035]"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">

        {/* Main logo */}
        <div className="mb-5 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full">
          <img
            src="/hewad-coin-logo.jpg"
            alt="HEWAD COIN Logo"
            className="h-full w-full object-contain"
          />
        </div>

        {/* Brand */}
        <h1 className="text-4xl font-black tracking-wide text-[#B8860B]">
          HEWAD COIN
        </h1>

        <h2 className="mt-4 text-xl font-extrabold text-[#222222]">
          WELCOME TO HEWAD COIN
        </h2>

        <p className="mt-3 max-w-sm text-sm leading-6 text-gray-600">
          Your Future. Your Opportunity. Your Hewad Coin.
          Join our growing digital community.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex w-full flex-col gap-5">

          {/* Create Account */}
          <Link
            href="/register"
            className="flex min-h-[68px] w-full items-center justify-center gap-4 rounded-2xl bg-[#F5C400] px-5 py-4 text-lg font-extrabold text-[#171717] shadow-md transition hover:bg-[#E5B800] active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-7 w-7"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="10" cy="7" r="4" />
              <path d="M20 8v6M23 11h-6" />
            </svg>
            CREATE ACCOUNT
          </Link>

          {/* Login */}
          <Link
            href="/login"
            className="flex min-h-[68px] w-full items-center justify-center gap-4 rounded-2xl bg-[#E53935] px-5 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[#C62828] active:scale-[0.98]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <path d="M10 17l5-5-5-5M15 12H3" />
            </svg>
            LOGIN
          </Link>

          {/* Google */}
          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={loading}
            className="flex min-h-[68px] w-full items-center justify-center gap-4 rounded-2xl bg-[#16A34A] px-5 py-4 text-lg font-extrabold text-white shadow-md transition hover:bg-[#15803D] active:scale-[0.98] disabled:opacity-60"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-8 w-8 rounded-full bg-white p-1"
              aria-label="Google"
            >
              <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.9 6-15z"/>
              <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44z"/>
              <path fill="#FBBC05" d="M12.8 27.7a12 12 0 0 1 0-7.4V15H5.9a20 20 0 0 0 0 18z"/>
              <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.1 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2z"/>
            </svg>
            {loading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
          </button>

        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <p className="mt-9 text-xs text-gray-500">
          Secure Access • Account Protection
        </p>

        <p className="mt-3 text-xs text-gray-400">
          © {new Date().getFullYear()} HEWAD COIN
        </p>

      </div>
    </main>
  );
}
