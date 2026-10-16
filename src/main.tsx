import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import './index.css';
import { Truck, ShieldAlert } from 'lucide-react';

function Splash({onDone}:{onDone:()=>void}){useEffect(()=>{const t=window.setTimeout(onDone,900);return()=>window.clearTimeout(t)},[onDone]);return <div dir="rtl" className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-100 flex items-center justify-center"><div className="text-center"><div className="mx-auto w-24 h-24 rounded-[30px] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-600/25"><Truck className="w-12 h-12"/></div><h1 className="text-4xl font-black text-gray-900 mt-5">براه</h1><p className="text-sm text-gray-400 mt-2">اپلیکیشن رانندگان</p></div></div>}

function AdminAccessNotice(){return <main dir="rtl" className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10"><section className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><ShieldAlert className="h-7 w-7"/></div><h1 className="text-xl font-black text-slate-900">ورود مدیر نیازمند احراز هویت واقعی است</h1><p className="mt-3 text-sm leading-7 text-slate-600">این نسخه هنوز ورود امن مدیر و تأیید MFA را به رابط کاربری متصل نکرده است. برای جلوگیری از دسترسی با نشانی مستقیم، پنل مدیریت از این مسیر نمایش داده نمی‌شود. هیچ اطلاعات واقعی یا محرمانه‌ای در نسخه آزمایشی وارد نکنید.</p><a href="./" className="mt-6 inline-flex rounded-xl bg-sky-800 px-5 py-3 font-bold text-white">بازگشت به برنامه</a></section></main>}

function RoleEntry(){const{session,profile,loading}=useAuth();const[authMode,setAuthMode]=useState<'login'|'register'>('login');const[profileOpen,setProfileOpen]=useState(false);const[splash,setSplash]=useState(true);useEffect(()=>{const fn=()=>setProfileOpen(true);window.addEventListener('bbberah:open-profile',fn);return()=>window.removeEventListener('bbberah:open-profile',fn)},[]);if(window.location.pathname.replace(/\/$/,'').endsWith('/admin')||new URLSearchParams(window.location.search).has('admin'))return <AdminAccessNotice/>;if(splash)return <Splash onDone={()=>setSplash(false)}/>;if(loading)return <div className="min-h-screen bg-primary-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;if(!session||!profile)return <AuthPage mode={authMode} onModeChange={setAuthMode}/>;if(profileOpen)return <ProfilePage onBack={()=>setProfileOpen(false)}/>;return <App/>}

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RoleEntry/></AuthProvider></StrictMode>);
