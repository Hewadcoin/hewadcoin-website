
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const OWNER_EMAIL = "khattakabid1122@gmail.com";
const OWNER_CODE = "khattakabid";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [personalCode, setPersonalCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [defaultCodeLoaded, setDefaultCodeLoaded] = useState(false);
  const [otp, setOtp] = useState("");
  const [awaitingVerification, setAwaitingVerification] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwner = email.trim().toLowerCase() === OWNER_EMAIL;

  useEffect(() => {
    let active = true;

    async function loadDefaultReferral() {
      const { data, error } = await supabase.rpc(
        "get_registration_default_referral_code"
      );

      if (!active) return;

      if (!error && data) {
        setReferralCode((current) => current || data);
      }

      setDefaultCodeLoaded(true);
    }

    loadDefaultReferral();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isOwner) {
      setReferralCode("");
      setPersonalCode(OWNER_CODE);
    } else {
      setPersonalCode((current) =>
        current.toLowerCase() === OWNER_CODE ? "" : current
      );
    }
  }, [isOwner]);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !firstName.trim() ||
      !username.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      (!isOwner && (!referralCode.trim() || !personalCode.trim()))
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanPersonalCode = isOwner
      ? OWNER_CODE
      : personalCode.trim().toLowerCase();

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError("Username must be 3-20 letters, numbers or underscores.");
      return;
    }

    if (!/^[a-z0-9_]{4,20}$/.test(cleanPersonalCode)) {
      setError(
        "Your personal referral code must be 4-20 letters, numbers or underscores."
      );
      return;
    }

    if (!isOwner && cleanPersonalCode === OWNER_CODE) {
      setError("This personal referral code is reserved.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            username: cleanUsername,
            mobile_number: mobile.trim(),
            referred_by_code: isOwner
              ? ""
              : referralCode.trim().toLowerCase(),
            referral_code: cleanPersonalCode,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.session) {
        setSuccess("Account created successfully.");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setAwaitingVerification(true);
      setSuccess(
        "A verification code has been sent to your email. Enter the 6-digit code below."
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[0-9]{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: "signup",
      });

      if (verifyError) {
        throw verifyError;
      }

      setSuccess("Email verified successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });

      if (resendError) {
        throw resendError;
      }

      setSuccess("A new verification code has been sent.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not resend the code.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-emerald-800">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Create your secure account
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {!awaitingVerification ? (
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  First Name *
                </label>
                <input
                  className={inputClass}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Last Name
                </label>
                <input
                  className={inputClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Username *
                </label>
                <input
                  className={inputClass}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mobile Number *
                </label>
                <input
                  className={inputClass}
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email Address *
                </label>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <label className="mb-2 block font-semibold text-emerald-900">
                Invitation Referral Code *
              </label>

              {isOwner ? (
                <div className="rounded-lg bg-white p-3 text-sm text-emerald-800">
                  Owner account: no invitation code required.
                </div>
              ) : (
                <>
                  <input
                    className={inputClass}
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder={
                      defaultCodeLoaded
                        ? "Enter your inviter's code"
                        : "Loading invitation code..."
                    }
                    required
                  />
                  <p className="mt-2 text-xs text-emerald-800">
                    For the first 10 accounts, khattakabid is suggested
                    automatically. You may change it to another valid code.
                  </p>
                </>
              )}
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <label className="mb-2 block font-semibold text-blue-900">
                Your Personal Referral Code *
              </label>

              <input
                className={inputClass}
                value={personalCode}
                onChange={(e) => setPersonalCode(e.target.value)}
                placeholder="Example: ABID786"
                required
                disabled={isOwner}
              />

              <p className="mt-2 text-xs text-blue-800">
                Choose your own unique code. Other people can use it to join
                through your invitation.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Password *
              </label>
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Confirm Password *
              </label>
              <input
                className={inputClass}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || (!defaultCodeLoaded && !isOwner)}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">
                Verify Your Email
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Enter the 6-digit code sent to {email}.
              </p>
            </div>

            <input
              className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full rounded-xl border border-emerald-700 px-5 py-3 font-semibold text-emerald-800 disabled:opacity-50"
            >
              Resend Code
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
