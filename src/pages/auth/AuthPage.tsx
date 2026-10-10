import { useEffect, useRef, useState } from 'react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RulesContent } from '@/components/RulesContent';
import { Truck, ArrowRight, Pencil } from 'lucide-react';

const DEMO_OTP = '12345';
const fa = (v: string) => v.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] || d);
const en = (v: string) => v.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

type Notice = { text: string; ok: boolean } | null;

export function AuthPage(_props: { mode: 'login' | 'register'; onModeChange: (mode: 'login' | 'register') => void }) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [seconds, setSeconds] = useState(0);
  const [codeRequested, setCodeRequested] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);
  const normalizedPhone = en(phone.trim()).replace(/\s/g, '');

  // Keep the cooldown running even if the user edits the phone number.
  useEffect(() => {
    if (!codeRequested || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [codeRequested, seconds]);

  useEffect(() => {
    if (step !== 'otp') return;
    const controller = new AbortController();
    const credentials = navigator.credentials as CredentialsContainer & {
      get: (options?: CredentialRequestOptions) => Promise<Credential | null>;
    };
    if ('OTPCredential' in window) {
      credentials.get({
        otp: { transport: ['sms'] },
        signal: controller.signal,
      } as unknown as CredentialRequestOptions).then((credential) => {
        const code = (credential as (Credential & { code?: string }) | null)?.code;
        if (code) handleOtp(code);
      }).catch(() => undefined);
    }
    return () => controller.abort();
  // SMS autofill is started only when the OTP page opens.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const requestCode = () => {
    if (codeRequested && seconds > 0) return;
    if (!accepted) {
      setNotice({ text: 'پذیرش قوانین و مقررات الزامی است', ok: false });
      return;
    }
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setPhoneError('شماره تلفن معتبر نیست');
      setNotice(null);
      return;
    }
    setPhoneError('');
    setOtp('');
    setSeconds(60);
    setCodeRequested(true);
    setNotice(null);
    setStep('otp');
  };

  const editPhone = () => {
    setStep('phone');
    setOtp('');
    setNotice(null);
    setPhoneError('');
  };

  const handleOtp = (value: string) => {
    const code = en(value).replace(/\D/g, '').slice(0, 5);
    setOtp(code);
    setNotice(null);
    if (code.length !== 5) return;
    if (code !== DEMO_OTP) {
      setNotice({ text: 'ورود ناموفق، کد اشتباه است', ok: false });
      return;
    }
    setNotice({ text: 'ورود موفقیت‌آمیز بود؛ در حال ورود به صفحه اصلی…', ok: true });
    setLoading(true);
    window.setTimeout(async () => {
      const result = await signIn(normalizedPhone);
      if (result.error) {
        setNotice({ text: result.error, ok: false });
        setLoading(false);
        return;
      }
    }, 850);
  };

  if (termsOpen) {
    return <div dir="rtl" className="min-h-screen bg-[#f8f8f7] px-4 py-6">
      <div className="mx-auto max-w-lg">
        <button type="button" onClick={() => setTermsOpen(false)} className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500">
          <ArrowRight className="h-4 w-4" /> بازگشت به ورود
        </button>
        <RulesContent onAccept={() => { setAccepted(true); setTermsOpen(false); setNotice(null); }} />
      </div>
    </div>;
  }

  return <div dir="rtl" className="min-h-screen bg-[#f8f8f7] flex flex-col">
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-primary-600 text-white shadow-lg" aria-label={APP_NAME}>
        <Truck className="h-8 w-8" />
      </div>

      <div className="w-full max-w-md rounded-[28px] border border-gray-100 bg-white p-5 shadow-xl shadow-gray-200/40">
        <div className="mb-6 text-center">
          <p className="text-xl font-black text-gray-900">{APP_NAME}</p>
          {step === 'phone' && <h1 className="mt-2 text-2xl font-black text-gray-900">خوش آمدید</h1>}
          <p className="mt-3 text-sm font-medium text-gray-500">{APP_TAGLINE}</p>
        </div>

        {step === 'phone' ? <div className="space-y-5">
          <h2 className="text-center text-xl font-black text-gray-900">شماره تلفن خود را وارد کنید</h2>
          <Input
            label="شماره تلفن"
            value={phone}
            onChange={event => { setPhone(en(event.target.value)); setPhoneError(''); }}
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            error={phoneError}
          />
          <div className="flex items-start gap-2">
            <input
              id="terms-accepted"
              type="checkbox"
              checked={accepted}
              onChange={event => { setAccepted(event.target.checked); if (event.target.checked && notice?.text === 'پذیرش قوانین و مقررات الزامی است') setNotice(null); }}
              className="mt-1 h-4 w-4 shrink-0 accent-[#1358ED]"
            />
            <label htmlFor="terms-accepted" className="text-sm leading-7 text-gray-600">
              با ورود به براه قوانین و مقررات را می‌پذیرم.{' '}
              <button type="button" onClick={() => setTermsOpen(true)} className="font-bold text-primary-700 underline underline-offset-2">قوانین و مقررات</button>
            </label>
          </div>
          {codeRequested && seconds > 0 && <p className="text-center text-xs font-bold text-gray-500">برای درخواست مجدد کد، {fa(String(seconds))} ثانیه صبر کنید.</p>}
          {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-center text-sm font-bold ${notice.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{notice.text}</div>}
          <Button type="button" size="full" disabled={codeRequested && seconds > 0} onClick={requestCode}>
            {codeRequested && seconds > 0 ? `درخواست کد فعال‌سازی (${fa(String(seconds))})` : 'درخواست کد فعال‌سازی'}
          </Button>
        </div> : <div className="space-y-5">
          <p className="text-center text-base font-bold leading-8 text-gray-800">لطفاً کد ارسال‌شده به شماره تلفن زیر را وارد کنید</p>
          <p dir="ltr" className="text-center text-2xl font-black tracking-wide text-gray-900">{fa(normalizedPhone)}</p>

          <div className="relative mx-auto w-full max-w-[310px]" dir="ltr">
            <div className="grid grid-cols-5 gap-2" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className={`flex aspect-square items-center justify-center rounded-xl border-2 text-2xl font-black text-gray-900 transition-colors ${otpFocused ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white'}`}>
                  {fa(otp[index] || '')}
                </div>
              ))}
            </div>
            <input
              ref={otpRef}
              aria-label="کد تأیید پنج رقمی"
              value={fa(otp)}
              onChange={event => handleOtp(event.target.value)}
              onFocus={() => setOtpFocused(true)}
              onBlur={() => setOtpFocused(false)}
              type="tel"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9۰-۹]*"
              maxLength={5}
              dir="ltr"
              autoFocus
              className="absolute inset-0 h-full w-full cursor-text opacity-0"
            />
          </div>

          {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-center text-sm font-bold ${notice.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{notice.text}</div>}
          <div className="text-center text-sm font-bold text-gray-500">
            {seconds > 0 ? <>درخواست مجدد کد تا <span className="font-black text-primary-700">{fa(String(seconds).padStart(2, '0'))}</span> ثانیه دیگر</> : <button type="button" disabled={loading} onClick={() => { setOtp(''); setSeconds(60); setNotice(null); otpRef.current?.focus(); }} className="font-bold text-primary-700 disabled:opacity-50">درخواست مجدد کد</button>}
          </div>
          <button type="button" onClick={editPhone} className="mx-auto flex items-center gap-2 text-sm font-bold text-gray-500">
            <Pencil className="h-4 w-4" /> ویرایش شماره تلفن
          </button>
        </div>}
      </div>
    </div>
  </div>;
}
