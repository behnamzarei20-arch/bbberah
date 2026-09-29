import { useState } from 'react';
import { AuthPage } from '@/pages/auth/AuthPage';
import { useAuth } from '@/contexts/AuthContext';
import { MainApp } from '@/MainApp';

export default function App() {
  const { session, profile, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center bg-[#f8f8f7]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center mx-auto animate-pulse font-black text-xl">ب</div>
          <p className="mt-4 font-bold text-gray-600">در حال بارگذاری براه...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  }

  return <MainApp />;
}
