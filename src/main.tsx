import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import './index.css';
import { Truck, Package, Building2, Search, Plus, ShieldCheck, Navigation, MapPin } from 'lucide-react';

function RoleEntry() {
  const { session, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [continueToApp, setContinueToApp] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => { const fn=()=>setProfileOpen(true); window.addEventListener('bbberah:open-profile', fn); return ()=>window.removeEventListener('bbberah:open-profile', fn); }, []);
  if (loading) return <div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;
  if (!session || !profile) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  if (profileOpen) return <ProfilePage onBack={() => setProfileOpen(false)} />;
  if (continueToApp) return <App />;
  const isDriver=profile.role==='driver'; const isCarrier=profile.role==='carrier';
  const enterApp=()=>{ if(isDriver){try{const key='bbberah-demo-loads';const raw=localStorage.getItem(key);if(raw){const all=JSON.parse(raw);if(Array.isArray(all)){localStorage.setItem(key,JSON.stringify(all.filter((x:any)=>x.ownerId!==profile.id)));window.setTimeout(()=>localStorage.setItem(key,raw),250);}}}catch{}} setContinueToApp(true); };
  return <div dir="rtl" className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 px-4 py-7"><div className="max-w-lg mx-auto space-y-5">
    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center">{isDriver?<Truck className="w-6 h-6"/>:isCarrier?<Building2 className="w-6 h-6"/>:<Package className="w-6 h-6"/>}</div><div><b className="text-xl">براه</b><p className="text-xs text-gray-400">بازارگاه حمل‌ونقل</p></div></div>
    {isDriver ? <><section className="rounded-[28px] bg-primary-600 text-white p-6 shadow-xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><ShieldCheck className="w-4 h-4"/>حساب راننده</span><h1 className="text-3xl font-black mt-6">جستجوی بار</h1><p className="text-orange-100 text-sm leading-7 mt-2">{profile.full_name}، بار مناسب مسیرت را پیدا کن.</p></section><button onClick={enterApp} className="w-full text-right rounded-3xl bg-white border-2 border-orange-200 p-5 shadow-sm"><div className="flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center"><Navigation className="w-6 h-6"/></span><span className="flex-1"><b className="block text-lg">اطراف من با GPS</b><small className="text-gray-400">مبدأ از موقعیت فعلی</small></span><Search className="w-5 h-5 text-primary-500"/></div></button><button onClick={enterApp} className="w-full text-right rounded-3xl bg-white border border-orange-100 p-5 shadow-sm"><div className="flex items-center gap-4"><span className="w-12 h-12 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center"><MapPin className="w-6 h-6"/></span><span className="flex-1"><b className="block text-lg">مقصد: همه شهرها</b><small className="text-gray-400">یا انتخاب شهر مشخص</small></span><Search className="w-5 h-5 text-primary-500"/></div></button><button onClick={()=>setProfileOpen(true)} className="w-full rounded-2xl bg-white border border-orange-100 p-5 text-right shadow-sm"><b className="block text-lg">پروفایل و ناوگان من</b><span className="text-xs text-gray-400">اطلاعات کاربری، خودرو، کیف پول و تنظیمات</span></button><button onClick={enterApp} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-bold">ورود به جستجوی کامل بارها</button></> : <><section className="rounded-3xl bg-primary-600 text-white p-6 shadow-xl"><span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold"><ShieldCheck className="w-4 h-4"/>{isCarrier?'حساب باربری':'حساب صاحب بار'}</span><h1 className="text-3xl font-black mt-5">{isCarrier?'محیط باربری':'محیط صاحب بار'}</h1><p className="text-orange-100 text-sm leading-7 mt-3">سلام {profile.full_name}</p></section><div className="grid grid-cols-2 gap-3"><button onClick={enterApp} className="rounded-2xl bg-white border border-orange-100 p-5 text-right shadow-sm"><Plus className="w-6 h-6 text-primary-600"/><b className="block mt-4">ثبت بار جدید</b></button><button onClick={()=>setProfileOpen(true)} className="rounded-2xl bg-white border border-orange-100 p-5 text-right shadow-sm"><ShieldCheck className="w-6 h-6 text-primary-600"/><b className="block mt-4">پروفایل من</b><span className="text-xs text-gray-400">تنظیمات و اطلاعات</span></button></div><button onClick={enterApp} className="w-full rounded-2xl bg-primary-600 text-white py-4 font-bold">ورود به محیط {isCarrier?'باربری':'صاحب بار'}</button></>}
  </div></div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RoleEntry /></AuthProvider></StrictMode>);
