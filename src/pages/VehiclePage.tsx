import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Settings2 } from 'lucide-react';

type VehiclePageProps = {
  profile: {
    id?: string | number;
    full_name?: string;
    phone?: string;
    role?: string;
  } | null;
  onBack: () => void;
};

type VehicleStep = 'type' | 'body' | 'feature' | 'plate';

type VehicleData = {
  vehicleType: string;
  bodyType: string;
  bodyFeature: string;
  platePart1: string;
  plateLetter: string;
  platePart3: string;
  plateIranCode: string;
};

const VEHICLES = ['تریلی', 'جفت', 'تک', 'کامیونت و خاور', 'وانت و نیسان'];
const BODIES = ['روباز', 'مسقف', 'یخچال', 'کمپرسی'];
const BODY_FEATURES = ['بغل بازشو', 'معمولی', 'چادری', 'فلزی'];
const LETTERS = ['ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];

const fa = (value: string) =>
  value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] || digit);

export const en = (value: string) =>
  value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));

const emptyVehicle: VehicleData = {
  vehicleType: '',
  bodyType: '',
  bodyFeature: '',
  platePart1: '',
  plateLetter: '',
  platePart3: '',
  plateIranCode: '',
};

function loadVehicle(id?: string | number): VehicleData {
  try {
    const key = `bbberah-fleet-${id ?? 'default'}`;
    const stored = localStorage.getItem(key);
    if (!stored) return emptyVehicle;
    return { ...emptyVehicle, ...JSON.parse(stored) };
  } catch {
    return emptyVehicle;
  }
}

