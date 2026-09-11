import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { Truck, Package, Shield, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface AuthPageProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
const DEMO_OTP = '123456';

export function AuthPage({ mode, onModeChange }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [role, setRole] = useState<UserRole>('shipper');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetRegistration = () => {
    setOtp('');
    setOtpSent(false);
    setErrors({});
    setLoading(false);
  };

  const normalizedPhone = toEnglishDigits(phone.trim());

  const sendOtp = () => {
    const errs: Record<string, string> = {};
    if (!/^09\d{9}$/.test(normalizedPhone)) errs.phone = 'شماره موبایل معتبر نیست (مثال: 09123456789)';
    if (!fullName.trim()) errs.fullName = 'نام و نام خانوادگی الزامی است';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setOtpSent(true);
    setOtp('');
    showToast(`کد تأیید ارسال شد. کد آزمایشی: ${DEMO_OTP}`, 'success');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (password.length < 6) errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (mode === 'register') {
      if (!/^09\d{9}$/.test(normalizedPhone)) errs.phone = 'شماره موبایل معتبر نیست';
      if (!fullName.trim()) errs.fullName = 'نام و نام خانوادگی الزامی است';
      if (!otpSent) errs.phone = 'ابتدا کد تأیید را دریافت کنید';
      else if (otp !== DEMO_OTP) errs.otp = 'کد تأیید صحیح نیست';
    } else if (!/^09\d{9}$/.test(normalizedPhone)) {
      errs.phone = 'شماره موبایل معتبر نیست';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(normalizedPhone, password);
        if (error) { showToast(error, 'error'); setLoading(false); }
        else showToast('با موفقیت وارد شدید', 'success');
      } else {
        const { error } = await signUp(normalizedPhone, password, role, fullName.trim());
        if (error) { showToast(error, 'error'); setLoading(false); }
        else showToast(`حساب ${role === 'driver' ? 'راننده' : role === 'carrier' ? 'باربری' : 'صاحب بار'} با موفقیت ایجاد شد`, 'success');
      }
    } catch {
      showToast('خطایی هنگام ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-3 shadow-lg shadow-primary-600/30">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-sm text-gray-400 mt-1">{APP_TAGLINE}</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button type="button" onClick={() => { setErrors({}); onModeChange('login'); }} className={cn('flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500')}>ورود</button>
          <button type="button" onClick={() => { resetRegistration(); onModeChange('register'); }} className={cn('flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', mode === 'register' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500')}>ثبت‌نام</button>
        </div>

        {mode === 'register' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-3">
              <p className="text-base font-bold text-gray-900">هویت شما چیست؟</p>
              <p className="text-xs text-gray-400 mt-1">نوع فعالیت شما، امکانات مناسب حساب را مشخص می‌کند.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <RoleCard active={role === 'shipper'} onClick={() => setRole('shipper')} icon={<Package className="w-6 h-6" />} title="صاحب بار" desc="ثبت و مدیریت بار" />
              <RoleCard active={role === 'driver'} onClick={() => setRole('driver')} icon={<Truck className="w-6 h-6" />} title="راننده" desc="جستجو و حمل بار" />
              <RoleCard active={role === 'carrier'} onClick={() => setRole('carrier')} icon={<Building2 className="w-6 h-6" />} title="باربری" desc="ثبت حرفه‌ای بار، مزایای ویژه و نشان اعتماد" />
            </div>

            <Input label="نام و نام خانوادگی" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={role === 'carrier' ? 'نام مدیر یا مسئول باربری' : 'مثال: علی محمدی'} error={errors.fullName} />
            <Input label="شماره موبایل" value={phone} onChange={(e) => setPhone(toEnglishDigits(e.target.value))} placeholder="09123456789" type="tel" dir="ltr" error={errors.phone} />

            {!otpSent ? (
              <Button type="button" size="full" onClick={sendOtp} className="mt-1">دریافت کد تأیید <ArrowRight className="w-4 h-4 mr-2" /></Button>
            ) : (
              <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2 text-primary-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <p className="text-sm font-bold">کد تأیید شماره موبایل</p>
                </div>
                <p className="text-xs text-gray-500">کد ۶ رقمی ارسال‌شده را وارد کنید.</p>
                <Input label="کد تأیید" value={otp} onChange={(e) => setOtp(toEnglishDigits(e.target.value).replace(/\D/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" dir="ltr" error={errors.otp} />
                <button type="button" onClick={sendOtp} className="text-xs text-primary-700 font-medium">ارسال مجدد کد</button>
              </div>
            )}

            <Input label="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" type="password" dir="ltr" error={errors.password} />
            <p className="text-xs text-gray-400 leading-6">ایمیل در این مرحله دریافت نمی‌شود و بعد از ورود، از بخش تکمیل پروفایل اضافه خواهد شد.</p>
            <Button type="submit" size="full" loading={loading} disabled={!otpSent} className="mt-2">ایجاد حساب {role === 'carrier' ? 'باربری' : role === 'driver' ? 'راننده' : 'صاحب بار'}</Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="شماره موبایل" value={phone} onChange={(e) => setPhone(toEnglishDigits(e.target.value))} placeholder="09123456789" type="tel" dir="ltr" error={errors.phone} />
            <Input label="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" type="password" dir="ltr" error={errors.password} />
            <Button type="submit" size="full" loading={loading} className="mt-2">ورود به حساب</Button>
          </form>
        )}

        {mode === 'login' && <p className="text-center text-sm text-gray-400 mt-6">حساب ندارید؟{' '}<button type="button" onClick={() => { resetRegistration(); onModeChange('register'); }} className="text-primary-600 font-medium">ثبت‌نام کنید</button></p>}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-300"><Shield className="w-3.5 h-3.5" /><span>اطلاعات حساب شما در همین دستگاه ذخیره می‌شود</span></div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return <button type="button" onClick={onClick} className={cn('w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-right', active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300')}>
    <div className={cn('w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-colors', active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400')}>{icon}</div>
    <div className="flex-1"><p className="font-bold text-sm">{title}</p><p className="text-xs text-gray-400 mt-0.5 leading-5">{desc}</p></div>
    {active && <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
  </button>;
}
