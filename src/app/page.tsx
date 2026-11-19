
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#171717]">
      <header className="flex items-center justify-between border-b bg-white px-5 py-4">
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

      <section className="mx-auto max-w-5xl px-5 py-16 text-center">
        <p className="mb-3 font-semibold text-[#C62828]">
          WELCOME TO HEWAD COIN
        </p>

        <h2 className="text-4xl font-extrabold leading-tight md:text-6xl">
          The Future of
          <span className="block text-[#C62828]">
            Global Trading
          </span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-gray-600">
          Welcome to HEWAD COIN. Create your account and
          become part of our growing digital community.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-[#C62828] px-8 py-3 font-bold text-white transition hover:bg-[#8E1717]"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="rounded-xl border-2 border-[#C62828] px-8 py-3 font-bold text-[#C62828] transition hover:bg-red-50"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-16 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-7 shadow-sm">
          <div className="mb-4 text-3xl">👤</div>
          <h3 className="mb-2 text-lg font-bold">User Account</h3>
          <p className="text-sm leading-6 text-gray-600">
            Create and manage your personal account securely.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-sm">
          <div className="mb-4 text-3xl">🔐</div>
          <h3 className="mb-2 text-lg font-bold">Account Security</h3>
          <p className="text-sm leading-6 text-gray-600">
            Secure account access and email verification.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-sm">
          <div className="mb-4 text-3xl">🌐</div>
          <h3 className="mb-2 text-lg font-bold">Global Community</h3>
          <p className="text-sm leading-6 text-gray-600">
            Join the HEWAD COIN digital community.
          </p>
        </div>
      </section>

      <footer className="border-t bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
      </footer>
    </main>
  );
}
