
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const OWNER_EMAIL = "khattakabid1122@gmail.com";
const OWNER_CODE = "khattakabid";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

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

    async function loadDefaultCode() {
      setDefaultCodeLoaded(false);

      if (isOwner) {
        setReferralCode("");
        setPersonalCode(OWNER_CODE);
        setDefaultCodeLoaded(true);
        return;
      }

      setPersonalCode("");

      const { data, error: rpcError } = await supabase.rpc(
        "get_registration_default_referral_code"
      );

      if (!active) return;

      if (rpcError) {
        console.error("Referral default error:", rpcError);
        setReferralCode("");
      } else {
        setReferralCode(typeof data === "string" ? data : "");
      }

      setDefaultCodeLoaded(true);
    }

    loadDefaultCode();

    return () => {
      active = false;
    };
  }, [supabase, isOwner]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (awaitingVerification) {
      if (!/^\d{6}$/.test(otp.trim())) {
        setError("مهرباني وکړئ د ایمیل ۶ عددي تایید کوډ ولیکئ.");
        return;
      }

      setLoading(true);

      try {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otp.trim(),
          type: "signup",
        });

        if (verifyError) throw verifyError;

        setSuccess("ستاسو ایمیل تایید شو. اوس د ننوتلو پاڼې ته ځئ.");
        setTimeout(() => router.push("/login"), 1200);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "د تایید کوډ ناسم دی یا وخت یې تېر شوی."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!firstName.trim()) {
      setError("خپل نوم ولیکئ.");
      return;
    }

    if (!username.trim()) {
      setError("خپل یوزرنیم ولیکئ.");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username.trim())) {
      setError("یوزرنیم باید ۳ تر ۲۰ تورو پورې وي؛ یوازې انګلیسي توري، شمېرې او _ وکاروئ.");
      return;
    }

    if (!mobile.trim()) {
      setError("د موبایل شمېره ولیکئ.");
      return;
    }

    if (!email.trim()) {
      setError("ایمیل ادرس ولیکئ.");
      return;
    }

    if (!isOwner && !defaultCodeLoaded) {
      setError("د Referral معلوماتو د چمتو کېدو لپاره لږ انتظار وکړئ.");
      return;
    }

    if (!isOwner && !referralCode.trim()) {
      setError("د بلنې Referral Code ولیکئ.");
      return;
    }

    const finalPersonalCode = isOwner
      ? OWNER_CODE
      : personalCode.trim().toLowerCase();

    if (!isOwner && !/^[a-z0-9_]{4,20}$/.test(finalPersonalCode)) {
      setError("شخصي Referral Code باید ۴ تر ۲۰ تورو پورې وي؛ انګلیسي کوچني توري، شمېرې او _ وکاروئ.");
      return;
    }

    if (!isOwner && finalPersonalCode === OWNER_CODE) {
      setError("دا Referral Code د مالک لپاره ځانګړی دی. بل کوډ انتخاب کړئ.");
      return;
    }

    if (password.length < 8) {
      setError("پاسورډ باید لږ تر لږه ۸ توري ولري.");
      return;
    }

    if (password !== confirmPassword) {
      setError("پاسورډونه یو له بل سره برابر نه دي.");
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
            username: username.trim().toLowerCase(),
            mobile_number: mobile.trim(),
            referral_code: finalPersonalCode,
            referred_by_code: isOwner ? "" : referralCode.trim().toLowerCase(),
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error("حساب جوړ نه شو. بیا هڅه وکړئ.");
      }

      if (data.session) {
        setSuccess("حساب جوړ شو. ایمیل مو تایید شوی دی.");
        setTimeout(() => router.push("/login"), 1200);
      } else {
        setAwaitingVerification(true);
        setSuccess("د تایید ۶ عددي کوډ ستاسو ایمیل ته ولېږل شو.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "د ثبت پر مهال ستونزه رامنځته شوه."
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });

      if (resendError) throw resendError;

      setSuccess("نوی تایید کوډ ستاسو ایمیل ته ولېږل شو.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "د کوډ په لېږلو کې ستونزه رامنځته شوه."
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7 text-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-emerald-700">
            HEWAD COIN
          </h1>
          <p className="mt-2 text-gray-600">
            {awaitingVerification
              ? "د ایمیل تایید"
              : "نوی حساب جوړ کړئ"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!awaitingVerification ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className={labelClass}>نوم *</label>
                    <input
                      className={fieldClass}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="خپل نوم"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>تخلص</label>
                    <input
                      className={fieldClass}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="تخلص (اختیاري)"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>یوزرنیم *</label>
                    <input
                      className={fieldClass}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>موبایل شمېره *</label>
                    <input
                      className={fieldClass}
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+93..."
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>ایمیل ادرس *</label>
                    <input
                      className={fieldClass}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {!isOwner && (
                  <div>
                    <label className={labelClass}>
                      د بلنې Referral Code *
                    </label>
                    <input
                      className={fieldClass}
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder={
                        defaultCodeLoaded
                          ? "د بلونکي Referral Code"
                          : "د Referral معلومات لوډ کېږي..."
                      }
                      disabled={!defaultCodeLoaded}
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      د لومړنیو لسو غیرمالک حسابونو لپاره د مالک کوډ
                      په اتومات ډول ښکاري. وروسته باید د بل موجود
                      کارونکي معتبر کوډ ولیکئ.
                    </p>
                  </div>
                )}

                <div>
                  <label className={labelClass}>
                    ستاسو شخصي Referral Code *
                  </label>
                  <input
                    className={fieldClass}
                    value={isOwner ? OWNER_CODE : personalCode}
                    onChange={(e) => setPersonalCode(e.target.value)}
                    placeholder="خپل ځانګړی کوډ انتخاب کړئ"
                    disabled={isOwner}
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    دا ستاسو خپل ځانګړی کوډ دی. نور کسان به یې د
                    بلنې لپاره کاروي. باید له نورو کوډونو سره توپیر ولري.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>پاسورډ *</label>
                    <input
                      className={fieldClass}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="لږ تر لږه ۸ توري"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>پاسورډ بیا ولیکئ *</label>
                    <input
                      className={fieldClass}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="پاسورډ تایید کړئ"
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  ایمیل تایید کړئ
                </h2>
                <p className="text-sm text-gray-600">
                  موږ دې ایمیل ته ۶ عددي کوډ لېږلی:
                </p>
                <p className="font-semibold text-emerald-700" dir="ltr">
                  {email}
                </p>
                <input
                  className={`${fieldClass} text-center text-2xl tracking-[0.5em]`}
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
                  className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-50"
                >
                  نوی تایید کوډ ولېږئ
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!awaitingVerification && !defaultCodeLoaded && !isOwner)}
              className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "مهرباني وکړئ انتظار وکړئ..."
                : awaitingVerification
                  ? "ایمیل تایید کړئ"
                  : "حساب جوړ کړئ"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
            مخکې حساب لرئ؟{" "}
            <Link
              href="/login"
              className="font-bold text-emerald-700 hover:underline"
            >
              ننوتل
            </Link>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} HEWAD COIN. All rights reserved.
        </p>
      </div>
    </main>
  );
}
