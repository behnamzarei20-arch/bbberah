import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import './index.css';
import { Truck, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { AdminWorkspace } from '@/pages/admin/AdminWorkspace';

function Splash({onDone}:{onDone:()=>void}){useEffect(()=>{const t=window.setTimeout(onDone,900);return()=>window.clearTimeout(t)},[onDone]);return <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-100 flex items-center justify-center"><div className="text-center"><div className="mx-auto w-24 h-24 rounded-[30px] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-600/25"><Truck className="w-12 h-12"/></div><h1 className="text-4xl font-black text-gray-900 mt-5">براه</h1><p className="text-sm text-gray-400 mt-2">اپلیکیشن براه</p></div></div>}


const DEMO_ADMIN_PASSWORD = 'BR-demo-1405';

function AdminLogin({onSuccess}:{onSuccess:()=>void}) {
  const [password,setPassword] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState('');
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(password === DEMO_ADMIN_PASSWORD) { setError(''); onSuccess(); }
    else setError('رمز واردشده صحیح نیست.');
  }
  return <main dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 px-4 flex items-center justify-center">
    <section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 sm:p-9 shadow-xl shadow-slate-900/5">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-900 text-white shadow-lg"><ShieldCheck size={30}/></div>
      <div className="text-center"><p className="text-xs font-black tracking-wide text-sky-800">بَراه · مدیریت</p><h1 className="mt-2 text-2xl font-black text-slate-900">ورود به پنل مدیریت</h1><p className="mt-3 text-sm leading-6 text-slate-500">برای مشاهده پیش‌نمایش پنل، رمز نمایشی را وارد کنید.</p></div>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-bold text-slate-700" htmlFor="admin-demo-password">رمز عبور</label>
        <div className="relative"><input id="admin-demo-password" autoComplete="current-password" type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="رمز ورود نمایشی" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-12 text-left outline-none transition focus:border-sky-700 focus:ring-4 focus:ring-sky-100" dir="ltr" required/><button type="button" aria-label={showPassword?'مخفی کردن رمز':'نمایش رمز'} onClick={()=>setShowPassword(v=>!v)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100">{showPassword?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
        {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-sky-900 px-4 py-3.5 font-black text-white transition hover:bg-sky-950">ورود به پیش‌نمایش</button>
      </form>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900"><p className="font-black">حالت نمایشی</p><p>رمز آزمایشی: <b dir="ltr">BR-demo-1405</b></p><p>این رمز فقط برای نمایش رابط کاربری است و امنیت واقعی ایجاد نمی‌کند. داده‌های پنل ساختگی‌اند.</p></div>
      <a href="/bbberah/" className="mt-5 block text-center text-sm font-bold text-slate-500 hover:text-sky-900">بازگشت به برنامه براه</a>
    </section>
  </main>;
}

function RoleEntry(){const{session,profile,loading}=useAuth();const[authMode,setAuthMode]=useState<'login'|'register'>('login');const[profileOpen,setProfileOpen]=useState(false);const[splash,setSplash]=useState(true);const[adminUnlocked,setAdminUnlocked]=useState(false);useEffect(()=>{const fn=()=>setProfileOpen(true);window.addEventListener('bbberah:open-profile',fn);return()=>window.removeEventListener('bbberah:open-profile',fn)},[]);if(window.location.pathname.replace(/\/$/,'').endsWith('/admin')||new URLSearchParams(window.location.search).has('admin'))return adminUnlocked?<AdminWorkspace/>:<AdminLogin onSuccess={()=>setAdminUnlocked(true)}/>;if(splash)return <Splash onDone={()=>setSplash(false)}/>;if(loading)return <div className="min-h-screen bg-primary-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;if(!session||!profile)return <AuthPage mode={authMode} onModeChange={setAuthMode}/>;if(profileOpen)return <ProfilePage onBack={()=>setProfileOpen(false)}/>;return <App/>}

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RoleEntry/></AuthProvider></StrictMode>);
