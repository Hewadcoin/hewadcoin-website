
"use client";

import Link from "next/link";
import { useState } from "react";

export default function KYCPage() {
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Afghanistan");
  const [idNumber, setIdNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  function submitKYC(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!idFront || !idBack || !selfie) {
      alert("Please upload all required identity photos.");
      return;
    }

    alert(
      "KYC form is ready. Secure document upload and admin review will be activated after Supabase setup."
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-7 shadow-sm md:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Identity Verification
          </p>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          KYC Verification
        </h2>

        <p className="mb-6 text-sm leading-6 text-gray-600">
          Complete your identity information and upload the required
          documents to verify your account.
        </p>

        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm leading-6 text-yellow-800">
            Your identity documents are private and must only be accessible
            to authorized verification administrators.
          </p>
        </div>

        <form onSubmit={submitKYC} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Full Name
            </label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full legal name"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Country
            </label>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none focus:border-[#C62828]"
            >
              <option value="Afghanistan">Afghanistan</option>
              <option value="Pakistan">Pakistan</option>
              <option value="India">India</option>
              <option value="Iran">Iran</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              ID / Tazkira Number
            </label>
            <input
              required
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your identity number"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Mobile Number
            </label>
            <input
              required
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+93 7XX XXX XXX"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-[#C62828]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              ID Front Photo
            </label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setIdFront(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              ID Back Photo
            </label>
            <input
              required
              type="file"
              accept="image/*"
              onChange={(e) => setIdBack(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Selfie / Live Face Photo
            </label>
            <input
              required
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white transition hover:bg-[#8E1717]"
          >
            Submit KYC Verification
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          <Link href="/login" className="font-bold text-[#C62828]">
            Back to Login
          </Link>
        </p>

      </div>
    </main>
  );
}
