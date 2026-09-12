import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from '@/pages/auth/AuthPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import './index.css';
import { Truck } from 'lucide-react';

function Splash({onDone}:{onDone:()=>void}){useEffect(()=>{const t=window.setTimeout(onDone,900);return()=>window.clearTimeout(t)},[onDone]);return <div dir="rtl" className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-100 flex items-center justify-center"><div className="text-center"><div className="mx-auto w-24 h-24 rounded-[30px] bg-primary-600 text-white flex items-center justify-center shadow-2xl shadow-primary-600/25"><Truck className="w-12 h-12"/></div><h1 className="text-4xl font-black text-gray-900 mt-5">براه</h1><p className="text-sm text-gray-400 mt-2">اپلیکیشن رانندگان</p></div></div>}

function RoleEntry(){const{session,profile,loading}=useAuth();const[authMode,setAuthMode]=useState<'login'|'register'>('login');const[profileOpen,setProfileOpen]=useState(false);const[splash,setSplash]=useState(true);useEffect(()=>{const fn=()=>setProfileOpen(true);window.addEventListener('bbberah:open-profile',fn);return()=>window.removeEventListener('bbberah:open-profile',fn)},[]);if(splash)return <Splash onDone={()=>setSplash(false)}/>;if(loading)return <div className="min-h-screen bg-orange-50 flex items-center justify-center font-black text-primary-600">در حال بارگذاری براه...</div>;if(!session||!profile)return <AuthPage mode={authMode} onModeChange={setAuthMode}/>;if(profileOpen)return <ProfilePage onBack={()=>setProfileOpen(false)}/>;return <App/>}

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><RoleEntry/></AuthProvider></StrictMode>);
