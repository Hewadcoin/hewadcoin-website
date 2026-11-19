
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#171717]">

      <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-white px-5 py-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="text-xs text-gray-500">
            The Future of Global Trading
          </p>
        </div>

        <select
          aria-label="Select language"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          defaultValue="en"
        >
          <option value="en">English</option>
          <option value="ps">پښتو</option>
          <option value="fa">دری</option>
        </select>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">

        <div className="mb-8 rounded-2xl bg-[#101010] p-7 text-white shadow-md">
          <p className="text-sm text-gray-300">
            WELCOME TO
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-[#D4AF37]">
            HEWAD COIN
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            Your personal account dashboard.
            Manage your account and complete your verification.
          </p>
        </div>

        <h2 className="mb-5 text-xl font-bold">
          Account Services
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <Link
            href="/kyc"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">🪪</div>
            <h3 className="text-lg font-bold">KYC Verification</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Verify your identity and submit your documents.
            </p>
            <p className="mt-4 font-bold text-[#C62828]">
              Open Verification →
            </p>
          </Link>

          <Link
            href="/recovery"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">🛟</div>
            <h3 className="text-lg font-bold">Account Recovery</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Request help if you cannot access your account.
            </p>
            <p className="mt-4 font-bold text-[#C62828]">
              Get Support →
            </p>
          </Link>

          <Link
            href="/forgot-password"
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 text-3xl">🔐</div>
            <h3 className="text-lg font-bold">Password Recovery</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Recover access using your registered email.
            </p>
            <p className="mt-4 font-bold text-[#C62828]">
              Reset Password →
            </p>
          </Link>

        </div>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="font-bold">Account Security</h3>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Keep your account information private. Never share your password
            or verification codes with anyone.
          </p>
        </div>

      </section>

      <footer className="mt-10 border-t bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
      </footer>

    </main>
  );
}
