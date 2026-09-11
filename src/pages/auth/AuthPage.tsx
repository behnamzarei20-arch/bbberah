import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showToast } from '@/components/ui/Toast';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { validateEmail } from '@/lib/utils';
import { Truck, Package, Shield } from 'lucide-react';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface AuthPageProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

const toEnglishDigits = (value: string) => value.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

export function AuthPage({ mode, onModeChange }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('shipper');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const normalizedPhone = toEnglishDigits(phone.trim());
    if (!validateEmail(email)) errs.email = 'ایمیل معتبر نیست';
    if (password.length < 6) errs.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    if (mode === 'register') {
      if (!fullName.trim()) errs.fullName = 'نام و نام خانوادگی الزامی است';
      if (normalizedPhone && !/^09\d{9}$/.test(normalizedPhone)) errs.phone = 'شماره موبایل معتبر نیست (مثال: 09123456789)';
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
        const { error } = await signIn(email, password);
        if (error) { showToast(error, 'error'); setLoading(false); }
        else showToast('با موفقیت وارد شدید', 'success');
      } else {
        const normalizedPhone = toEnglishDigits(phone.trim());
        const { error } = await signUp(email, password, role, fullName.trim(), normalizedPhone);
        if (error) { showToast(error, 'error'); setLoading(false); }
        else showToast(`حساب ${role === 'driver' ? 'راننده' : 'صاحب بار'} با موفقیت ایجاد شد`, 'success');
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
          <button type="button" onClick={() => { setErrors({}); setLoading(false); onModeChange('register'); }} className={cn('flex-1 py-2.5 text-sm font-medium rounded-lg transition-all', mode === 'register' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500')}>ثبت‌نام</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">نقش خود را انتخاب کنید</label>
                <div className="grid grid-cols-2 gap-3">
                  <RoleCard active={role === 'shipper'} onClick={() => setRole('shipper')} icon={<Package className="w-6 h-6" />} title="صاحب بار" desc="ثبت و مدیریت بار" />
                  <RoleCard active={role === 'driver'} onClick={() => setRole('driver')} icon={<Truck className="w-6 h-6" />} title="راننده" desc="جستجو و حمل بار" />
                </div>
              </div>
              <Input label="نام و نام خانوادگی" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="مثال: علی محمدی" error={errors.fullName} />
              <Input label="شماره موبایل" value={phone} onChange={(e) => setPhone(toEnglishDigits(e.target.value))} placeholder="09123456789" type="tel" dir="ltr" error={errors.phone} />
            </>
          )}
          <Input label="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" type="email" dir="ltr" error={errors.email} />
          <Input label="رمز عبور" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="حداقل ۶ کاراکتر" type="password" dir="ltr" error={errors.password} />
          <Button type="submit" size="full" loading={loading} className="mt-2">{mode === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری'}</Button>
        </form>

        {mode === 'login' && <p className="text-center text-sm text-gray-400 mt-6">حساب ندارید؟{' '}<button type="button" onClick={() => onModeChange('register')} className="text-primary-600 font-medium">ثبت‌نام کنید</button></p>}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-300"><Shield className="w-3.5 h-3.5" /><span>اطلاعات حساب شما در همین دستگاه ذخیره می‌شود</span></div>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return <button type="button" onClick={onClick} className={cn('flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200', active ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300')}>
    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-colors', active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400')}>{icon}</div>
    <div className="text-center"><p className="font-bold text-sm">{title}</p><p className="text-xs text-gray-400 mt-0.5">{desc}</p></div>
    {active && <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
  </button>;
}
