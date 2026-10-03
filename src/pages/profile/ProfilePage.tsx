import { useEffect, useState } from 'react';
import { ArrowRight, CarFront, ChevronLeft, Moon, ShieldCheck, Sun, User, WalletCards, Settings2, Truck, CheckCircle2, Headphones, FileText, LogOut, Phone, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Props = { onBack: () => void; initialSection?: Section };
type Section = 'home' | 'user' | 'vehicle' | 'wallet' | 'identity' | 'road' | 'settings' | 'support' | 'rules';
// اضافه شدن 'plate' به VehicleStep
type VehicleStep = 'type' | 'body' | 'feature' | 'plate';

const VEHICLES = ['تریلی', 'جفت', 'تک', 'کامیونت و خاور', 'وانت و نیسان'];
const BODIES = ['روباز', 'مسقف', 'یخچال', 'کمپرسی'];
const BODY_FEATURES = ['بغل بازشو', 'معمولی', 'چادری', 'فلزی'];
// اضافه شدن حروف پلاک فارسی
const LETTERS = ['ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];

const fa = (v: string) => v.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] || d);
export const en = (s: string) => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

// اضافه شدن اطلاعات پلاک به مدل خودرو
type VehicleData = {
    vehicleType: string;
    bodyType: string;
    bodyFeature: string;
    platePart1: string; // دو رقم اول
    plateLetter: string; // حرف
    platePart3: string; // سه رقم بعدی
    plateIranCode: string; // کد ایران
};

function loadVehicle(id?: string): VehicleData {
    try {
        return JSON.parse(localStorage.getItem(`bbberah-fleet-${id}`) || 'null') || {
            vehicleType: '',
            bodyType: '',
            bodyFeature: '',
            platePart1: '',
            plateLetter: '',
            platePart3: '',
            plateIranCode: ''
        };
    } catch {
        return {
            vehicleType: '',
            bodyType: '',
            bodyFeature: '',
            platePart1: '',
            plateLetter: '',
            platePart3: '',
            plateIranCode: ''
        };
    }
}

