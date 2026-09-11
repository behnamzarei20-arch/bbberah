import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { Truck, Package, Shield, Building2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface AuthPageProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

type RegisterStep = 'identity' | 'details' | 'otp' | 'password';
const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const DEMO_OTP = '123456';

export function AuthPage({ mode, onModeChange }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<UserRole>('shipper');
  const [step, setStep] = useState<RegisterStep>('identity');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedPhone = toEnglishDigits(phone.trim());

  const startRegistration = (nextRole: UserRole) => {
    setRole(nextRole);
    setErrors({});
    setStep('details');
  };

  const resetRegistration = () => {
    setOtp('');
    setErrors({});
    setLoading(false);
    setStep('identity');
  };

  const goBack = () => {
    setErrors({});
    if (step === 'details') setStep('identity');
    else if (step === 'otp') setStep('details');
    else if (step === 'password') setStep('otp');
  };

  const sendOtp = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'نام و نام خانوادگی الزامی است';
    if (!/^09\d{9}$/.test(normalizedPhone)) errs.phone = 'شماره موبایل معتبر نیست (مثال: 09123456789)';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setOtp('');
    setStep('otp');
    showToast(`کد تأیید آزمایشی: ${DEMO_OTP}`, 'success');
  };

  const handleOtpChange = (value: string) => {
    const next = toEnglishDigits(value).replace(/\D/g, '').slice(0, 6);
    setOtp(next);
    setErrors((current) => ({ ...current, otp: '' }));
    if (next.length === 6) {
      if (next === DEMO_OTP) {
        setTimeout(() => setStep('password'), 150);
      } else {
        setErrors((current) => ({ ...current, otp: 'کد تأیید صحیح نیست' }));
      }
    }
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (password.length < 6) errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!/^09\d{9}$/.test(normalizedPhone)) errs.phone = 'شماره موبایل معتبر نیست';
    if (password.length < 6) errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const { error } = await signIn(normalizedPhone, password);
      if (error) { showToast(error, 'error'); setLoading(false); }
      else showToast('با موفقیت وارد شدید', 'success');
    } catch {
      showToast('خطایی هنگام ورود رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    try {
      const { error } = await signUp(normalizedPhone, password, role, fullName.trim());
      if (error) { showToast(error, 'error'); setLoading(false); }
      else showToast(`حساب ${role === 'driver' ? 'راننده' : role === 'carrier' ? 'باربری' : 'صاحب بار'} با موفقیت ایجاد شد`, 'success');
    } catch {
      showToast('خطایی هنگام ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white mb-3 shadow-lg shadow-primary-600/30"><Truck className="w-7 h-7" /></div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-sm text-gray-400 mt-1">{APP_TAGLINE}</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5">
          <button type="button" onClick={() => { setErrors({}); onModeChange('login'); }} className={cn('flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500')}>ورود</button>
          <button type="button" onClick={() => { resetRegistration(); onModeChange('register'); }} className={cn('flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', mode === 'register' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500')}>ثبت‌نام</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="شماره موبایل" value={phone} onChange={(e) => setPhone(toEnglishDigits(e.target.value))} placeholder="09123456789" type="tel" dir="ltr" error={errors.phone} />
            <Input label="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" type="password" dir="ltr" error={errors.password} />
            <Button type="submit" size="full" loading={loading} className="mt-2">ورود به حساب</Button>
          </form>
        ) : (
          <div className="space-y-4">
            {step !== 'identity' && (
              <button type="button" onClick={goBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-700 mb-2">
                <ArrowRight className="w-4 h-4" /> برگشت
              </button>
            )}

            {step === 'identity' && (
              <div className="space-y-4">
                <div className="text-center mb-5">
                  <p className="text-lg font-bold text-gray-900">هویت شما چیست؟</p>
                  <p className="text-xs text-gray-400 mt-1">نوع فعالیت خود را انتخاب کنید تا وارد مرحله بعد شوید.</p>
                </div>
                <RoleCard onClick={() => startRegistration('shipper')} icon={<Package className="w-6 h-6" />} title="صاحب بار" desc="ثبت و مدیریت بار" />
                <RoleCard onClick={() => startRegistration('driver')} icon={<Truck className="w-6 h-6" />} title="راننده" desc="جستجو و حمل بار" />
                <RoleCard onClick={() => startRegistration('carrier')} icon={<Building2 className="w-6 h-6" />} title="باربری" desc="ثبت حرفه‌ای بار، مزایای ویژه و نشان اعتماد" />
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                <StepTitle title={role === 'carrier' ? 'مشخصات باربری' : 'مشخصات شما'} subtitle="اطلاعات اولیه را وارد کنید." />
                <Input label={role === 'carrier' ? 'نام مدیر یا مسئول باربری' : 'نام و نام خانوادگی'} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={role === 'carrier' ? 'مثال: علی محمدی' : 'مثال: علی محمدی'} error={errors.fullName} />
                <Input label="شماره موبایل" value={phone} onChange={(e) => setPhone(toEnglishDigits(e.target.value))} placeholder="09123456789" type="tel" dir="ltr" error={errors.phone} />
                <Button type="button" size="full" onClick={sendOtp}>دریافت کد تأیید <ArrowLeft className="w-4 h-4 mr-2" /></Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <StepTitle title="تأیید شماره موبایل" subtitle={`کد ۶ رقمی برای ${normalizedPhone} ارسال شده است.`} />
                <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
                  <Input label="کد تأیید" value={otp} onChange={(e) => handleOtpChange(e.target.value)} placeholder="۱۲۳۴۵۶" inputMode="numeric" dir="ltr" error={errors.otp} autoFocus />
                  <p className="text-xs text-gray-400 mt-3">با وارد شدن رقم ششم، در صورت صحیح بودن کد به مرحله بعد می‌روید.</p>
                </div>
                <button type="button" onClick={sendOtp} className="text-sm text-primary-700 font-medium">ارسال مجدد کد</button>
              </div>
            )}

            {step === 'password' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <StepTitle title="ساخت رمز عبور" subtitle="یک رمز عبور حداقل ۶ کاراکتری انتخاب کنید." />
                <Input label="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" type="password" dir="ltr" error={errors.password} autoFocus />
                <p className="text-xs text-gray-400 leading-6">ایمیل فعلاً دریافت نمی‌شود و بعد از ورود، در بخش تکمیل پروفایل اضافه خواهد شد.</p>
                <Button type="submit" size="full" loading={loading}>ایجاد حساب {role === 'carrier' ? 'باربری' : role === 'driver' ? 'راننده' : 'صاحب بار'}</Button>
              </form>
            )}
          </div>
        )}

        {mode === 'login' && <p className="text-center text-sm text-gray-400 mt-6">حساب ندارید؟{' '}<button type="button" onClick={() => { resetRegistration(); onModeChange('register'); }} className="text-primary-600 font-medium">ثبت‌نام کنید</button></p>}
        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-300"><Shield className="w-3.5 h-3.5" /><span>اطلاعات حساب شما در همین دستگاه ذخیره می‌شود</span></div>
      </div>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="text-center mb-5"><p className="text-lg font-bold text-gray-900">{title}</p><p className="text-xs text-gray-400 mt-1 leading-5">{subtitle}</p></div>;
}

function RoleCard({ onClick, icon, title, desc }: { onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return <button type="button" onClick={onClick} className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 text-right">
    <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center bg-gray-100 text-primary-600">{icon}</div>
    <div className="flex-1"><p className="font-bold text-sm">{title}</p><p className="text-xs text-gray-400 mt-0.5 leading-5">{desc}</p></div>
    <ArrowLeft className="w-5 h-5 text-gray-300 shrink-0" />
  </button>;
}
