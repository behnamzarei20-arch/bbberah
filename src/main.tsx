import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import './index.css';
import { Truck, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { ADMIN_DEMO_MODE } from '@/features/admin/demoMode';

const AdminWorkspace = lazy(() => import('@/pages/admin/AdminWorkspace').then(module => ({ default: module.AdminWorkspace })));

function Splash({onDone}:{onDone:()=>void}){useEffect(()=>{const t=window.setTimeout(onDone,900);return()=>window.clearTimeout(t)},[onDone]);return <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-100 flex items-center justify-center"><div className="text-center"><div className="mx-auto w-24 h-24 rounded-[30px] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-600/25"><Truck className="w-12 h-12"/></div><h1 className="text-4xl font-black text-gray-900 mt-5">براه</h1><p className="text-sm text-gray-400 mt-2">اپلیکیشن براه</p></div></div>}


type AdminRole = 'owner' | 'support' | 'reviewer';
type DemoAdminAccount = {username:string;password:string;role:AdminRole;label:string;description:string;permissions:string[]};


function AdminLogin({onSuccess}:{onSuccess:(role:AdminRole)=>void}) {
  const [username,setUsername] = useState('admin1');
  const [password,setPassword] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState('');
  const [accounts,setAccounts] = useState<DemoAdminAccount[]>([]);
  useEffect(() => {
    if (!ADMIN_DEMO_MODE) return;
    let active = true;
    import('@/features/admin/demoData').then(({demoAdminAccounts}) => {
      if (active) setAccounts(demoAdminAccounts);
    }).catch(() => {
      if (active) setError('بارگذاری پیش‌نمایش انجام نشد. صفحه را دوباره بارگذاری کنید.');
    });
    return () => { active = false; };
  }, []);
  function choose(account:DemoAdminAccount) { setUsername(account.username); setPassword(account.password); setError(''); }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanUsername=username.trim().replace(/[\u200B-\u200D\uFEFF]/g,'');
    const cleanPassword=password.trim().replace(/[\u200B-\u200D\uFEFF]/g,'');
    const account=accounts.find(item=>item.username===cleanUsername&&item.password===cleanPassword);
    if(account) { setError(''); onSuccess(account.role); }
    else setError('نام کاربری یا رمز عبور صحیح نیست.');
  }
  const selected=accounts.find(item=>item.username===username)||accounts[0];
  if (!ADMIN_DEMO_MODE) return <main dir="rtl" className="min-h-screen bg-slate-50 px-4 py-10 flex items-center justify-center"><section className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><ShieldCheck size={36} className="mx-auto text-slate-400"/><h1 className="mt-4 text-xl font-black text-slate-900">پنل نمایشی مدیریت غیرفعال است</h1><p className="mt-3 text-sm leading-7 text-slate-600">داده‌ها و ورود آزمایشی مدیران در این build غیرفعال‌اند. برای فعال‌سازی پیش‌نمایش، متغیر VITE_ENABLE_ADMIN_DEMO_DATA را فقط در محیط آزمایشی روی true قرار دهید. این پنل تا اتصال احراز هویت و مجوزهای سمت سرور نباید برای مدیریت واقعی استفاده شود.</p><a href="/bbberah/" className="mt-5 inline-flex rounded-xl bg-sky-900 px-4 py-3 text-sm font-bold text-white">بازگشت به براه</a></section></main>;
  return <main dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-sky-50 px-4 py-8 flex items-center justify-center">
    <section className="w-full max-w-4xl rounded-[28px] border border-slate-200 bg-white p-5 sm:p-8 shadow-xl shadow-slate-900/5">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-900 text-white shadow-lg"><ShieldCheck size={28}/></div>
      <div className="text-center"><p className="text-xs font-black tracking-wide text-sky-800">بَراه · مدیریت</p><h1 className="mt-2 text-2xl font-black text-slate-900">انتخاب حالت ورود مدیران</h1><p className="mt-3 text-sm leading-6 text-slate-500">هر حساب را انتخاب کنید تا سطح دسترسی و بخش‌های قابل مشاهده را آزمایش کنید.</p></div>
      <div className="mt-7 grid gap-3 md:grid-cols-3">{accounts.map(account=><button type="button" key={account.username} onClick={()=>choose(account)} className={'rounded-2xl border p-4 text-right transition '+(username===account.username?'border-sky-700 bg-sky-50 ring-2 ring-sky-100':'border-slate-200 hover:border-sky-300')}><div className="flex items-center justify-between gap-2"><b className="text-base text-slate-900">{account.label}</b><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-sky-800" dir="ltr">{account.username}</span></div><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{account.description}</p><div className="mt-3 space-y-1.5">{account.permissions.map(item=><p key={item} className="flex items-start gap-2 text-xs text-slate-700"><span className="text-emerald-600">✓</span>{item}</p>)}</div><div className="mt-4 rounded-lg bg-slate-100 p-2 text-xs"><span className="text-slate-500">رمز آزمایشی: </span><b dir="ltr" className="select-all">{account.password}</b></div></button>)}</div>
      <form className="mx-auto mt-6 max-w-md space-y-4" onSubmit={submit}>
        <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-bold text-slate-700">نام کاربری<input autoComplete="username" value={username} onChange={e=>{setUsername(e.target.value);setError('')}} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-left outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100" dir="ltr" required/></label><label className="block text-sm font-bold text-slate-700">رمز عبور<div className="relative mt-2"><input autoComplete="current-password" type={showPassword?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setError('')}} placeholder="رمز ورود" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 pl-10 text-left outline-none focus:border-sky-700 focus:ring-4 focus:ring-sky-100" dir="ltr" required/><button type="button" aria-label={showPassword?'مخفی کردن رمز':'نمایش رمز'} onClick={()=>setShowPassword(v=>!v)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:bg-slate-100">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label></div>
        <p className="text-xs text-slate-500">حالت انتخاب‌شده: <b>{selected?.label || 'در حال بارگذاری...'}</b></p>
        {error && <p role="alert" className="text-sm font-bold text-rose-600">{error}</p>}
        <button type="submit" className="w-full rounded-xl bg-sky-900 px-4 py-3.5 font-black text-white transition hover:bg-sky-950">ورود به پنل با این سطح دسترسی</button>
      </form>
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-900"><p className="font-black">فقط برای آزمایش رابط کاربری</p><p>نام‌های کاربری و رمزها در این نسخه نمایشی‌اند و به‌دلیل نبود احراز هویت سمت سرور، امنیت واقعی ایجاد نمی‌کنند. اطلاعات و سطح دسترسی واقعی باید در بک‌اند اعمال شوند.</p></div>
      <a href="/bbberah/" className="mt-5 block text-center text-sm font-bold text-slate-500 hover:text-sky-900">بازگشت به برنامه براه</a>
    </section>
  </main>;
}

function RoleEntry(){const{session,profile,loading}=useAuth();const[authMode,setAuthMode]=useState<'login'|'register'>('login');const[profileOpen,setProfileOpen]=useState(false);const[splash,setSplash]=useState(true);const[adminUnlocked,setAdminUnlocked]=useState(false);const[adminRole,setAdminRole]=useState<'owner'|'support'|'reviewer'>('owner');useEffect(()=>{const fn=()=>setProfileOpen(true);window.addEventListener('bbberah:open-profile',fn);return()=>window.removeEventListener('bbberah:open-profile',fn)},[]);if(new URLSearchParams(window.location.search).has('admin-preview')||window.location.pathname.includes('/admin-preview'))return <Suspense fallback={<div dir="rtl" className="min-h-screen flex items-center justify-center font-bold">در حال بارگذاری پنل مدیریت...</div>}><AdminWorkspace role="owner"/></Suspense>;if(window.location.pathname.replace(/\/$/,'').endsWith('/admin')||new URLSearchParams(window.location.search).has('admin'))return adminUnlocked?<Suspense fallback={<div dir="rtl" className="min-h-screen flex items-center justify-center font-bold">در حال بارگذاری پنل مدیریت...</div>}><AdminWorkspace role={adminRole} onExit={()=>setAdminUnlocked(false)}/></Suspense>:<AdminLogin onSuccess={role=>{setAdminRole(role);setAdminUnlocked(true)}}/>;if(splash)return <Splash onDone={()=>setSplash(false)}/>;if(loading)return <div className="min-h-screen bg-primary-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;if(!session||!profile)return <AuthPage mode={authMode} onModeChange={setAuthMode}/>;if(profileOpen)return <ProfilePage onBack={()=>setProfileOpen(false)}/>;return <App/>}

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RoleEntry/></AuthProvider></StrictMode>);
