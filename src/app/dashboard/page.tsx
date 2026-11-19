
import Link from "next/link";

const services = [
  {
    icon: "🪪",
    title: "KYC Verification",
    description: "Verify your identity",
    href: "/kyc",
  },
  {
    icon: "👤",
    title: "My Profile",
    description: "Manage your personal information",
    href: "/profile",
  },
  {
    icon: "🛟",
    title: "Account Support",
    description: "Get help with your account",
    href: "/recovery",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F4F5F7] pb-10 text-[#171717]">

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
          defaultValue="en"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="en">English</option>
          <option value="ps">پښتو</option>
          <option value="fa">دری</option>
        </select>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-7">

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your HEWAD COIN account.
          </p>
        </div>

        <section className="relative overflow-hidden rounded-3xl bg-[#101010] p-7 text-white shadow-xl md:p-10">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[25px] border-[#D4AF37]/10" />

          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[3px] text-[#D4AF37]">
                  HEWAD COIN
                </p>
                <h3 className="mt-2 text-2xl font-extrabold">
                  PREMIUM CARD
                </h3>
              </div>
              <span className="rounded-full border border-[#D4AF37] px-4 py-2 text-xs font-bold text-[#D4AF37]">
                MEMBER
              </span>
            </div>

            <div className="mt-9">
              <p className="text-sm text-gray-400">
                Total Balance
              </p>
              <p className="mt-2 text-3xl font-extrabold text-[#D4AF37]">
                Not connected
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Your real balance will appear after account and wallet setup.
              </p>
            </div>

            <div className="mt-9 flex items-end justify-between border-t border-gray-700 pt-5">
              <div>
                <p className="text-xs text-gray-400">
                  CARD HOLDER
                </p>
                <p className="mt-1 font-bold">
                  HEWAD COIN MEMBER
                </p>
              </div>
              <p className="text-sm font-bold tracking-widest text-[#D4AF37]">
                HEWAD GOLD
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-extrabold">
              Our Services
            </h3>
            <span className="text-xs text-gray-500">
              Account Services
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
                  {service.icon}
                </div>
                <h4 className="font-bold">
                  {service.title}
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  {service.description}
                </p>
                <p className="mt-5 text-sm font-bold text-[#C62828]">
                  Open →
                </p>
              </Link>
            ))}
          </div>
        </section>

      </section>

      <footer className="mt-8 border-t bg-white px-5 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
      </footer>

    </main>
  );
}
