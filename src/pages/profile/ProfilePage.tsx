import { useEffect, useState } from 'react';
import {
  ArrowRight, CarFront, ChevronLeft, Moon, ShieldCheck, Sun, User,
  WalletCards, Settings2, Truck, CheckCircle2, Headphones, FileText,
  LogOut, Phone, MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Props = { onBack: () => void; initialSection?: Section };
type Section =
  | 'home' | 'user' | 'vehicle' | 'wallet' | 'identity'
  | 'road' | 'settings' | 'support' | 'rules';

type VehicleScreen =
  | { name: 'types' }
  | { name: 'trailerBodies' }
  | { name: 'trailerFeature'; body: 'کفی' | 'بغلدار' | 'چادری' }
  | { name: 'pending'; title: string };

type VehicleSelection = {
  vehicle: string;
  body?: string;
  feature?: string;
};

const VEHICLES = ['تریلی', 'جفت', 'تک', 'کامیونت', 'وانت و نیسان'];

const TRAILER_BODIES = [
  { title: 'چادری', feature: 'ارتفاع ۲.۷۰' },
  { title: 'بغلدار' },
  { title: 'تیغه' },
  { title: 'کفی' },
  { title: 'کمپرسی' },
  { title: 'تانکر' },
  { title: 'یخچالی' },
] as const;

const TRAILER_DIMENSIONS: Record<'کفی' | 'بغلدار' | 'چادری', string[]> = {
  کفی: ['۹', '۱۱', '۱۲.۲۰', '۱۲.۶۰', '۱۳.۶۰', 'کفی کشویی'],
  بغلدار: ['۹', '۱۱', '۱۲.۲۰', '۱۲.۶۰', '۱۳.۶۰'],
  چادری: ['ارتفاع ۲.۷۰'],
};

function loadVehicle(id?: string): VehicleSelection | null {
  if (!id) return null;
  try {
    const value = localStorage.getItem(`bbberah-fleet-${id}`);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function ProfilePage({ onBack }: Props) {
  const { profile, signOut } = useAuth();
  const [section, setSection] = useState<Section>('home');
  const [vehicleScreen, setVehicleScreen] = useState<VehicleScreen>({ name: 'types' });
  const [selection, setSelection] = useState<VehicleSelection | null>(() => loadVehicle(profile?.id));
  const [saved, setSaved] = useState('');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(
    () => (localStorage.getItem('bbberah-theme') as 'system' | 'light' | 'dark') || 'system'
  );

  const isDriver = profile?.role === 'driver';
  const roleLabel =
    profile?.role === 'driver' ? 'راننده' :
    profile?.role === 'carrier' ? 'باربری' : 'صاحب بار';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('bbberah-theme', theme);
  }, [theme]);

  const saveSelection = (next: VehicleSelection) => {
    setSelection(next);
    if (profile?.id) {
      localStorage.setItem(`bbberah-fleet-${profile.id}`, JSON.stringify(next));
    }
    setSaved('مشخصات خودرو ذخیره شد.');
    window.setTimeout(() => setSaved(''), 2200);
  };

  const openVehicle = () => {
    setSection('vehicle');
    setVehicleScreen({ name: 'types' });
  };

  const cards = [
    { key: 'user' as Section, icon: User, title: 'اطلاعات کاربری', text: 'نام، شماره تلفن و شهر' },
    ...(isDriver
      ? [{ key: 'vehicle' as Section, icon: CarFront, title: 'خودروی من', text: 'نوع خودرو، بارگیر و کاربری' }]
      : []),
    { key: 'wallet' as Section, icon: WalletCards, title: 'کیف پول', text: 'موجودی و تراکنش‌ها' },
    { key: 'identity' as Section, icon: ShieldCheck, title: 'احراز هویت', text: 'وضعیت هویت و مدارک' },
    { key: 'road' as Section, icon: Truck, title: 'راهداری', text: 'اطلاعات و خدمات مرتبط با راهداری' },
    { key: 'settings' as Section, icon: Settings2, title: 'تنظیمات برنامه', text: 'حالت شب، روز یا خودکار' },
    { key: 'support' as Section, icon: Headphones, title: 'پشتیبانی', text: 'ارتباط با پشتیبانی براه' },
    { key: 'rules' as Section, icon: FileText, title: 'قوانین و مقررات', text: 'شرایط استفاده از براه' }
  ];

  if (section === 'home') {
    return (
      <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-5">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold">
              <ArrowRight className="w-5 h-5" /> بازگشت
            </button>
            <button
              onClick={async () => {
                if (confirm('آیا از حساب کاربری خارج می‌شوید؟')) await signOut();
              }}
              className="flex items-center gap-2 text-red-500 font-bold"
            >
              <LogOut className="w-5 h-5" /> خروج از حساب
            </button>
          </div>

          <div className="rounded-[28px] bg-primary-600 text-white p-6 shadow-xl shadow-primary-600/20 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-white/15 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black">پروفایل من</h1>
                <p className="text-orange-100 mt-1">{profile?.full_name} · {roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {cards.map(({ key, icon: Icon, title, text }) => (
              <button
                key={key}
                onClick={() => key === 'vehicle' ? openVehicle() : setSection(key)}
                className="w-full text-right rounded-[24px] bg-white border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="w-14 h-14 rounded-2xl bg-orange-100 text-primary-600 flex items-center justify-center">
                    <Icon className="w-7 h-7" />
                  </span>
                  <span className="flex-1">
                    <b className="block text-lg">{title}</b>
                    <small className="text-gray-400 block mt-1">{text}</small>
                  </span>
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'vehicle') {
    const goBack = () => {
      if (vehicleScreen.name === 'types') {
        setSection('home');
        return;
      }
      if (vehicleScreen.name === 'trailerBodies' || vehicleScreen.name === 'pending') {
        setVehicleScreen({ name: 'types' });
        return;
      }
      setVehicleScreen({ name: 'trailerBodies' });
    };

    const title =
      vehicleScreen.name === 'types' ? 'خودروی خود را انتخاب کنید' :
      vehicleScreen.name === 'trailerBodies' ? 'نوع بارگیر تریلی را انتخاب کنید' :
      vehicleScreen.name === 'trailerFeature' ? 'ویژگی کاربری' :
      vehicleScreen.title;

    return (
      <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
        <div className="max-w-lg mx-auto">
          <button onClick={goBack} className="flex items-center gap-2 text-gray-500 font-bold mb-7">
            <ArrowRight className="w-5 h-5" /> بازگشت
          </button>

          <h1 className="text-2xl font-black">{title}</h1>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            {vehicleScreen.name === 'types'
              ? 'نوع خودروی خود را انتخاب کنید.'
              : vehicleScreen.name === 'trailerBodies'
                ? 'بارگیر موردنظر خود را انتخاب کنید.'
                : vehicleScreen.name === 'trailerFeature'
                  ? 'ویژگی موردنظر را انتخاب کنید.'
                  : 'این مسیر فعلاً تکمیل نشده است.'}
          </p>

          {vehicleScreen.name === 'types' && (
            <div className="grid gap-3">
              {VEHICLES.map(vehicle => (
                <button
                  key={vehicle}
                  onClick={() => {
                    if (vehicle === 'تریلی') {
                      setSelection({ vehicle });
                      setVehicleScreen({ name: 'trailerBodies' });
                    } else {
                      setVehicleScreen({ name: 'pending', title: vehicle });
                    }
                  }}
                  className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <CarFront className="w-6 h-6 text-primary-600" />
                    <span className="flex-1">{vehicle}</span>
                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {vehicleScreen.name === 'trailerBodies' && (
            <div className="grid gap-3">
              {TRAILER_BODIES.map(body => (
                <button
                  key={body.title}
                  onClick={() => {
                    if (body.title === 'کفی' || body.title === 'بغلدار' || body.title === 'چادری') {
                      setVehicleScreen({ name: 'trailerFeature', body: body.title });
                    } else {
                      saveSelection({ vehicle: 'تریلی', body: body.title });
                      setVehicleScreen({ name: 'types' });
                    }
                  }}
                  className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-primary-600" />
                    <span className="flex-1">{body.title}</span>
                    <ChevronLeft className="w-5 h-5 text-gray-300" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {vehicleScreen.name === 'trailerFeature' && (
            <div className="grid gap-3">
              {TRAILER_DIMENSIONS[vehicleScreen.body].map(feature => (
                <button
                  key={feature}
                  onClick={() => saveSelection({
                    vehicle: 'تریلی',
                    body: vehicleScreen.body,
                    feature
                  })}
                  className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500 transition-colors"
                >
                  {feature}
                  <span className="block text-xs text-gray-400 font-normal mt-1">انتخاب</span>
                </button>
              ))}
              {saved && (
                <p className="text-primary-700 font-bold flex items-center gap-2 mt-2">
                  <CheckCircle2 className="w-5 h-5" /> {saved}
                </p>
              )}
            </div>
          )}

          {vehicleScreen.name === 'pending' && (
            <div className="rounded-[24px] bg-white border border-orange-100 p-6 text-center">
              <CarFront className="w-12 h-12 text-primary-600 mx-auto" />
              <h2 className="text-xl font-black mt-4">{vehicleScreen.title}</h2>
              <p className="text-gray-500 leading-7 mt-3">
                مسیر این خودرو فعلاً در این نسخه پیاده‌سازی نشده و بعداً اضافه می‌شود.
              </p>
            </div>
          )}

          {selection && vehicleScreen.name === 'types' && (
            <div className="mt-6 rounded-[24px] bg-white border border-orange-100 p-5">
              <p className="text-xs text-gray-400">خودروی انتخاب‌شده</p>
              <p className="font-black text-lg mt-1">{selection.vehicle}</p>
              {selection.body && <p className="text-gray-600 mt-1">{selection.body}{selection.feature ? ` · ${selection.feature}` : ''}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  const title = cards.find(x => x.key === section)?.title || '';

  return (
    <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setSection('home')} className="flex items-center gap-2 text-gray-500 font-bold mb-5">
          <ArrowRight className="w-5 h-5" /> پروفایل
        </button>
        <h1 className="text-2xl font-black mb-5">{title}</h1>

        {section === 'user' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-5 space-y-4">
            <div><label className="text-sm text-gray-400">نام و نام خانوادگی</label><div className="mt-2 rounded-2xl bg-gray-50 p-4 font-bold">{profile?.full_name || 'ثبت نشده'}</div></div>
            <div><label className="text-sm text-gray-400">شماره تلفن</label><div className="mt-2 rounded-2xl bg-gray-50 p-4 font-bold">{profile?.phone || 'ثبت نشده'}</div></div>
            <div><label className="text-sm text-gray-400">شهر</label><div className="mt-2 rounded-2xl bg-gray-50 p-4 font-bold">{profile?.city || 'ثبت نشده'}</div></div>
          </div>
        )}

        {section === 'wallet' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-6">
            <WalletCards className="w-10 h-10 text-primary-600" />
            <p className="text-gray-400 mt-4">موجودی کیف پول</p>
            <div className="text-3xl font-black mt-2">۰ تومان</div>
          </div>
        )}

        {section === 'identity' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-6">
            <ShieldCheck className="w-10 h-10 text-primary-600" />
            <h2 className="text-xl font-black mt-4">احراز هویت</h2>
            <p className="text-gray-400 mt-2 leading-7">وضعیت احراز هویت و مدارک شما از این بخش مدیریت می‌شود.</p>
          </div>
        )}

        {section === 'road' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-6">
            <Truck className="w-10 h-10 text-primary-600" />
            <h2 className="text-xl font-black mt-4">راهداری</h2>
            <p className="text-gray-400 mt-2 leading-7">اطلاعات و خدمات مرتبط با راهداری در این بخش قرار می‌گیرد.</p>
          </div>
        )}

        {section === 'support' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-6">
            <Headphones className="w-10 h-10 text-primary-600" />
            <h2 className="text-xl font-black mt-4">پشتیبانی براه</h2>
            <p className="text-gray-400 mt-2 leading-7">برای پیگیری مشکل یا دریافت راهنمایی از این بخش استفاده کنید.</p>
            <button className="w-full mt-5 rounded-2xl bg-primary-600 text-white py-4 font-black flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" /> ارسال درخواست پشتیبانی</button>
            <button className="w-full mt-3 rounded-2xl border border-orange-200 text-primary-700 py-4 font-black flex items-center justify-center gap-2"><Phone className="w-5 h-5" /> تماس با پشتیبانی</button>
          </div>
        )}

        {section === 'rules' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-6 leading-8 text-gray-600">
            <FileText className="w-10 h-10 text-primary-600" />
            <h2 className="text-xl font-black text-gray-900 mt-4">قوانین و مقررات</h2>
            <p className="mt-4">استفاده از براه به معنی پذیرش قوانین و مقررات استفاده از بازارگاه حمل‌ونقل است.</p>
            <p className="mt-3">اطلاعات ثبت‌شده باید صحیح و متعلق به صاحب حساب باشد و کاربران مسئول حفظ اطلاعات حساب خود هستند.</p>
          </div>
        )}

        {section === 'settings' && (
          <div className="rounded-[24px] bg-white border border-orange-100 p-5">
            <h2 className="font-black text-lg mb-4">حالت نمایش برنامه</h2>
            <div className="grid gap-3">
              {([
                ['system', 'خودکار', Settings2],
                ['light', 'روز', Sun],
                ['dark', 'شب', Moon]
              ] as const).map(([value, label, Icon]) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${theme === value ? 'border-primary-500 bg-orange-50' : 'border-gray-100'}`}
                >
                  <Icon className="w-6 h-6 text-primary-600" />
                  <span className="flex-1 text-right font-bold">{label}</span>
                  {theme === value && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
