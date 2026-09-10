import { useState } from 'react';
import { AuthPage } from '@/pages/auth/AuthPage';
import { AppShell } from '@/components/layout/AppShell';
import { BottomNav, type TabKey } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Package, LogOut, MapPin, ArrowLeft, Clock3, CheckCircle2, Search, Plus, Bell, User, WalletCards } from 'lucide-react';

const loads = [
  { from: 'تهران', to: 'مشهد', type: 'بار خشک', vehicle: 'تریلی', price: '۲۴,۵۰۰,۰۰۰', time: 'امروز، ۱۴:۳۰' },
  { from: 'کرج', to: 'اصفهان', type: 'مواد غذایی', vehicle: 'کامیون', price: '۱۲,۸۰۰,۰۰۰', time: 'فردا، ۰۸:۰۰' },
  { from: 'تبریز', to: 'تهران', type: 'کالای تجاری', vehicle: 'خاور', price: '۸,۶۰۰,۰۰۰', time: 'فردا، ۱۱:۳۰' },
];

function App() {
  const { session, profile, loading, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [active, setActive] = useState<TabKey>('home');

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-primary-600 font-bold">در حال بارگذاری براه...</div></div>;
  if (!session) return <AuthPage mode={authMode} onModeChange={setAuthMode} />;

  const isDriver = profile?.role === 'driver';

  const home = (
    <div className="space-y-5 pb-24">
      <section className="rounded-3xl bg-primary-600 text-white p-5 shadow-lg shadow-primary-600/15">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-100 text-sm">خوش آمدید 👋</p>
            <h1 className="text-2xl font-black mt-1">{profile?.full_name || 'کاربر براه'}</h1>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><Truck className="w-6 h-6" /></div>
        </div>
        <p className="text-primary-100 text-sm mt-4">{isDriver ? 'بار مناسب مسیرت را پیدا کن و سفر بعدی را شروع کن.' : 'بارت را ثبت کن تا راننده مناسب مسیرت را پیدا کند.'}</p>
        <div className="flex gap-2 mt-5">
          <Button className="bg-white text-primary-700 hover:bg-primary-50 flex-1" onClick={() => setActive(isDriver ? 'discover' : 'create')}>
            {isDriver ? <Search className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isDriver ? 'جستجوی بار' : 'ثبت بار جدید'}
          </Button>
          <Button variant="ghost" className="border border-white/20 text-white hover:bg-white/10" onClick={() => setActive('profile')}><User className="w-4 h-4" /></Button>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: 'سفرها', value: '۰' },
          { icon: CheckCircle2, label: 'تکمیل‌شده', value: '۰' },
          { icon: WalletCards, label: 'موجودی', value: '۰' },
        ].map((item) => <Card key={item.label}><CardBody className="p-3 text-center"><item.icon className="w-5 h-5 mx-auto text-primary-600" /><p className="text-lg font-black mt-2">{item.value}</p><p className="text-[10px] text-gray-400 mt-1">{item.label}</p></CardBody></Card>)}
      </div>

      <div className="flex items-center justify-between"><h2 className="font-black text-gray-900">بارهای پیشنهادی</h2><button onClick={() => setActive('discover')} className="text-sm text-primary-600 font-bold">مشاهده همه</button></div>
      <div className="space-y-3">
        {loads.map((load) => <Card key={load.from + load.to} className="overflow-hidden"><CardBody className="p-4">
          <div className="flex items-center justify-between"><span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-xs font-bold">{load.type}</span><span className="text-xs text-gray-400 flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{load.time}</span></div>
          <div className="flex items-center gap-3 mt-4"><div className="flex-1"><p className="font-black">{load.from}</p><p className="text-xs text-gray-400 mt-1">مبدأ</p></div><ArrowLeft className="w-5 h-5 text-primary-500" /><div className="flex-1 text-left"><p className="font-black">{load.to}</p><p className="text-xs text-gray-400 mt-1">مقصد</p></div></div>
          <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between"><span className="text-xs text-gray-500">{load.vehicle}</span><span className="font-black text-primary-700">{load.price} <small className="font-normal">تومان</small></span></div>
        </CardBody></Card>)}
      </div>
    </div>
  );

  const placeholder = (title: string, icon: typeof Search, text: string, action?: string, target?: TabKey) => <div className="pb-24"><Card><CardBody className="py-16 text-center"><div className="w-16 h-16 rounded-3xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center"><icon className="w-7 h-7" /></div><h2 className="font-black text-xl mt-5">{title}</h2><p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">{text}</p>{action && target && <Button className="mt-6" onClick={() => setActive(target)}><Plus className="w-4 h-4" />{action}</Button>}</CardBody></Card></div>;

  let content = home;
  if (active === 'discover') content = <div className="pb-24"><div className="mb-4"><h1 className="text-2xl font-black">جستجوی بار</h1><p className="text-sm text-gray-400 mt-1">مسیر و بار مناسب خودت را پیدا کن.</p></div><div className="grid grid-cols-2 gap-3 mb-4"><Button variant="outline" className="justify-start"><MapPin className="w-4 h-4 text-primary-600" />مبدأ</Button><Button variant="outline" className="justify-start"><MapPin className="w-4 h-4 text-primary-600" />مقصد</Button></div>{loads.map((load) => <Card key={load.from + load.to} className="mb-3"><CardBody className="p-4"><div className="flex justify-between"><span className="font-black">{load.from} ← {load.to}</span><span className="text-primary-700 font-bold text-sm">{load.price}</span></div><p className="text-sm text-gray-500 mt-2">{load.type} • {load.vehicle}</p><Button className="w-full mt-3">مشاهده جزئیات <ArrowLeft className="w-4 h-4" /></Button></CardBody></Card>)}</div>;
  if (active === 'create') content = placeholder('ثبت بار جدید', Plus, 'جزئیات بار، مبدأ، مقصد و نوع وسیله را وارد کن تا راننده مناسب را پیدا کنیم.', 'شروع ثبت بار', 'create');
  if (active === 'notifications') content = placeholder('اعلان‌ها', Bell, 'اعلان‌های مربوط به بارها، سفرها و وضعیت درخواست‌ها اینجا نمایش داده می‌شوند.');
  if (active === 'profile') content = <div className="pb-24 space-y-4"><Card><CardBody className="p-5 text-center"><div className="w-20 h-20 rounded-full bg-primary-50 text-primary-600 mx-auto flex items-center justify-center"><User className="w-9 h-9" /></div><h2 className="font-black text-xl mt-3">{profile?.full_name || 'کاربر براه'}</h2><p className="text-sm text-gray-400 mt-1">{session.user.email}</p><span className="inline-block mt-3 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">{isDriver ? 'راننده' : 'صاحب بار'}</span></CardBody></Card><Button variant="outline" className="w-full" onClick={signOut}><LogOut className="w-4 h-4" />خروج از حساب</Button></div>;

  return <AppShell header={<header className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur"><div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center"><Truck className="w-5 h-5" /></div><div><p className="font-black text-gray-900 leading-none">براه</p><p className="text-[10px] text-gray-400 mt-1">حمل‌ونقل هوشمند</p></div></div><button onClick={() => setActive('notifications')} className="relative w-10 h-10 rounded-xl hover:bg-gray-50 flex items-center justify-center"><Bell className="w-5 h-5 text-gray-500" /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" /></button></div></header>} bottomNav={<BottomNav active={active} onChange={setActive} showCreate={!isDriver} />}>{content}</AppShell>;
}

export default App;
