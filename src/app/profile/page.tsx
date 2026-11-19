
import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-8">
      <div className="mx-auto max-w-3xl">

        <header className="mb-8">
          <h1 className="text-2xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            My Profile
          </p>
        </header>

        <section className="rounded-2xl bg-[#101010] p-7 text-white shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D4AF37] text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold">My Account</h2>
              <p className="mt-1 text-sm text-gray-300">
                HEWAD COIN Member
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-700 pt-5">
            <p className="text-xs text-gray-400">Membership</p>
            <p className="mt-1 font-bold text-[#D4AF37]">
              HEWAD MEMBER
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-bold">Personal Information</h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="mt-1 font-semibold">Not available yet</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Username</p>
              <p className="mt-1 font-semibold">Not available yet</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="mt-1 font-semibold">Not available yet</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Mobile Number</p>
              <p className="mt-1 font-semibold">Not available yet</p>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-3">
          <Link
            href="/kyc"
            className="block rounded-xl bg-white p-4 font-semibold shadow-sm transition hover:shadow-md"
          >
            🪪 Identity Verification
            <span className="float-right text-[#C62828]">→</span>
          </Link>

          <Link
            href="/forgot-password"
            className="block rounded-xl bg-white p-4 font-semibold shadow-sm transition hover:shadow-md"
          >
            🔐 Change Password
            <span className="float-right text-[#C62828]">→</span>
          </Link>

          <Link
            href="/recovery"
            className="block rounded-xl bg-white p-4 font-semibold shadow-sm transition hover:shadow-md"
          >
            🛟 Account Support
            <span className="float-right text-[#C62828]">→</span>
          </Link>

          <Link
            href="/dashboard"
            className="block rounded-xl border border-[#C62828] p-4 text-center font-bold text-[#C62828]"
          >
            Back to Dashboard
          </Link>
        </section>

      </div>
    </main>
  );
}
