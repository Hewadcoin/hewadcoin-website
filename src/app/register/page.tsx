
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!firstName.trim() || !username.trim() || !mobile.trim() ||
        !referralCode.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      setError("Username must be 3–20 characters (letters, numbers, underscore).");
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(mobile.trim())) {
      setError("Please enter a valid mobile number.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: username.trim(),
            mobile_number: mobile.trim(),
            referred_by_code: referralCode.trim().toUpperCase(),
          },
        },
      });

      if (signupError) {
        const message = signupError.message.toLowerCase();

        if (message.includes("already registered") || message.includes("already exists")) {
          throw new Error("This email is already registered.");
        }

        if (message.includes("profiles_username_unique") || message.includes("username")) {
          throw new Error("This username may already be taken.");
        }

        if (message.includes("profiles_mobile_unique") || message.includes("mobile_number")) {
          throw new Error("This mobile number may already be registered.");
        }

        throw signupError;
      }

      if (!data.user) {
        throw new Error("Account registration could not be completed.");
      }

      if (data.session) {
        setSuccess("Your account has been created successfully!");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setAwaitingVerification(true);
      setSuccess("A 6-digit verification code has been sent to your email. Please check your inbox.");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "signup",
      });

      if (verifyError) {
        throw new Error("Invalid or expired verification code. Please try again.");
      }

      setSuccess("Email verified successfully! Welcome to HEWAD COIN.");

      router.push("/dashboard");
      router.refresh();

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Email verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });

      if (resendError) throw resendError;

      setSuccess("A new verification code has been sent to your email.");
      setOtp("");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not resend the verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm md:p-10">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#C62828]">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create Your Account
          </p>
        </div>

        {!awaitingVerification ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Register
            </h2>

            <form onSubmit={handleRegister} className="space-y-5">

              <div className="grid gap-4 md:grid-cols-3">
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  className="w-full rounded-lg border p-3"
                />

                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name (Optional)"
                  className="w-full rounded-lg border p-3"
                />

                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile Number (+93...)"
                  className="w-full rounded-lg border p-3"
                />

                <input
                  required
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Invitation / Referral Code"
                  className="w-full rounded-lg border p-3"
                />
              </div>

              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-lg border p-3"
              />

              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (at least 8 characters)"
                className="w-full rounded-lg border p-3"
              />

              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full rounded-lg border p-3"
              />

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717] disabled:opacity-60"
              >
                {loading ? "Creating Account..." : "Continue"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              disabled
              className="w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-400"
            >
              Google Registration (Coming Soon)
            </button>
          </>
        ) : (
          <div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 text-center">
              Verify Your Email
            </h2>

            <p className="mb-6 text-center text-sm text-gray-600">
              We sent a 6-digit verification code to:
              <strong className="block mt-2">{email}</strong>
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              <input
                required
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-xl border-2 border-[#15966a] p-4 text-center text-3xl font-bold tracking-[0.5em]"
              />

              {error && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-xl bg-[#C62828] py-3 font-bold text-white hover:bg-[#8E1717] disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="mt-4 w-full rounded-xl border border-gray-300 py-3 font-semibold text-gray-700 disabled:opacity-60"
            >
              Resend Verification Code
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#C62828]">
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}