export function ProfilePage({ onBack }: Props) {
    const { profile, signOut } = useAuth();
    const [section, setSection] = useState<Section>('home');
    const [vehicleStep, setVehicleStep] = useState<VehicleStep>('type');
    const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => (localStorage.getItem('bbberah-theme') as any) || 'system');
    const [vehicle, setVehicle] = useState<VehicleData>(() => loadVehicle(profile?.id));
    const [saved, setSaved] = useState('');
    const isDriver = profile?.role === 'driver';
    const roleLabel = isDriver ? 'راننده' : profile?.role === 'carrier' ? 'باربری' : 'صاحب بار';

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('bbberah-theme', theme);
    }, [theme]);

    // به‌روزرسانی تابع saveVehicle برای ذخیره اطلاعات پلاک
    const saveVehicle = () => {
        localStorage.setItem(`bbberah-fleet-${profile?.id}`, JSON.stringify(vehicle));
        setSaved('مشخصات خودرو ذخیره شد.');
        setTimeout(() => setSaved(''), 2200);
    };

    const cards = [
        { key: 'user' as Section, icon: User, title: 'اطلاعات کاربری', text: 'نام، شماره تلفن و شهر' },
        ...(isDriver ? [{ key: 'vehicle' as Section, icon: CarFront, title: 'اطلاعات خودرو', text: 'نوع خودرو، بارگیر و کاربری' }] : []),
        { key: 'wallet' as Section, icon: WalletCards, title: 'کیف پول', text: 'موجودی و تراکنش‌ها' },
        { key: 'identity' as Section, icon: ShieldCheck, title: 'احراز هویت', text: 'وضعیت هویت و مدارک' },
        { key: 'road' as Section, icon: Truck, title: 'راهداری', text: 'اطلاعات و خدمات مرتبط با راهداری' },
        { key: 'settings' as Section, icon: Settings2, title: 'تنظیمات برنامه', text: 'حالت شب، روز یا خودکار' },
        { key: 'support' as Section, icon: Headphones, title: 'پشتیبانی', text: 'ارتباط با پشتیبانی براه' },
        { key: 'rules' as Section, icon: FileText, title: 'قوانین و مقررات', text: 'شرایط استفاده از براه' }
    ];

    if (section === 'home') return (
        <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
            <div className="max-w-lg mx-auto">
                <div className="flex items-center justify-between mb-5">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 font-bold">
                        <ArrowRight className="w-5 h-5" /> بازگشت
                    </button>
                    <button onClick={async () => { if (confirm('آیا از حساب کاربری خارج می‌شوید؟')) await signOut() }} className="flex items-center gap-2 text-red-500 font-bold">
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
                    {cards.map(({ key, icon: Icon, title, text }) =>
                        <button key={key} onClick={() => { setSection(key); if (key === 'vehicle') setVehicleStep('type') }} className="w-full text-right rounded-[24px] bg-white border border-orange-100 p-5 shadow-sm hover:shadow-md transition-all">
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
                    )}
                </div>
            </div>
        </div>
    );

    if (section === 'vehicle') {
        const stepNo = vehicleStep === 'type' ? 1 : vehicleStep === 'body' ? 2 : vehicleStep === 'feature' ? 3 : 4;
        const title = vehicleStep === 'type' ? 'انتخاب نوع کامیون' :
                      vehicleStep === 'body' ? 'انتخاب نوع بارگیر' :
                      vehicleStep === 'feature' ? 'ویژگی بارگیر' :
                      'اطلاعات پلاک ملی';

        const back = () => {
            if (vehicleStep === 'type') setSection('home');
            else if (vehicleStep === 'body') setVehicleStep('type');
            else if (vehicleStep === 'feature') setVehicleStep('body');
            else if (vehicleStep === 'plate') setVehicleStep('feature');
        };

        return (
            <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
                <div className="max-w-lg mx-auto">
                    <button onClick={back} className="flex items-center gap-2 text-gray-500 font-bold mb-7">
                        <ArrowRight className="w-5 h-5" /> بازگشت
                    </button>
                    <span className="text-xs font-bold text-primary-600">مرحله {stepNo} از 4</span>
                    <h1 className="text-2xl font-black mt-2">{title}</h1>
                    <p className="text-sm text-gray-400 mt-2 mb-6">فقط همین مرحله را تکمیل کنید و ادامه دهید.</p>

                    {vehicleStep === 'type' && (
                        <div className="grid gap-3">
                            {VEHICLES.map(x => (
                                <button key={x} onClick={() => { setVehicle({ ...vehicle, vehicleType: x }); setVehicleStep('body') }} className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500">
                                    {x}<span className="block text-xs text-gray-400 font-normal mt-1">انتخاب و ادامه</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {vehicleStep === 'body' && (
                        <div className="grid gap-3">
                            {BODIES.map(x => (
                                <button key={x} onClick={() => { setVehicle({ ...vehicle, bodyType: x, bodyFeature: '' }); setVehicleStep('feature') }} className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500">
                                    {x}<span className="block text-xs text-gray-400 font-normal mt-1">انتخاب و ادامه</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {vehicleStep === 'feature' && (
                        <div className="grid gap-3">
                            {BODY_FEATURES.map(x => (
                                <button key={x} onClick={() => setVehicle({ ...vehicle, bodyFeature: x })} className="w-full text-right rounded-[24px] bg-white border-2 border-gray-100 p-5 font-black text-lg hover:border-primary-500">
                                    {x}<span className="block text-xs text-gray-400 font-normal mt-1">انتخاب</span>
                                </button>
                            ))}
                            <button onClick={() => setVehicleStep('plate')} className="w-full mt-2 rounded-2xl bg-primary-600 text-white py-4 font-black">
                                ادامه (اطلاعات پلاک)
                            </button>
                            {saved && <p className="text-primary-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{saved}</p>}
                        </div>
                    )}

                    {vehicleStep === 'plate' && (
                        <div className="grid gap-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">شماره پلاک ملی</label>
                            <div className="flex justify-center items-center rounded-lg border border-gray-300 bg-white p-2 shadow-sm gap-1 overflow-hidden">
                                <input type="text" maxLength={2} inputMode="numeric" className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0" placeholder="۰۰" value={fa(vehicle.platePart1)} onChange={(e) => setVehicle({ ...vehicle, platePart1: en(e.target.value).slice(0, 2) })} />
                                <select className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0" value={vehicle.plateLetter} onChange={(e) => setVehicle({ ...vehicle, plateLetter: e.target.value.slice(0,1) })}>
                                    <option value="">-</option>
                                    {LETTERS.map(letter => <option key={letter} value={letter}>{letter}</option>)}
                                </select>
                                <input type="text" maxLength={3} inputMode="numeric" className="w-2/6 p-2 text-center border-0 text-xl font-black focus:ring-0" placeholder="۰۰۰" value={fa(vehicle.platePart3)} onChange={(e) => setVehicle({ ...vehicle, platePart3: en(e.target.value).slice(0, 3) })} />
                                <div className="w-1/6 h-full flex-shrink-0 bg-gray-100 rounded-md overflow-hidden" style={{ backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/255px-Flag_of_Iran.svg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                                    <span className="sr-only">پرچم ایران</span>
                                </div>
                                <input type="text" maxLength={2} inputMode="numeric" className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0" placeholder="۰۰" value={fa(vehicle.plateIranCode)} onChange={(e) => setVehicle({ ...vehicle, plateIranCode: en(e.target.value).slice(0, 2) })} />
                            </div>

                            <p className="mt-4 text-center text-lg font-black">
                                نمایش پلاک:
                                <br />
                                <span className="text-primary-600">
                                    {fa(vehicle.platePart1)} {vehicle.plateLetter} {fa(vehicle.platePart3)} ایران {fa(vehicle.plateIranCode)}
                                </span>
                            </p>

                            <button onClick={saveVehicle} className="w-full mt-5 rounded-2xl bg-primary-600 text-white py-4 font-black">
                                ثبت اطلاعات پلاک و خودرو
                            </button>
                            {saved && <p className="text-primary-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{saved}</p>}
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
                            {(([['system', 'خودکار', Settings2], ['light', 'روز', Sun], ['dark', 'شب', Moon]] as const)).map(([value, label, Icon]) =>
                                <button key={value} onClick={() => setTheme(value)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${theme === value ? 'border-primary-500 bg-orange-50' : 'border-gray-100'}`}>
                                    <Icon className="w-6 h-6 text-primary-600" />
                                    <span className="flex-1 text-right font-bold">{label}</span>
                                    {theme === value && <CheckCircle2 className="w-5 h-5 text-primary-600" />}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}