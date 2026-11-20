
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const OWNER_EMAIL = "khattakabid1122@gmail.com";
const OWNER_CODE = "khattakabid";
const LOGO_PATH = "/hewad-coin-logo.jpg";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
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

    async function loadDefaultCode() {
      const { data, error } = await supabase.rpc(
        "get_registration_default_referral_code"
      );

      if (!active) return;

      if (error) {
        setError("Unable to load invitation information. Please try again.");
        setDefaultCodeLoaded(false);
        return;
      }

      if (data) {
        setInvitationCode(String(data));
      }

      setDefaultCodeLoaded(true);
    }

    loadDefaultCode();

    return () => {
      active = false;
    };
  }, [supabase]);

  function createPersonalReferralCode() {
    const number = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");

    return `H${number}`;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (awaitingVerification) {
      if (otp.length !== 6) {
        setError("Please enter the complete 6-digit verification code.");
        return;
      }

      setLoading(true);

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp,
        type: "signup",
      });

      setLoading(false);

      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      setSuccess("Your email has been verified successfully.");
      router.push("/login");
      router.refresh();
      return;
    }

    if (!name.trim() || !mobile.trim() || !email.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!isOwner && !defaultCodeLoaded) {
      setError("Invitation information is still loading. Please wait.");
      return;
    }

    if (!isOwner && !invitationCode.trim()) {
      setError("Invitation Code is required.");
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

    setLoading(true);

    const personalReferralCode = isOwner
      ? OWNER_CODE
      : createPersonalReferralCode();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      phone: mobile.trim(),
      options: {
        data: {
          first_name: name.trim(),
          last_name: "",
          username: "",
          mobile_number: mobile.trim(),
          referral_code: personalReferralCode,
          referred_by_code: isOwner ? "" : invitationCode.trim(),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (!data.user) {
      setError("Account registration could not be completed. Please try again.");
      return;
    }

    setAwaitingVerification(true);
    setSuccess(
      "Your account was created. Please check your email for the 6-digit verification code."
    );
  }

  async function resendCode() {
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setSuccess("A new verification code has been sent to your email.");
  }

  const labelClass =
    "mb-1.5 block text-xs font-bold tracking-wide text-gray-800";

  const fieldClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:bg-gray-100";

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-white px-4 py-8 text-gray-900"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.91), rgba(255,255,255,0.94)), url("${LOGO_PATH}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-white/20" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white/95 p-5 shadow-xl backdrop-blur-sm sm:p-7">

          <header className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-36 w-36 items-center justify-center overflow-hidden rounded-full">
              <img
                src={LOGO_PATH}
                alt="HEWAD COIN Golden H Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <h1 className="text-2xl font-extrabold tracking-wide text-gray-950">
              HEWAD COIN
            </h1>

            <h2 className="mt-3 text-lg font-extrabold text-gray-900">
              CREATE YOUR ACCOUNT
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Join the Future of Global Trading
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!awaitingVerification ? (
              <>
                <div>
                  <label className={labelClass}>NAME *</label>
                  <input
                    className={fieldClass}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>MOBILE NUMBER *</label>
                    <input
                      className={fieldClass}
                      type="tel"
                      inputMode="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+93 Mobile"
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>INVITATION CODE *</label>
                    <input
                      className={fieldClass}
                      type="text"
                      value={isOwner ? "" : invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value)}
                      placeholder={
                        defaultCodeLoaded
                          ? "Enter code"
                          : "Loading..."
                      }
                      disabled={!defaultCodeLoaded || isOwner}
                      required={!isOwner}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>EMAIL ADDRESS *</label>
                  <input
                    className={fieldClass}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>PASSWORD *</label>
                  <input
                    className={fieldClass}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>CONFIRM PASSWORD *</label>
                  <input
                    className={fieldClass}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  VERIFY YOUR EMAIL
                </h2>

                <p className="text-sm text-gray-600">
                  We sent a 6-digit verification code to:
                </p>

                <p className="break-all font-semibold text-yellow-700" dir="ltr">
                  {email}
                </p>

                <input
                  className={`${fieldClass} text-center text-2xl tracking-[0.5em]`}
                  type="text"
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
                  type="button"
                  onClick={resendCode}
                  disabled={loading}
                  className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                >
                  RESEND VERIFICATION CODE
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!awaitingVerification && !defaultCodeLoaded && !isOwner)}
              className="w-full rounded-xl bg-yellow-400 px-5 py-3.5 font-extrabold tracking-wide text-black shadow-sm transition hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "PLEASE WAIT..."
                : awaitingVerification
                  ? "VERIFY EMAIL"
                  : "CONTINUE"}
            </button>
          </form>

          {!awaitingVerification && (
            <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-extrabold text-red-600 hover:underline"
              >
                LOGIN
              </Link>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          © 2026 HEWAD COIN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
