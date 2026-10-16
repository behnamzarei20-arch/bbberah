import { useState, type FormEvent } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, ArrowRight, LoaderCircle } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type Stage = 'credentials' | 'mfa' | 'enroll' | 'verified';
type Notice = { text: string; ok?: boolean } | null;

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<Stage>('credentials');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const finishMfa = async (activeFactorId: string, otp: string) => {
    const verified = await supabase.auth.mfa.challengeAndVerify({ factorId: activeFactorId, code: otp });
    if (verified.error) throw new Error('کد تأیید دومرحله‌ای درست نیست یا منقضی شده است.');
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error || assurance.data.currentLevel !== 'aal2') {
      throw new Error('تأیید دومرحله‌ای کامل نشد. دوباره تلاش کنید.');
    }
    const primary = await supabase.rpc('is_primary_admin');
    if (primary.error || primary.data !== true) {
      await supabase.auth.signOut();
      throw new Error('این حساب به‌عنوان مدیر اصلی مجاز ثبت نشده است.');
    }
    setStage('verified');
    setNotice({ text: 'هویت مدیر اصلی تأیید شد. رابط مدیریت و دسترسی‌های عملیاتی هنوز باید جداگانه متصل و آزموده شوند.', ok: true });
  };

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSupabaseConfig) {
      setNotice({ text: 'اتصال Supabase تنظیم نشده است؛ ورود واقعی در این نسخه فعال نیست.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error || !result.data.user) throw new Error('ورود انجام نشد. ایمیل و رمز عبور را بررسی کنید.');
      const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (!assurance.error && assurance.data.currentLevel === 'aal2') {
        const primary = await supabase.rpc('is_primary_admin');
        if (!primary.error && primary.data === true) {
          setStage('verified');
          setNotice({ text: 'هویت مدیر اصلی تأیید شد. رابط مدیریت و دسترسی‌های عملیاتی هنوز باید جداگانه متصل و آزموده شوند.', ok: true });
          return;
        }
        await supabase.auth.signOut();
        throw new Error('این حساب به‌عنوان مدیر اصلی مجاز ثبت نشده است.');
      }
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw new Error('روش تأیید دومرحله‌ای قابل بررسی نیست.');
      const verifiedTotp = factors.data.totp.find((factor) => factor.status === 'verified');
      if (verifiedTotp) {
        setFactorId(verifiedTotp.id);
        setStage('mfa');
        setNotice({ text: 'کد شش‌رقمی برنامهٔ تأیید هویت را وارد کنید.' });
      } else {
        const enrolled = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Brah Primary Admin' });
        if (enrolled.error || !enrolled.data.totp) throw new Error('راه‌اندازی تأیید دومرحله‌ای انجام نشد.');
        setFactorId(enrolled.data.id);
        setQrCode(enrolled.data.totp.qr_code);
        setSecret(enrolled.data.totp.secret);
        setStage('enroll');
        setNotice({ text: 'این کد QR را با برنامهٔ تأیید هویت اسکن کنید، سپس کد شش‌رقمی را وارد کنید.' });
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'ورود امن انجام نشد.' });
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code.trim())) {
      setNotice({ text: 'کد تأیید باید شش رقم باشد.' });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await finishMfa(factorId, code.trim());
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'تأیید دومرحله‌ای ناموفق بود.' });
    } finally {
      setBusy(false);
    }
  };

  const returnToApp = async () => {
    await supabase.auth.signOut();
    window.location.href = './';
  };

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-800">
        {stage === 'verified' ? <ShieldCheck className="h-7 w-7"/> : <KeyRound className="h-7 w-7"/>}
      </div>
      <h1 className="text-center text-2xl font-black text-slate-900">ورود امن مدیر براه</h1>
      <p className="mt-2 text-center text-sm leading-7 text-slate-500">ورود فقط برای حساب مدیر اصلی از پیش تأییدشده مجاز است. ساخت حساب مدیر از این صفحه امکان‌پذیر نیست.</p>
      {!hasSupabaseConfig && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900"><ShieldAlert className="mb-1 inline h-4 w-4"/> اتصال Supabase تنظیم نشده است؛ ورود امن تا زمان تنظیم متغیرهای محیطی غیرفعال می‌ماند.</div>}
      {stage === 'credentials' && <form className="mt-6 space-y-4" onSubmit={signIn}>
        <label className="block text-sm font-bold text-slate-700">ایمیل مدیر
          <input required type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-left outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100" dir="ltr" />
        </label>
        <label className="block text-sm font-bold text-slate-700">رمز عبور
          <input required type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-left outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100" dir="ltr" />
        </label>
        <button disabled={busy || !hasSupabaseConfig} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 py-3 font-black text-white disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin"/>}ادامه با تأیید دومرحله‌ای</button>
      </form>}
      {(stage === 'mfa' || stage === 'enroll') && <form className="mt-6 space-y-4" onSubmit={verifyCode}>
        {stage === 'enroll' && <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-center">
          {qrCode && <img src={qrCode} alt="کد QR برای راه‌اندازی تأیید دومرحله‌ای" className="mx-auto h-48 w-48 object-contain"/>}
          <p className="text-xs leading-6 text-slate-600">اگر امکان اسکن QR ندارید، کلید زیر را در برنامهٔ تأیید هویت وارد کنید.</p>
          <code dir="ltr" className="block break-all rounded-lg bg-white p-3 text-sm">{secret}</code>
        </div>}
        <label className="block text-sm font-bold text-slate-700">کد شش‌رقمی برنامهٔ تأیید هویت
          <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-xl tracking-[0.35em] outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100" dir="ltr"/>
        </label>
        <button disabled={busy || code.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-800 px-4 py-3 font-black text-white disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin"/>}تأیید و ادامه</button>
      </form>}
      {stage === 'verified' && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900"><ShieldCheck className="mb-1 inline h-4 w-4"/> ورود و MFA تأیید شده‌اند؛ برای ایمنی، پنل داده‌ها تا زمان اتصال کامل مجوزهای رابط نمایش داده نمی‌شود.</div>}
      {notice && <p role="status" className={`mt-4 rounded-xl border px-3 py-3 text-sm leading-6 ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{notice.text}</p>}
      <button type="button" onClick={returnToApp} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"><ArrowRight className="h-4 w-4"/> بازگشت به برنامه</button>
    </section>
  </main>;
}
