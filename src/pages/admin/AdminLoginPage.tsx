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

  return <main dir="rtl" className="min-h-screen bg-[#f3f7f8] px-4 py-8 text-slate-900 sm:px-8 lg:py-12">
    <div className="mx-auto grid min-h-[min(760px,calc(100vh-4rem))] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,42,57,0.25)] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-[#102f3b] p-10 text-white lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute -left-12 -top-12 h-48 w-48 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-300 text-[#102f3b]"><ShieldCheck className="h-6 w-6"/></div>
          <div><p className="text-lg font-black">براه</p><p className="text-xs text-teal-100/70">مدیریت امن سامانه</p></div>
        </div>
        <div className="relative py-10">
          <p className="mb-4 text-sm font-bold tracking-wide text-teal-200">پنل مدیریت</p>
          <h2 className="max-w-sm text-4xl font-black leading-[1.5]">همه‌چیز از یک ورود امن شروع می‌شود.</h2>
          <p className="mt-5 max-w-sm text-sm leading-8 text-slate-300">دسترسی مدیر اصلی با رمز عبور و تأیید دومرحله‌ای محافظت می‌شود. این صفحه حساب مدیریتی جدید ایجاد نمی‌کند.</p>
          <div className="mt-8 space-y-4 text-sm text-slate-200">
            <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><KeyRound className="h-4 w-4"/></span> احراز هویت دومرحله‌ای</div>
            <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><ShieldCheck className="h-4 w-4"/></span> بررسی مجوز مدیر اصلی</div>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">دسترسی محدود به حساب‌های مجاز</p>
      </section>
      <section className="flex flex-col justify-center px-6 py-8 sm:px-10 lg:px-12">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102f3b] text-teal-200"><ShieldCheck className="h-5 w-5"/></div>
          <div><p className="font-black">براه</p><p className="text-xs text-slate-500">مدیریت امن سامانه</p></div>
        </div>
        <div className="mb-7">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-800 ring-1 ring-teal-100">
            {stage === 'verified' ? <ShieldCheck className="h-7 w-7"/> : <KeyRound className="h-7 w-7"/>}
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{stage === 'verified' ? 'ورود تأیید شد' : stage === 'mfa' ? 'تأیید هویت شما' : stage === 'enroll' ? 'راه‌اندازی ورود امن' : 'ورود به پنل مدیریت'}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">{stage === 'credentials' ? 'برای ادامه، با حساب مدیر اصلی وارد شوید.' : stage === 'verified' ? 'هویت شما تأیید شده است.' : 'برای محافظت از حساب، تأیید دومرحله‌ای را کامل کنید.'}</p>
          <p className="mt-2 text-xs leading-6 text-slate-400">ساخت حساب مدیر از این صفحه امکان‌پذیر نیست.</p>
        </div>
        {!hasSupabaseConfig && <div className="mb-5 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900"><ShieldAlert className="mt-1 h-4 w-4 shrink-0"/>اتصال Supabase تنظیم نشده است؛ ورود واقعی تا زمان تنظیم متغیرهای محیطی غیرفعال می‌ماند.</div>}
        {stage === 'credentials' && <form className="space-y-5" onSubmit={signIn}>
          <label className="block text-sm font-bold text-slate-700">ایمیل مدیر
            <input required type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="admin@example.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left placeholder:text-slate-400 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10" dir="ltr" />
          </label>
          <label className="block text-sm font-bold text-slate-700">رمز عبور
            <input required type="password" autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="رمز عبور حساب مدیر" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left placeholder:text-slate-400 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10" dir="ltr" />
          </label>
          <button disabled={busy || !hasSupabaseConfig} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f3b] px-4 py-3.5 font-black text-white shadow-sm transition hover:bg-[#194555] disabled:cursor-not-allowed disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin"/>}ادامه و تأیید هویت<ArrowRight className="h-4 w-4 rotate-180"/></button>
        </form>}
        {(stage === 'mfa' || stage === 'enroll') && <form className="space-y-5" onSubmit={verifyCode}>
          {stage === 'enroll' && <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            {qrCode && <img src={qrCode} alt="کد QR برای راه‌اندازی تأیید دومرحله‌ای" className="mx-auto h-48 w-48 object-contain"/>}
            <p className="text-xs leading-6 text-slate-600">کد QR را با برنامه تأیید هویت اسکن کنید؛ یا کلید زیر را دستی وارد کنید.</p>
            <code dir="ltr" className="block break-all rounded-lg border border-slate-200 bg-white p-3 text-sm">{secret}</code>
          </div>}
          <label className="block text-sm font-bold text-slate-700">کد شش‌رقمی
            <input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl tracking-[0.5em] outline-none focus:border-teal-700 focus:bg-white focus:ring-4 focus:ring-teal-700/10" dir="ltr"/>
          </label>
          <button disabled={busy || code.length !== 6} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102f3b] px-4 py-3.5 font-black text-white disabled:opacity-50">{busy && <LoaderCircle className="h-4 w-4 animate-spin"/>}تأیید کد و ادامه</button>
        </form>}
        {stage === 'verified' && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-900"><ShieldCheck className="mb-1 inline h-4 w-4"/> هویت مدیر اصلی تأیید شده است؛ رابط عملیاتی پنل هنوز باید جداگانه متصل و آزموده شود.</div>}
        {notice && <p role="status" className={`mt-5 rounded-xl border px-4 py-3 text-sm leading-7 ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{notice.text}</p>}
        <button type="button" onClick={returnToApp} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"><ArrowRight className="h-4 w-4"/>بازگشت به برنامه</button>
        <p className="mt-7 text-center text-xs text-slate-400">ورود امن · دسترسی محدود · بدون ثبت‌نام عمومی</p>
      </section>
    </div>
  </main>;
}
