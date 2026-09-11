import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import './index.css';
import { Truck, Package, Building2, Search, Plus, ShieldCheck } from 'lucide-react';

function RoleEntry() {
  const { session, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [continueToApp, setContinueToApp] = useState(false);

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;
  if (!session || !profile) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  if (continueToApp) return <App />;

  const role = profile.role;
  const isDriver = role === 'driver';
  const isCarrier = role === 'carrier';
  const title = isDriver ? 'محیط راننده' : isCarrier ? 'محیط باربری' : 'محیط صاحب بار';
  const subtitle = isDriver ? 'بارهای مناسب مسیرت را پیدا کن و مدیریت حمل را انجام بده.' : isCarrier ? 'بارهای مجموعه را مدیریت کن، بار جدید ثبت کن و از مزایای باربری استفاده کن.' : 'بار جدید ثبت کن، راننده مناسب را پیدا کن و حمل‌ونقل را مدیریت کن.';

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
            {isDriver ? <Truck className="w-6 h-6" /> : isCarrier ? <Building2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <div><b className="text-xl">براه</b><p className="text-xs text-gray-400">بازارگاه حمل‌ونقل</p></div>
        </div>
        <section className="rounded-3xl bg-primary-700 text-white p-6 shadow-xl shadow-primary-700/20">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><ShieldCheck className="w-4 h-4" />{isCarrier ? 'حساب باربری' : isDriver ? 'حساب راننده' : 'حساب صاحب بار'}</span>
          <h1 className="text-3xl font-black mt-5">{title}</h1>
          <p className="text-primary-100 text-sm leading-7 mt-3">سلام {profile.full_name}، {subtitle}</p>
        </section>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setContinueToApp(true)} className="rounded-2xl bg-white border border-gray-100 p-5 text-right shadow-sm hover:shadow-md transition-shadow">
            {isDriver ? <Search className="w-6 h-6 text-primary-600" /> : <Plus className="w-6 h-6 text-primary-600" />}
            <b className="block mt-4">{isDriver ? 'جستجوی بار' : 'ثبت بار جدید'}</b>
            <span className="text-xs text-gray-400 block mt-1">ورود به محیط {isDriver ? 'جستجو' : 'ثبت بار'}</span>
          </button>
          <button onClick={() => setContinueToApp(true)} className="rounded-2xl bg-white border border-gray-100 p-5 text-right shadow-sm hover:shadow-md transition-shadow">
            <ShieldCheck className="w-6 h-6 text-primary-600" />
            <b className="block mt-4">مدیریت حساب</b>
            <span className="text-xs text-gray-400 block mt-1">پروفایل و تنظیمات</span>
          </button>
        </div>
        <button onClick={() => setContinueToApp(true)} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-bold shadow-lg shadow-primary-600/20">ورود به محیط کامل {isCarrier ? 'باربری' : isDriver ? 'راننده' : 'صاحب بار'}</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RoleEntry />
    </AuthProvider>
  </StrictMode>
);