const VehiclePage = ({ profile, onBack }: VehiclePageProps) => {
  const [vehicleStep, setVehicleStep] = useState<VehicleStep>('type');
  const [vehicle, setVehicle] = useState<VehicleData>(() => loadVehicle(profile?.id));
  const [saved, setSaved] = useState('');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('bbberah-theme') as 'system' | 'light' | 'dark') || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('bbberah-theme', theme);
    } catch {}

    const applyTheme = () => {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        return;
      }
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        return;
      }
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    };

    applyTheme();

    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', event.matches);
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const saveVehicle = () => {
    try {
      const key = `bbberah-fleet-${profile?.id ?? 'default'}`;
      localStorage.setItem(key, JSON.stringify(vehicle));
      setSaved('مشخصات خودرو ذخیره شد.');
      window.setTimeout(() => setSaved(''), 2200);
    } catch {
      setSaved('ذخیره اطلاعات خودرو انجام نشد.');
      window.setTimeout(() => setSaved(''), 2200);
    }
  };

  const stepNo = vehicleStep === 'type' ? 1 : vehicleStep === 'body' ? 2 : vehicleStep === 'feature' ? 3 : 4;

  const title =
    vehicleStep === 'type' ? 'انتخاب نوع کامیون'
    : vehicleStep === 'body' ? 'انتخاب نوع بارگیر'
    : vehicleStep === 'feature' ? 'ویژگی بارگیر'
    : 'اطلاعات پلاک ملی';

  const goBack = () => {
    if (vehicleStep === 'type') { onBack(); return; }
    if (vehicleStep === 'body') { setVehicleStep('type'); return; }
    if (vehicleStep === 'feature') { setVehicleStep('body'); return; }
    setVehicleStep('feature');
  };

  const updateVehicle = (changes: Partial<VehicleData>) => {
    setVehicle((current) => ({ ...current, ...changes }));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-orange-50/50 px-4 py-5 pb-10">
      <div className="max-w-lg mx-auto">
        <button onClick={goBack} className="flex items-center gap-2 text-gray-500 font-bold mb-7">
          <ArrowRight className="w-5 h-5" /> بازگشت
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold text-primary-600">مرحله {stepNo} از 4</span>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className={`h-1.5 flex-1 rounded-full ${step <= stepNo ? 'bg-primary-600' : 'bg-gray-200'}`} />
            ))}
          </div>
          <h1 className="text-2xl font-black mt-4">{title}</h1>
          <p className="text-sm text-gray-400 mt-2">فقط همین مرحله را تکمیل کنید و ادامه دهید.</p>
        </div>

        {vehicleStep === 'type' && (
          <div className="grid gap-3">
            {VEHICLES.map((item) => (
              <button key={item} onClick={() => { updateVehicle({ vehicleType: item }); setVehicleStep('body'); }} className={`w-full text-right rounded-[24px] bg-white border-2 p-5 font-black text-lg transition-all ${vehicle.vehicleType === item ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-500'}`}>
                {item}
                <span className="block text-xs text-gray-400 font-normal mt-1">انتخاب و ادامه</span>
              </button>
            ))}
          </div>
        )}

        {vehicleStep === 'body' && (
          <div className="grid gap-3">
            {BODIES.map((item) => (
              <button key={item} onClick={() => { updateVehicle({ bodyType: item, bodyFeature: '' }); setVehicleStep('feature'); }} className={`w-full text-right rounded-[24px] bg-white border-2 p-5 font-black text-lg transition-all ${vehicle.bodyType === item ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-500'}`}>
                {item}
                <span className="block text-xs text-gray-400 font-normal mt-1">انتخاب و ادامه</span>
              </button>
            ))}
          </div>
        )}

        {vehicleStep === 'feature' && (
          <div className="grid gap-3">
            {BODY_FEATURES.map((item) => (
              <button key={item} onClick={() => { updateVehicle({ bodyFeature: item }); }} className={`w-full text-right rounded-[24px] bg-white border-2 p-5 font-black text-lg transition-all ${vehicle.bodyFeature === item ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-primary-500'}`}>
                {item}
                <span className="block text-xs text-gray-400 font-normal mt-1">انتخاب</span>
              </button>
            ))}

            <button onClick={() => { if (!vehicle.bodyFeature) return; setVehicleStep('plate'); }} disabled={!vehicle.bodyFeature} className={`w-full mt-2 rounded-2xl py-4 font-black transition-all ${vehicle.bodyFeature ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              ادامه (اطلاعات پلاک)
            </button>

            {saved && <p className="text-primary-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{saved}</p>}
          </div>
        )}

        {vehicleStep === 'plate' && (
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-gray-700">شماره پلاک ملی</label>

            <div className="flex justify-center items-center rounded-lg border border-gray-300 bg-white p-2 shadow-sm gap-1 overflow-hidden">
              <input type="text" maxLength={2} inputMode="numeric" dir="ltr" className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0 outline-none" placeholder="۰۰" value={fa(vehicle.platePart1)} onChange={(event) => updateVehicle({ platePart1: en(event.target.value).slice(0, 2) })} />

              <select dir="rtl" className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0 outline-none bg-transparent" value={vehicle.plateLetter} onChange={(event) => updateVehicle({ plateLetter: event.target.value.slice(0, 1) })}>
                <option value="">-</option>
                {LETTERS.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
              </select>

              <input type="text" maxLength={3} inputMode="numeric" dir="ltr" className="w-2/6 p-2 text-center border-0 text-xl font-black focus:ring-0 outline-none" placeholder="۰۰۰" value={fa(vehicle.platePart3)} onChange={(event) => updateVehicle({ platePart3: en(event.target.value).slice(0, 3) })} />

              <div className="w-1/6 h-12 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/255px-Flag_of_Iran.svg.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                <span className="sr-only">پرچم ایران</span>
              </div>

              <input type="text" maxLength={2} inputMode="numeric" dir="ltr" className="w-1/6 p-2 text-center border-0 text-xl font-black focus:ring-0 outline-none" placeholder="۰۰" value={fa(vehicle.plateIranCode)} onChange={(event) => updateVehicle({ plateIranCode: en(event.target.value).slice(0, 2) })} />
            </div>

            <div className="mt-2 rounded-[24px] bg-white border border-orange-100 p-5 text-center">
              <p className="text-sm text-gray-400 mb-2">نمایش پلاک:</p>
              <p className="text-xl font-black">
                <span className="text-primary-600">{fa(vehicle.platePart1)}</span>{' '}
                <span className="text-gray-900">{vehicle.plateLetter || '-'}</span>{' '}
                <span className="text-primary-600">{fa(vehicle.platePart3)}</span>{' '}
                <span className="text-gray-500">ایران</span>{' '}
                <span className="text-primary-600">{fa(vehicle.plateIranCode)}</span>
              </p>
            </div>

            <div className="rounded-[24px] bg-white border border-orange-100 p-5 space-y-3">
              <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">نوع خودرو</span><b>{vehicle.vehicleType || 'ثبت نشده'}</b></div>
              <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">نوع بارگیر</span><b>{vehicle.bodyType || 'ثبت نشده'}</b></div>
              <div className="flex items-center justify-between"><span className="text-gray-400 text-sm">ویژگی بارگیر</span><b>{vehicle.bodyFeature || 'ثبت نشده'}</b></div>
            </div>

            <button onClick={saveVehicle} disabled={!vehicle.platePart1 || !vehicle.plateLetter || !vehicle.platePart3 || !vehicle.plateIranCode} className={`w-full mt-2 rounded-2xl py-4 font-black transition-all ${vehicle.platePart1 && vehicle.plateLetter && vehicle.platePart3 && vehicle.plateIranCode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              ثبت اطلاعات پلاک و خودرو
            </button>

            {saved && <p className="text-primary-700 font-bold flex items-center gap-2"><CheckCircle2 className="w-5 h-5" />{saved}</p>}

            <div className="hidden">
              <Settings2 />
              <span>{theme}</span>
              <button onClick={() => setTheme('system')} type="button">خودکار</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehiclePage;
