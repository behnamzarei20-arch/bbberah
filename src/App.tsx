import { useState } from 'react';
import { AuthPage } from '@/pages/auth/AuthPage';
import { AppShell } from '@/components/layout/AppShell';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Package, LogOut } from 'lucide-react';

function App() {
  const { session, profile, loading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center animate-pulse">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-sm">در حال بارگذاری...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage mode={authMode} onModeChange={setAuthMode} />;
  }

  return (
    <AppShell
      header={
        <header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
          <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-none">براه</p>
                <p className="text-[11px] text-gray-400 mt-1">پنل کاربری</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} aria-label="خروج">
              <LogOut className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </header>
      }
      bottomNav={<BottomNav />}
    >
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">خوش آمدید</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {profile?.full_name || session.user.email}
          </h1>
        </div>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
              {profile?.role === 'driver' ? <Truck className="w-6 h-6" /> : <Package className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {profile?.role === 'driver' ? 'راننده' : 'صاحب بار'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {profile?.role === 'driver' ? 'آماده جستجوی بارهای مناسب' : 'مدیریت و ثبت بارهای شما'}
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

export default App;
