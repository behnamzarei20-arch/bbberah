import { useEffect, useRef, useState } from 'react';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Truck, ArrowRight, Pencil, ShieldCheck, FileText } from 'lucide-react';

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
  const [seconds, setSeconds] = useState(60);
  const [notice, setNotice] = useState<Notice>(null);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const otpRef = useRef<HTMLInputElement>(null);
  const normalizedPhone = en(phone.trim()).replace(/\s/g, '');

  useEffect(() => {
    if (step !== 'otp' || seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds(value => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [step, seconds]);

  useEffect(() => {
    if (step !== 'otp') return;
    const controller = new AbortController();
    const credentials = navigator.credentials as CredentialsContainer & {
      get: (options?: CredentialRequestOptions) => Promise<Credential | null>;
    };
    if ('OTPCredential' in window && navigator.credentials?.get) {
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
    setNotice(null);
    setStep('otp');
  };

  const editPhone = () => {
    setStep('phone');
    setOtp('');
    setNotice(null);
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
      // Auth state changes to the home screen after successful verification.
    }, 850);
  };

  if (termsOpen) {
    return <div dir="rtl" className="min-h-screen bg-white px-5 py-8">
      <div className="mx-auto max-w-md">
        <button type="button" onClick={() => setTermsOpen(false)} className="mb-7 flex items-center gap-2 text-sm font-bold text-gray-500">
          <ArrowRight className="h-4 w-4" /> بازگشت به ورود
        </button>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <FileText className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-gray-900">قوانین و مقررات</h1>
        <p className="mt-5 leading-8 text-gray-600">استفاده از براه به معنی پذیرش قوانین و مقررات استفاده از بازارگاه حمل‌ونقل است.</p>
        <p className="mt-3 leading-8 text-gray-600">اطلاعات ثبت‌شده باید صحیح و متعلق به صاحب حساب باشد و کاربران مسئول حفظ اطلاعات حساب خود هستند.</p>
        <p className="mt-3 leading-8 text-gray-600">کاربر موظف است از خدمات براه در چارچوب قوانین و مقررات مربوط استفاده کند و اطلاعات حساب خود را محرمانه نگه دارد.</p>
      </div>
    </div>;
  }

  return <div dir="rtl" className="min-h-screen bg-white flex flex-col">
    <div className="flex-1 flex flex-col justify-center px-5 py-8 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-[22px] bg-primary-600 text-white flex items-center justify-center shadow-lg">
          <Truck className="w-8 h-8" />
        </div>
        <p className="text-xl font-black text-gray-900 mt-3">{APP_NAME}</p>
        {step === 'phone' && <h1 className="text-2xl font-black text-gray-900 mt-2">خوش آمدید</h1>}
        <p className="text-sm font-medium text-gray-500 mt-3">{APP_TAGLINE}</p>
      </div>

      {step === 'phone' ? <div className="space-y-5">
        <h2 className="text-xl font-black text-gray-900">شماره تلفن خود را وارد کنید</h2>
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
        {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-center text-sm font-bold ${notice.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{notice.text}</div>}
        <Button type="button" size="full" onClick={requestCode}>درخواست کد فعال‌سازی</Button>
      </div> : <div className="space-y-5">
        <h2 className="text-xl font-black text-gray-900">لطفاً کد ارسال‌شده به شماره</h2>
        <p className="text-gray-500">کد ارسال‌شده به شماره <span dir="ltr" className="font-black text-gray-800">{fa(normalizedPhone)}</span> را وارد کنید.</p>
        <Input
          ref={otpRef}
          label="کد ۵ رقمی"
          value={fa(otp)}
          onChange={event => handleOtp(event.target.value)}
          placeholder="-----"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9۰-۹]*"
          maxLength={5}
          dir="ltr"
          autoFocus
        />
        {notice && <div role="status" className={`rounded-xl border px-4 py-3 text-center text-sm font-bold ${notice.ok ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>{notice.text}</div>}
        <div className="text-center text-sm font-bold text-gray-500">
          {seconds > 0 ? <>درخواست مجدد کد تا <span className="font-black text-primary-700">{fa(String(seconds).padStart(2, '0'))}</span> ثانیه دیگر</> : <button type="button" disabled={loading} onClick={() => { setOtp(''); setSeconds(60); setNotice(null); otpRef.current?.focus(); }} className="font-bold text-primary-700 disabled:opacity-50">درخواست مجدد کد</button>}
        </div>
        <button type="button" onClick={editPhone} className="mx-auto flex items-center gap-2 text-sm font-bold text-gray-500">
          <Pencil className="h-4 w-4" /> ویرایش شماره تلفن
        </button>
      </div>}

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck className="w-4 h-4" /> ورود امن با شماره تلفن
      </div>
    </div>
  </div>;
}
