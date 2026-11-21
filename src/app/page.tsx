
"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
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
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-[#080808] px-5 text-white">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-[#bd8b13]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-28 bottom-20 h-72 w-72 rounded-full bg-[#bd8b13]/10 blur-[100px]" />

      {/* Background logo watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/hewad-coin-logo.jpg"
          alt=""
          className="h-72 w-72 rounded-full object-cover opacity-[0.035]"
        />
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen min-h-[100svh] w-full max-w-[430px] flex-col items-center">

        {/* Logo and welcome */}
        <div className="w-full pt-14 text-center">

          <div className="mb-6 flex justify-center">
            <div className="rounded-full border-2 border-[#D6AD52] p-1 shadow-[0_0_35px_rgba(214,173,82,0.18)]">
              <img
                src="/hewad-coin-logo.jpg"
                alt="HEWAD COIN Logo"
                className="h-28 w-28 rounded-full object-cover"
              />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-[3px] text-[#E4BD68]">
            HEWAD COIN
          </h1>

          <div className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-[#D6AD52]" />

          <h2 className="mt-6 text-xl font-bold tracking-wide text-white">
            WELCOME TO HEWAD COIN
          </h2>

          <p className="mt-4 text-sm font-semibold leading-7 text-[#E4BD68]">
            Your Future. Your Opportunity. Your Hewad Coin.
          </p>

          <p className="mx-auto mt-3 max-w-[320px] text-sm leading-7 text-gray-400">
            Join our community and discover new opportunities with HEWAD COIN.
          </p>

        </div>

        {/* Main buttons */}
        <div className="mt-auto w-full pb-9 pt-12">

          <div className="mx-auto flex w-full max-w-[340px] flex-col gap-4">

            {/* Create Account */}
            <Link
              href="/register"
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border border-[#F0CF79] bg-gradient-to-r from-[#C8952E] to-[#F1D17B] px-4 text-sm font-extrabold tracking-wide text-black shadow-[0_5px_25px_rgba(214,173,82,0.18)] transition hover:brightness-110 active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              CREATE ACCOUNT
            </Link>

            {/* Login */}
            <Link
              href="/login"
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border border-[#D6AD52] bg-[#15130F] px-4 text-sm font-bold tracking-wide text-[#E4BD68] transition hover:bg-[#211C12] active:scale-[0.98]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
              </svg>
              LOGIN
            </Link>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border border-[#45413A] bg-[#171717] px-4 text-sm font-bold tracking-wide text-white transition hover:bg-[#222222] active:scale-[0.98] disabled:opacity-60"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 24.5c0-1.5-.1-2.9-.4-4.3H24v8.1h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.8 6-15.2z"/>
                <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3C9.3 39.5 16.1 44 24 44z"/>
                <path fill="#4A90E2" d="M12.8 27.6a12 12 0 0 1 0-7.2v-5.3H5.9a20 20 0 0 0 0 17.8z"/>
                <path fill="#EA4335" d="M24 12.2c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4 16.1 4 9.3 8.5 5.9 15.1l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2z"/>
              </svg>
              {loading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
            </button>

          </div>

          {error && (
            <p className="mx-auto mt-4 max-w-[340px] rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-center text-xs text-red-400">
              {error}
            </p>
          )}

          <div className="mx-auto mt-8 h-px w-full max-w-[250px] bg-gradient-to-r from-transparent via-[#80652F] to-transparent" />

          <p className="mt-5 text-center text-[11px] tracking-wide text-gray-500">
            © 2026 HEWAD COIN. All rights reserved.
          </p>

        </div>
      </section>
    </main>
  );
}
