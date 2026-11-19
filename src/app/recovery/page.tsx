
"use client";

import Link from "next/link";
import { useState } from "react";

export default function RecoveryPage() {
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!reason.trim()) {
      alert("Please explain why you need account recovery.");
      return;
    }

    setSubmitted(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-sm md:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            The Future of Global Trading
          </p>
        </div>

        {!submitted ? (
          <>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Account Recovery
            </h2>

            <p className="mb-6 text-sm leading-6 text-gray-600">
              If you cannot access your account, explain your problem below.
              Our authorized support team will review your request.
            </p>

            <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm leading-6 text-yellow-800">
                Important: Do not send your password or private security codes.
                Identity documents will only be requested if your first request
                is approved.
              </p>
            </div>

            <form onSubmit={submitRequest} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Explain Your Recovery Problem
                </label>

                <textarea
                  required
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Example: I forgot the email address connected to my account..."
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white transition hover:bg-[#8E1717]"
              >
                Submit Recovery Request
              </button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mb-4 text-5xl">✓</div>

            <h2 className="mb-3 text-2xl font-bold text-green-700">
              Request Submitted
            </h2>

            <p className="text-sm leading-6 text-gray-600">
              Your request has been prepared. Actual submission and admin
              review will be activated after the secure Supabase connection.
            </p>
          </div>
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
