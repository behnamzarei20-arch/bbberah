import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import './index.css';
import { Truck, Package, Building2, Search, Plus, ShieldCheck, Navigation, MapPin } from 'lucide-react';

function RoleEntry() {
  const { session, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [continueToApp, setContinueToApp] = useState(false);

  if (loading) return <div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;
  if (!session || !profile) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  if (continueToApp) return <App />;

  const role = profile.role;
  const isDriver = role === 'driver';
  const isCarrier = role === 'carrier';
  const title = isDriver ? 'داشبورد راننده' : isCarrier ? 'محیط باربری' : 'محیط صاحب بار';
  const subtitle = isDriver ? 'بار مناسب مسیرت را پیدا کن؛ مبدأ را از GPS بگیر و مقصد را از بین شهرها انتخاب کن.' : isCarrier ? 'بارهای مجموعه را مدیریت کن، بار جدید ثبت کن و وضعیت حمل را دنبال کن.' : 'بار جدید ثبت کن، راننده مناسب را پیدا کن و حمل‌ونقل را مدیریت کن.';

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 px-4 py-7">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/20">
            {isDriver ? <Truck className="w-6 h-6" /> : isCarrier ? <Building2 className="w-6 h-6" /> : <Package className="w-6 h-6" />}
          </div>
          <div><b className="text-xl">براه</b><p className="text-xs text-gray-400">بازارگاه حمل‌ونقل</p></div>
        </div>

        {isDriver ? (
          <>
            <section className="rounded-[28px] bg-primary-600 text-white p-6 shadow-xl shadow-primary-600/20">
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><ShieldCheck className="w-4 h-4"/>حساب راننده</span><Truck className="w-8 h-8 text-orange-100"/></div>
              <h1 className="text-3xl font-black mt-6">جستجوی بار</h1>
              <p className="text-orange-100 text-sm leading-7 mt-2">{profile.full_name}، مسیرت را سریع پیدا کن؛ GPS مبدأ را مشخص می‌کند و مقصد می‌تواند «همه شهرها» باشد.</p>
            </section>
            <button onClick={() => setContinueToApp(true)} className="w-full text-right rounded-3xl bg-white border-2 border-orange-200 p-5 shadow-sm hover:border-primary-500 transition-all">
              <div className="flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center"><Navigation className="w-6 h-6"/></span><span className="flex-1"><b className="block text-lg">اطراف من با GPS</b><small className="text-gray-400 block mt-1">نمایش بارهای نزدیک به موقعیت فعلی</small></span><Search className="w-5 h-5 text-primary-500"/></div>
            </button>
            <button onClick={() => setContinueToApp(true)} className="w-full text-right rounded-3xl bg-white border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center"><MapPin className="w-6 h-6"/></span><span className="flex-1"><b className="block text-lg">مقصد: همه شهرها</b><small className="text-gray-400 block mt-1">یا انتخاب یک شهر مشخص از فهرست مقصدها</small></span><Search className="w-5 h-5 text-primary-500"/></div>
            </button>
            <button onClick={() => setContinueToApp(true)} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-bold shadow-lg shadow-primary-600/20">ورود به جستجوی کامل بارها</button>
          </>
        ) : (
          <>
            <section className="rounded-3xl bg-primary-600 text-white p-6 shadow-xl shadow-primary-600/20">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><ShieldCheck className="w-4 h-4" />{isCarrier ? 'حساب باربری' : 'حساب صاحب بار'}</span>
              <h1 className="text-3xl font-black mt-5">{title}</h1>
              <p className="text-orange-100 text-sm leading-7 mt-3">سلام {profile.full_name}، {subtitle}</p>
            </section>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setContinueToApp(true)} className="rounded-2xl bg-white border border-orange-100 p-5 text-right shadow-sm hover:shadow-md transition-shadow"><Plus className="w-6 h-6 text-primary-600" /><b className="block mt-4">ثبت بار جدید</b><span className="text-xs text-gray-400 block mt-1">ایجاد و مدیریت بار</span></button>
              <button onClick={() => setContinueToApp(true)} className="rounded-2xl bg-white border border-orange-100 p-5 text-right shadow-sm hover:shadow-md transition-shadow"><ShieldCheck className="w-6 h-6 text-primary-600" /><b className="block mt-4">مدیریت حساب</b><span className="text-xs text-gray-400 block mt-1">پروفایل و تنظیمات</span></button>
            </div>
            <button onClick={() => setContinueToApp(true)} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-bold shadow-lg shadow-primary-600/20">ورود به محیط {isCarrier ? 'باربری' : 'صاحب بار'}</button>
          </>
        )}
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
