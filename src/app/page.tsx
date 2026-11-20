
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
    <main className="relative flex min-h-screen min-h-[100svh] items-center justify-center overflow-hidden bg-[#fafafa] px-5 py-5 text-gray-900">

      {/* Background watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <img
          src="/hewad-coin-logo.jpg"
          alt=""
          className="h-72 w-72 rounded-full object-cover opacity-[0.035]"
        />
      </div>

      <section className="relative z-10 flex min-h-[calc(100svh-40px)] w-full max-w-[370px] flex-col text-center">

        {/* Logo and welcome text */}
        <div className="pt-5">
          <div className="mb-5 flex justify-center">
            <img
              src="/hewad-coin-logo.jpg"
              alt="HEWAD COIN Logo"
              className="h-[90px] w-[90px] rounded-full border border-yellow-300 object-cover shadow-sm"
            />
          </div>

          <h1 className="text-[23px] font-extrabold tracking-[1.5px] text-[#bd8b13]">
            HEWAD COIN
          </h1>

          <h2 className="mt-2 text-[17px] font-bold tracking-wide">
            WELCOME TO HEWAD COIN
          </h2>

          <p className="mt-3 text-[13px] leading-6 text-gray-600">
            Your Future. Your Opportunity. Your Hewad Coin.
          </p>

          <p className="mx-auto mt-2 max-w-[310px] text-[12px] leading-5 text-gray-500">
            Join our community and discover new opportunities with HEWAD COIN.
          </p>
        </div>

        {/* Buttons at the bottom */}
        <div className="mt-auto w-full pb-2 pt-8">

          <div className="mx-auto flex w-full max-w-[290px] flex-col gap-[10px]">

            <Link
              href="/register"
              className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#ffdc32] px-4 text-[13px] font-bold text-black shadow-sm transition hover:bg-[#f5cf19] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
              CREATE ACCOUNT
            </Link>

            <Link
              href="/login"
              className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#df3434] px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#c92727] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
              </svg>
              LOGIN
            </Link>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex h-[44px] w-full items-center justify-center gap-3 rounded-xl bg-[#219653] px-4 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#187c43] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 24.5c0-1.5-.1-2.9-.4-4.3H24v8.1h11a9.4 9.4 0 0 1-4.1 6.2v5.2h6.7c3.9-3.6 6-8.8 6-15.2z"/>
                <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.2c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3C9.3 39.5 16.1 44 24 44z"/>
                <path fill="#4A90E2" d="M12.8 27.6a12 12 0 0 1 0-7.2v-5.3H5.9a20 20 0 0 0 0 17.8z"/>
                <path fill="#EA4335" d="M24 12.2c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 6.1 29.5 4 24 4 16.1 4 9.3 8.5 5.9 15.1l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2z"/>
              </svg>

              {loading ? "CONNECTING..." : "CONTINUE WITH GOOGLE"}
            </button>

          </div>

          {error && (
            <p className="mx-auto mt-3 max-w-[290px] rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <p className="mt-5 text-[11px] text-gray-400">
            © 2026 HEWAD COIN. All rights reserved.
          </p>
        </div>
      </section>
    </main>
  );
}
