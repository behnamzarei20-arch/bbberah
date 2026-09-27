import { createElement, useMemo, useState } from 'react';
import {
  ArrowLeft, Bell, CarFront, CheckCircle2, ChevronLeft, Clock3, Weight as WeightIcon, Percent,
  FileText, Headphones, Home, LogOut, MapPin, Menu, Navigation, Package,
  Phone, PhoneCall, ReceiptText, Search, Settings, ShieldCheck,
  Truck, User, WalletCards, X, RefreshCw, Plus, Star, Route, CircleDollarSign, Coins
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { iranLocations } from '@/data/iranLocations';

type Page =
  | 'home' | 'search' | 'nearby' | 'calls' | 'profile' | 'account' | 'vehicle'
  | 'wallet' | 'transactions' | 'support' | 'rules' | 'notifications' | 'display'
  | 'cargo-detail' | 'offers' | 'shipment' | 'origin-select' | 'destination-select' | 'destination-all';

type LoadStatus = 'open' | 'reserved' | 'delivered';
type Load = {
  id: string; title: string; from: string; to: string; type: string; vehicle: string;
  weight: number; price: number; pickup: string; delivery: string; status: LoadStatus;
  distance: number; description: string; phone: string;
};

const seedLoads: Load[] = [
  { id:'l1', title:'بار خشک تهران به مشهد', from:'تهران', to:'مشهد', type:'بار خشک', vehicle:'تریلی', weight:18000, price:24500000, pickup:'امروز، ۱۴:۳۰', delivery:'فردا، ۱۰:۰۰', status:'open', distance:18, description:'بار خشک بسته‌بندی‌شده؛ بارگیری در محل اعلام‌شده و تحویل طبق زمان‌بندی.', phone:'09120000001' },
  { id:'l2', title:'مواد غذایی کرج به اصفهان', from:'کرج', to:'اصفهان', type:'مواد غذایی', vehicle:'کامیون', weight:9000, price:12800000, pickup:'فردا، ۰۸:۰۰', delivery:'فردا، ۲۰:۰۰', status:'open', distance:42, description:'مواد غذایی بسته‌بندی‌شده؛ نیازمند حمل مناسب و تحویل در بازه تعیین‌شده.', phone:'09120000002' },
  { id:'l3', title:'کالای تجاری تبریز به تهران', from:'تبریز', to:'تهران', type:'کالای تجاری', vehicle:'خاور', weight:4500, price:8600000, pickup:'فردا، ۱۱:۳۰', delivery:'پس‌فردا، ۰۹:۰۰', status:'open', distance:76, description:'کالای تجاری بسته‌بندی‌شده؛ جزئیات محموله هنگام هماهنگی حمل اعلام می‌شود.', phone:'09120000003' },
  { id:'l4', title:'مصالح ساختمانی قم به تهران', from:'قم', to:'تهران', type:'ساختمانی', vehicle:'تریلی', weight:22000, price:16400000, pickup:'شنبه، ۰۷:۰۰', delivery:'شنبه، ۱۳:۰۰', status:'reserved', distance:96, description:'مصالح ساختمانی بسته‌بندی‌شده؛ هماهنگی بارگیری و تحویل طبق برنامه حمل.', phone:'09120000004' },
  { id:'l5', title:'بار کشاورزی رشت به قزوین', from:'رشت', to:'قزوین', type:'کشاورزی', vehicle:'کامیون', weight:7500, price:9700000, pickup:'شنبه، ۰۹:۰۰', delivery:'شنبه، ۱۶:۰۰', status:'open', distance:118, description:'بار کشاورزی بسته‌بندی‌شده؛ شرایط حمل و زمان تحویل هنگام هماهنگی اعلام می‌شود.', phone:'09120000005' },
];
const frequentRoutes = [
  { from:'تهران', to:'مشهد' },
  { from:'کرج', to:'اصفهان' },
  { from:'تبریز', to:'تهران' },
];


const money = (v:number) => new Intl.NumberFormat('fa-IR').format(v);
const fa = (v:string|number) => String(v).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

function Status({ status }: { status: LoadStatus }) {
  const map = {
    open: ['آماده بارگیری', 'bg-emerald-50 text-emerald-700'],
    reserved: ['رزرو شده', 'bg-amber-50 text-amber-700'],
    delivered: ['تحویل شده', 'bg-slate-100 text-slate-600'],
  } as const;
  const [label, cls] = map[status];
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>{label}</span>;
}

function Toast({ message, onClose }: { message:string; onClose:()=>void }) {
  if (!message) return null;
  return <div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-lg rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    <span className="flex-1">{message}</span>
    <button onClick={onClose} aria-label="بستن"><X className="w-4 h-4" /></button>
  </div>;
}

function LoadCard({ load, onOpen, onOffer }: { load:Load; onOpen:()=>void; onOffer:()=>void }) {
  return <Card hoverable>
    <CardBody className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="flex items-center gap-2"><Status status={load.status}/><span className="text-[11px] text-gray-400">{fa(load.distance)} کیلومتر</span></div><h3 className="font-black mt-2 leading-6">{load.title}</h3></div>
        <div className="text-left shrink-0"><b className="text-primary-700">{money(load.price)}</b><span className="block text-[10px] text-gray-400">تومان</span></div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="flex-1"><b>{load.from}</b><span className="block text-[11px] text-gray-400 mt-1">مبدأ</span></div>
        <Route className="w-5 h-5 text-primary-500 rotate-180" />
        <div className="flex-1 text-left"><b>{load.to}</b><span className="block text-[11px] text-gray-400 mt-1">مقصد</span></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
        <div className="rounded-xl bg-gray-50 p-2"><span className="text-gray-400">وسیله</span><b className="block mt-1">{load.vehicle}</b></div>
        <div className="rounded-xl bg-gray-50 p-2"><span className="text-gray-400">وزن</span><b className="block mt-1">{fa(load.weight)} kg</b></div>
        <div className="rounded-xl bg-gray-50 p-2"><span className="text-gray-400">بارگیری</span><b className="block mt-1">{load.pickup.split('،')[0]}</b></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button size="sm" variant="outline" onClick={onOpen}>جزئیات بار</Button>
        <Button size="sm" disabled={load.status !== 'open'} onClick={onOffer}>{load.status === 'open' ? 'ثبت پیشنهاد' : 'رزرو شده'}</Button>
      </div>
    </CardBody>
  </Card>;
}

function Empty({ title, text, action }: {title:string;text:string;action?:()=>void}) {
  return <div className="py-14 text-center"><Package className="w-10 h-10 mx-auto text-gray-300"/><h3 className="font-black mt-3">{title}</h3><p className="text-sm text-gray-400 mt-2">{text}</p>{action && <Button size="sm" variant="outline" className="mt-5" onClick={action}>تلاش دوباره</Button>}</div>;
}

export function MainApp() {
  const { profile, signOut } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [loads, setLoads] = useState(seedLoads);
  const [selected, setSelected] = useState<Load|null>(null);
  const [origin, setOrigin] = useState('');
  const [originText, setOriginText] = useState('');
  const [originProvince, setOriginProvince] = useState('');
  const [originCounty, setOriginCounty] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [destinationCounty, setDestinationCounty] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showMenu, setShowMenu] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [shipmentStage, setShipmentStage] = useState<'accepted'|'loading'|'in_transit'|'delivered'>('accepted');
  const [rating, setRating] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | 'cancel-offer'>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({type:'تریلی',plate:'',model:'',year:''});
  const [accountName, setAccountName] = useState(profile?.full_name || '');

  const notify = (m:string) => { setToast(m); window.setTimeout(()=>setToast(''), 2600); };
  const go = (p:Page) => { setPage(p); setShowMenu(false); window.scrollTo({top:0,behavior:'smooth'}); };
  const findCityLocation = (city:string) => {
    for (const province of iranLocations) for (const county of province.counties) if (county.cities.includes(city)) return { provinceId:String(province.id), countyId:String(county.id) };
    return null;
  };
  const filtered = useMemo(() => loads.filter(l => {
    if (l.status === 'delivered') return false;
    const ol = findCityLocation(l.from), dl = findCityLocation(l.to);
    const originMatch = !origin && !originProvince ? true : origin === '__nearby__' ? l.distance <= 50 : !!ol && (!originProvince || ol.provinceId === originProvince) && (!originCounty || ol.countyId === originCounty) && (!origin || l.from === origin);
    const destinationMatch = !destination && !destinationProvince ? true : !!dl && (!destinationProvince || dl.provinceId === destinationProvince) && (!destinationCounty || dl.countyId === destinationCounty) && (!destination || l.to === destination);
    return originMatch && destinationMatch;
  }), [loads, origin, originProvince, originCounty, destination, destinationProvince, destinationCounty]);
  const title:Record<Page,string> = {
    home:'براه', search:'جستجوی بار', nearby:'اطراف من', calls:'تماس‌های من', profile:'حساب کاربری',
    account:'اطلاعات حساب', vehicle:'خودروی من', wallet:'کیف پول', transactions:'تراکنش‌ها',
    support:'پشتیبانی', rules:'قوانین و مقررات', notifications:'اعلان‌ها', display:'تنظیمات ظاهری', 'cargo-detail':'جزئیات بار',
offers:'پیشنهادهای من', shipment:'سفر جاری', 'origin-select':'انتخاب مبدأ', 'destination-select':'انتخاب مقصد', 'destination-all':'انتخاب شهر مقصد'
  };

  const requestOffer = (load:Load) => { setSelected(load); setOfferPrice(String(load.price)); setOfferOpen(true); };
  const submitOffer = () => {
    if (actionBusy) return;
    const n = Number(offerPrice.replace(/,/g,''));
    if (!termsAccepted) return notify('ابتدا قوانین و مقررات براه را مطالعه و تأیید کنید.');
    if (!n || n < 1000000) return notify('مبلغ پیشنهاد را به‌صورت معتبر وارد کنید.');
    setActionBusy(true);
    setTimeout(()=>setActionBusy(false),500);
    setOfferOpen(false); setOfferSuccess(true); go('offers'); notify('پیشنهاد شما با موفقیت ارسال شد.');
  };
  const Header = () => <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
    <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
      <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center" onClick={()=>setShowMenu(true)} aria-label="منو"><Menu className="w-5 h-5"/></button>
      <button onClick={()=>go('home')} className="font-black text-2xl tracking-tight text-primary-700">براه</button>
      <button onClick={()=>{setNotifications(0);go('notifications')}} className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center" aria-label="اعلان‌ها"><Bell className="w-5 h-5"/>{notifications>0&&<span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">{fa(notifications)}</span>}</button>
    </div>
  </header>;

  const BottomNav = () => <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur">
    <div className="max-w-lg mx-auto grid grid-cols-4 h-[72px]">
      {[
        ['home','خانه',Home],['search','جستجو',Search],['calls','تماس‌ها',PhoneCall],['profile','حساب',User]
      ].map(([p,l,I])=><button key={p as string} onClick={()=>go(p as Page)} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${page===p?'text-primary-700 font-black':'text-gray-400'}`}>{createElement(I as any,{className:"w-5 h-5"})}{String(l)}</button>)}
    </div>
  </nav>;

  const Drawer = () => showMenu ? <div className="fixed inset-0 z-50 bg-black/30" onClick={()=>setShowMenu(false)}>
    <aside className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6"><div><b className="text-xl">{profile?.full_name || 'کاربر براه'}</b><span className="block text-xs text-gray-400 mt-1">{profile?.phone}</span></div><button onClick={()=>setShowMenu(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div>
      <div className="space-y-1">
        {[
          ['profile','حساب کاربری',User],['vehicle','خودروی من',CarFront],['wallet','کیف پول',WalletCards],['offers','پیشنهادهای من',ReceiptText],['shipment','سفر جاری',Truck],['support','پشتیبانی',Headphones],['rules','قوانین و مقررات',FileText],['display','تنظیمات ظاهری',Settings]
        ].map(([p,l,I])=><button key={p as string} onClick={()=>go(p as Page)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50">{createElement(I as any,{className:"w-5 h-5 text-primary-600"})}<span className="flex-1 font-bold text-sm">{String(l)}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}
        <button onClick={()=>signOut()} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right text-red-600 mt-3"><LogOut className="w-5 h-5"/><span className="font-bold text-sm">خروج از حساب</span></button>
      </div>
    </aside>
  </div> : null;

  const HomePage = () => <div className="space-y-4">
    <button onClick={()=>go('search')} className="w-full min-h-[112px] rounded-2xl bg-blue-500 border border-blue-600 p-5 text-right flex items-center gap-4 shadow-sm text-white">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0"><Search className="w-6 h-6 text-blue-600"/></div>
      <div className="min-w-0"><b className="block text-lg text-white">جستجوی بار</b><span className="block mt-1 text-sm text-white/90">مبدأ، مقصد یا نوع بار را جستجو کن</span></div>
    </button>
    <button onClick={()=>go('nearby')} className="w-full min-h-[112px] rounded-2xl bg-blue-500 border border-blue-600 p-5 text-right flex items-center gap-4 shadow-sm text-white">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0"><Navigation className="w-6 h-6 text-emerald-700"/></div>
      <div className="min-w-0"><b className="block text-lg text-white">اطراف من</b><span className="block mt-1 text-sm text-white/90">بارهای نزدیک را ببین</span></div>
    </button>
    <button onClick={()=>go('offers')} className="w-full min-h-[112px] rounded-2xl bg-blue-500 border border-blue-600 p-5 text-right flex items-center gap-4 shadow-sm text-white">
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0"><ReceiptText className="w-6 h-6 text-amber-700"/></div>
      <div className="min-w-0"><b className="block text-lg text-white">پیشنهادهای من</b><span className="block mt-1 text-sm text-white/90">پیشنهادهای ارسال‌شده را پیگیری کن</span></div>
    </button>
  </div>;

  const SearchPage = () => {
    const runSearch = () => {
      if (!originText || originText === 'اطراف من' || !destinationText) return notify('لطفاً مبدأ و مقصد را انتخاب کنید.');
      if (!origin) setOrigin(originText);
      if (!destination) setDestination(destinationText);
      setSearchSubmitted(true);
      notify('بارهای مطابق مسیر نمایش داده شد.');
    };
    const clearAll = () => {
      setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
      setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
      setSearchSubmitted(false);
    };

    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4"><div className="flex items-center gap-2"><Search className="w-5 h-5 text-primary-700"/><h2 className="font-black text-primary-900">جستجوی بار</h2></div></div>

        <button onClick={()=>go('origin-select')} className="w-full mt-5 rounded-2xl border border-gray-200 bg-white p-4 text-right active:bg-gray-50">
          <span className="block text-xs font-bold text-gray-400 mb-1">مبدأ</span>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary-600 shrink-0"/><span className={originText ? 'text-gray-900 font-bold' : 'text-gray-400'}>{originText || 'استان یا شهر مبدا را وارد کنید'}</span><ChevronLeft className="w-4 h-4 text-gray-300 mr-auto"/></div>
        </button>

        <div className="border-t border-gray-100 my-4"/>

        <button onClick={()=>go('destination-select')} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-right active:bg-gray-50">
          <span className="block text-xs font-bold text-gray-400 mb-1">مقصد</span>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary-600 shrink-0"/><span className={destinationText ? 'text-gray-900 font-bold' : 'text-gray-400'}>{destinationText || 'استان یا شهر مقصد را وارد کنید'}</span><ChevronLeft className="w-4 h-4 text-gray-300 mr-auto"/></div>
        </button>
      </CardBody></Card>

      <Button size="full" className="h-14 text-base font-black shadow-lg shadow-primary-100" onClick={runSearch}><Search className="w-5 h-5 ml-2"/> جستجوی بار</Button>

      <Card><CardBody className="p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-black">سه مسیر پرتکرار</h3><span className="text-[11px] text-gray-400">انتخاب سریع</span></div>
        <div className="space-y-2">{frequentRoutes.map(route=><button key={route.from+'-'+route.to} onClick={()=>{setOrigin(route.from);setOriginText(route.from);setDestination(route.to);setDestinationText(route.to);setSearchSubmitted(true);go('search');}} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between text-right"><span className="font-bold text-sm">{route.from} <span className="text-gray-400 mx-1">←</span> {route.to}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}</div>
      </CardBody></Card>

      {searchSubmitted && <>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{filtered.length ? `بارهای مرتبط: ${fa(filtered.length)} مورد` : 'بار مرتبط پیدا نشد'}</span>
          {(origin || destination) && <button onClick={clearAll} className="text-xs font-bold text-primary-700">پاک کردن</button>}
        </div>
        {filtered.length ? <div className="space-y-3">{filtered.map(l=><LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>)}</div> : <Card><CardBody><Empty title="بار مرتبط پیدا نشد" text="برای این مسیر هنوز باری ثبت نشده است." action={clearAll}/></CardBody></Card>}
      </>}
    </div>;
  };

  const LocationSelectPage = ({ mode, allCities = false }: { mode:'origin'|'destination'; allCities?: boolean }) => {
    const isOrigin = mode === 'origin';
    const provinceId = isOrigin ? originProvince : destinationProvince;
    const setProvince = isOrigin ? setOriginProvince : setDestinationProvince;
    const setCounty = isOrigin ? setOriginCounty : setDestinationCounty;
    const setCity = isOrigin ? setOrigin : setDestination;
    const setText = isOrigin ? setOriginText : setDestinationText;
    const provinceData = iranLocations.find(p => String(p.id) === provinceId);
    const [query, setQuery] = useState('');
    const normalized = query.trim().toLocaleLowerCase('fa-IR');
    const allCitiesMode = !isOrigin && (allCities || provinceId === '__all_cities__');
    const visibleProvinces = iranLocations.filter(p => !normalized || p.name.toLocaleLowerCase('fa-IR').includes(normalized));
    const allDestinationCities = iranLocations.flatMap(p => p.counties.flatMap(c => c.cities.map(city => ({ city, countyId:String(c.id) }))));
    const provinceCities = provinceData ? provinceData.counties.flatMap(c => c.cities.map(city => ({ city, countyId:String(c.id) }))) : [];
    const sourceCities = allCitiesMode ? allDestinationCities : provinceCities;
    const filteredCities = sourceCities.filter(x => !normalized || x.city.toLocaleLowerCase('fa-IR').includes(normalized));
    const [cityLimit, setCityLimit] = useState(120);
    const visibleCities = allCitiesMode && !normalized ? filteredCities.slice(0, cityLimit) : filteredCities;

    const openAllDestinationCities = () => {
      setDestinationProvince(''); setDestinationCounty(''); setDestination(''); setDestinationText('');
      setQuery(''); setCityLimit(120); go('destination-all');
    };
    const chooseProvince = (id:string) => {
      setProvince(id); setCounty(''); setCity(''); setText(''); setQuery(''); setCityLimit(120);
      if (!isOrigin && provinceId === '__all_cities__') setDestinationProvince('');
    };
    const chooseCity = (city:string, countyId:string) => {
      setCounty(countyId); setCity(city); setText(city); setQuery(''); setCityLimit(120); setSearchSubmitted(false);
      if (!isOrigin) setDestinationProvince('');
      go('search');
    };
    const chooseNearby = () => {
      if (!isOrigin) return;
      setProvince(''); setCounty(''); setCity('__nearby__'); setText('اطراف من'); go('search');
    };

    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={()=>go('search')} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5"/></button>
          <div><h2 className="font-black text-lg">{isOrigin ? 'انتخاب مبدأ' : 'انتخاب مقصد'}</h2><p className="text-xs text-gray-400 mt-1">{isOrigin ? 'استان یا شهر مبدأ را انتخاب کنید' : 'استان یا شهر مقصد را انتخاب کنید'}</p></div>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={isOrigin ? 'مثال تهران' : 'استان مقصد را انتخاب کنید'} className="w-full rounded-2xl border border-gray-200 bg-white pr-11 pl-4 py-4 outline-none focus:border-primary-400"/>
        </div>
        {isOrigin && <button type="button" onClick={chooseNearby} className="w-full mt-3 rounded-2xl bg-primary-50 border border-primary-100 p-3.5 flex items-center gap-3 text-right"><Navigation className="w-5 h-5 text-primary-600"/><span className="font-bold text-primary-800">اطراف من</span></button>}
        {!isOrigin && <button type="button" onClick={openAllDestinationCities} className={`w-full mt-3 rounded-2xl ${allCitiesMode ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-900'} border border-primary-200 p-4 flex items-center justify-between text-right active:scale-[0.99]`}>
          <span><b className="block">همه شهرها</b><span className={`text-[11px] ${allCitiesMode ? 'text-white/80' : 'text-primary-700'}`}>نمایش و انتخاب از تمام شهرهای ایران</span></span>
          <ChevronLeft className="w-5 h-5"/>
        </button>}
        {!provinceData && !allCitiesMode && <div className="mt-5">
          <div className="flex items-center justify-between mb-2"><b className="text-sm">{isOrigin ? 'لیست استان‌ها' : 'استان‌ها'}</b><span className="text-[11px] text-gray-400">{fa(visibleProvinces.length)} استان</span></div>
          <div className="space-y-2 max-h-[52vh] overflow-auto">{visibleProvinces.map(p=><button type="button" key={p.id} onClick={()=>chooseProvince(String(p.id))} className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"><span className="font-bold">{p.name}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}</div>
        </div>}
        {(provinceData || allCitiesMode) && <div className="mt-5">
          <div className="flex items-center justify-between mb-2"><div><b className="text-sm">{allCitiesMode ? 'همه شهرها' : provinceData?.name}</b><span className="block text-[11px] text-gray-400 mt-1">{allCitiesMode ? 'تمام شهرهای ایران' : 'شهرهای استان'}</span></div><button type="button" onClick={()=>{setProvince('');setCounty('');setCity('');setText('');setQuery(''); if (!isOrigin && allCitiesMode) go('destination-select');}} className="text-xs font-bold text-primary-700">تغییر استان</button></div>
          <div className="space-y-2 max-h-[52vh] overflow-auto">{visibleCities.length ? visibleCities.map(x=><button type="button" key={x.countyId + '-' + x.city} onClick={()=>chooseCity(x.city,x.countyId)} className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"><span className="font-bold">{x.city}</span><span className="text-[11px] text-gray-400">انتخاب</span></button>) : <Empty title="شهری پیدا نشد" text="نام شهر را تغییر دهید."/>}</div>
          {allCitiesMode && !normalized && allDestinationCities.length > visibleCities.length && <button type="button" onClick={()=>setCityLimit(v=>Math.min(v+120, allDestinationCities.length))} className="w-full mt-3 rounded-xl border border-primary-200 bg-primary-50 text-primary-700 py-3 text-sm font-black">نمایش شهرهای بیشتر ({fa(Math.min(120, allDestinationCities.length-visibleCities.length))})</button>}
        </div>}
      </CardBody></Card>
    </div>;
  };
const ProfilePage = () => <div className="space-y-3">
    <Card><CardBody className="p-5 flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center"><User className="w-7 h-7 text-primary-700"/></div><div><b className="text-lg">{profile?.full_name || 'کاربر براه'}</b><p className="text-xs text-gray-400 mt-1" dir="ltr">{profile?.phone}</p></div></CardBody></Card>
    {[
      ['account','اطلاعات حساب','نام، شهر و شماره تماس',User],['vehicle','خودروی من','مشخصات خودرو و پلاک',CarFront],['wallet','کیف پول','موجودی و عملیات مالی',WalletCards],['transactions','تراکنش‌ها','سوابق مالی',ReceiptText],['offers','پیشنهادهای من','پیشنهادهای ارسال‌شده',ReceiptText],['shipment','سفر جاری','وضعیت بار فعال',Truck],['support','پشتیبانی','راهنما و ارتباط',Headphones]
    ].map(([p,l,s,I])=><button key={p as string} onClick={()=>go(p as Page)} className="w-full rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 text-right">{createElement(I as any,{className:"w-5 h-5 text-primary-600"})}<span className="flex-1"><b className="block text-sm">{String(l)}</b><small className="text-gray-400">{String(s)}</small></span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}
  </div>;

  const DetailPage = () => selected ? <div className="space-y-4">
    <Card><CardBody className="p-5"><div className="flex items-center justify-between"><Status status={selected.status}/><span className="text-xs text-gray-400">{fa(selected.distance)} کیلومتر تا مبدأ</span></div><h2 className="text-xl font-black mt-3">{selected.title}</h2><div className="flex items-center gap-4 mt-5"><div className="flex-1"><b className="text-lg">{selected.from}</b><span className="block text-xs text-gray-400 mt-1">مبدأ</span></div><Route className="w-6 h-6 text-primary-500 rotate-180"/><div className="flex-1 text-left"><b className="text-lg">{selected.to}</b><span className="block text-xs text-gray-400 mt-1">مقصد</span></div></div></CardBody></Card>
    <Card><CardBody className="p-5 space-y-4"><h3 className="font-black">جزئیات بار</h3><div className="grid grid-cols-2 gap-3 text-sm">
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Package className="w-5 h-5 text-primary-600"/></div><span className="block text-gray-400 mt-2">نوع بار</span><b className="block mt-1">{selected.type}</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Percent className="w-5 h-5 text-primary-600"/></div><span className="block text-gray-400 mt-2">کمیسیون براه</span><b className="block mt-1">طبق تعرفه براه</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><WeightIcon className="w-5 h-5 text-amber-600"/></div><span className="block text-gray-400 mt-2">وزن بار</span><b className="block mt-1">{fa(selected.weight)} کیلو</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CircleDollarSign className="w-5 h-5 text-emerald-600"/></div><span className="block text-gray-400 mt-2">کرایه اعلامی</span><b className="block mt-1">{money(selected.price)} تومان</b></div>
    </div><div className="flex items-center gap-3 text-sm"><Clock3 className="w-5 h-5 text-primary-600"/><span>بارگیری: <b>{selected.pickup}</b></span></div><div className="flex items-center gap-3 text-sm"><MapPin className="w-5 h-5 text-primary-600"/><span>تحویل: <b>{selected.delivery}</b></span></div></CardBody></Card>
    <Card><CardBody className="p-5"><h3 className="font-black">توضیحات</h3><p className="text-sm text-gray-600 mt-2 leading-7">{selected.description}</p><a href={`tel:${selected.phone}`} className="mt-4 w-full rounded-xl bg-gray-50 py-3 flex items-center justify-center gap-2 font-bold text-sm"><Phone className="w-4 h-4"/> تماس برای هماهنگی</a></CardBody></Card>
    <Button size="full" disabled={selected.status!=='open'} onClick={()=>requestOffer(selected)}>{selected.status==='open'?'ثبت پیشنهاد برای این بار':'این بار قابل پیشنهاد نیست'}</Button>
  </div> : <Empty title="بار انتخاب نشده" text="از جستجو یک بار را انتخاب کنید." action={()=>go('search')}/>;

  const SimplePage = () => {
    if (page==='nearby') return <div className="space-y-4"><Card><CardBody className="p-5"><div className="flex gap-3"><MapPin className="w-6 h-6 text-primary-600"/><div><b>بارهای اطراف</b><p className="text-xs text-gray-400 mt-1">برای فاز اول، فاصله‌ها شبیه‌سازی شده‌اند.</p></div></div><Button className="w-full mt-4" onClick={()=>notify('موقعیت مکانی آزمایشی به‌روزرسانی شد.')}>به‌روزرسانی موقعیت</Button></CardBody></Card>{loads.filter(l=>l.status==='open').sort((a,b)=>a.distance-b.distance).slice(0,4).map(l=><LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>)}</div>;
    if (page==='calls') return <div className="space-y-3">{loads.slice(0,2).map(l=><Card key={l.id}><CardBody className="p-4 flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center"><PhoneCall className="w-5 h-5 text-primary-600"/></div><div className="flex-1"><b>هماهنگی بار</b><p className="text-xs text-gray-400 mt-1">{l.title}</p></div><a href={`tel:${l.phone}`} className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center"><Phone className="w-5 h-5"/></a></CardBody></Card>)}<Empty title="سوابق تماس" text="تماس‌های واقعی بعد از اتصال به سرویس ثبت خواهند شد."/></div>;
    if (page==='notifications') return <div className="space-y-3">{['بار جدید در مسیر تهران به مشهد ثبت شد.','پیشنهاد آزمایشی شما در انتظار بررسی است.','اطلاعات حساب شما با موفقیت ذخیره شد.'].map((n,i)=><Card key={i}><CardBody className="p-4 flex gap-3"><Bell className="w-5 h-5 text-primary-600"/><div><b className="text-sm">{n}</b><p className="text-[11px] text-gray-400 mt-1">{i===0?'امروز':'دیروز'}</p></div></CardBody></Card>)}</div>;
    if (page==='offers') return <div className="space-y-3">{offerSuccess && <Card><CardBody className="p-4 bg-emerald-50"><div className="flex items-center gap-3 text-emerald-700"><CheckCircle2 className="w-6 h-6 shrink-0"/><div><b>پیشنهاد با موفقیت ارسال شد</b><p className="text-xs mt-1">پیشنهاد شما در فهرست پیشنهادهای من ثبت شد.</p></div></div></CardBody></Card>}<Card><CardBody className="p-5"><div className="flex justify-between"><span className="text-gray-400 text-sm">پیشنهادهای فعال</span><b>۲</b><Button variant="outline" className="w-full mt-3" onClick={()=>setConfirmAction('cancel-offer')}>لغو پیشنهاد انتخاب‌شده</Button></div><div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden"><div className="h-full w-2/3 bg-primary-500 rounded-full"/></div></CardBody></Card><Card><CardBody className="p-5"><b>تهران ← مشهد</b><p className="text-xs text-gray-400 mt-1">پیشنهاد شما: ۲۳,۵۰۰,۰۰۰ تومان</p><div className="mt-4 flex items-center gap-2 text-xs text-amber-700"><Clock3 className="w-4 h-4"/> در انتظار پاسخ صاحب بار</div></CardBody></Card></div>;
    if (page==='shipment') return <div className="space-y-4"><Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><b>سفر تهران به مشهد</b><p className="text-xs text-gray-400 mt-1">بار خشک • تریلی</p></div></div><div className="mt-5 space-y-4">{['پیشنهاد تأیید شد','بارگیری انجام شد','در مسیر مقصد'].map((s,i)=><div key={s} className="flex gap-3"><div className={`w-7 h-7 rounded-full flex items-center justify-center ${i<2?'bg-emerald-100 text-emerald-700':'bg-primary-100 text-primary-700'}`}>{i<2?<CheckCircle2 className="w-4 h-4"/>:<Navigation className="w-4 h-4"/>}</div><div><b className="text-sm">{s}</b><p className="text-xs text-gray-400 mt-1">{i<2?'تکمیل شده':'وضعیت فعلی'}</p></div></div>)}</div><div className="mt-5 rounded-2xl bg-gray-50 p-4 text-xs text-gray-600 leading-6">راننده باید اطلاعات بار، مدارک حمل و شرایط تحویل را پیش از حرکت بررسی کند و وضعیت‌های سفر را مطابق واقع ثبت نماید.</div></CardBody></Card></div>;
    if (page==='wallet') return <div className="space-y-4"><Card><CardBody className="p-6 text-center"><CircleDollarSign className="w-8 h-8 mx-auto text-primary-600"/><p className="text-sm text-gray-400 mt-3">موجودی آزمایشی</p><b className="text-3xl block mt-2">۰ تومان</b><Button className="w-full mt-5" onClick={()=>notify('درگاه پرداخت در فاز دوم متصل می‌شود.')}>افزایش موجودی</Button></CardBody></Card></div>;
    if (page==='transactions') return <Card><CardBody><Empty title="تراکنشی وجود ندارد" text="سوابق مالی پس از اتصال کیف پول نمایش داده می‌شوند." action={()=>notify('داده آزمایشی جدیدی وجود ندارد.')}/></CardBody></Card>;
    if (page==='vehicle') return <Card><CardBody className="p-5 space-y-4"><div className="flex items-center gap-3"><CarFront className="w-7 h-7 text-primary-600"/><div><b>خودروی من</b><p className="text-xs text-gray-400 mt-1">اطلاعات خودرو در حالت آزمایشی نگهداری می‌شود.</p></div></div><select value={vehicleForm.type} onChange={e=>setVehicleForm(v=>({...v,type:e.target.value}))} className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"><option>تریلی</option><option>کامیون</option><option>خاور</option><option>نیسان</option></select><input value={vehicleForm.plate} onChange={e=>setVehicleForm(v=>({...v,plate:e.target.value}))} placeholder="پلاک خودرو" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><input value={vehicleForm.model} onChange={e=>setVehicleForm(v=>({...v,model:e.target.value}))} placeholder="مدل خودرو" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><input inputMode="numeric" value={vehicleForm.year} onChange={e=>setVehicleForm(v=>({...v,year:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="سال ساخت" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><Button className="w-full" onClick={()=>{if(!vehicleForm.plate.trim()||!vehicleForm.model.trim())return notify('پلاک و مدل خودرو را کامل کنید.');notify('خودرو در حالت آزمایشی ذخیره شد.')}}>ذخیره خودرو</Button></CardBody></Card>;
    if (page==='account') return <Card><CardBody className="p-5 space-y-4"><label className="text-sm font-bold">نام و نام خانوادگی</label><input value={accountName} onChange={e=>setAccountName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3"/><label className="text-sm font-bold">شماره موبایل</label><input value={profile?.phone||''} disabled dir="ltr" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50"/><Button className="w-full" onClick={()=>notify('تغییرات به‌صورت آزمایشی ذخیره شد.')}>ذخیره تغییرات</Button></CardBody></Card>;
    if (page==='support') return <div className="space-y-3"><Card><CardBody className="p-5"><Headphones className="w-7 h-7 text-primary-600"/><h3 className="font-black mt-3">مرکز پشتیبانی</h3><p className="text-sm text-gray-500 leading-7 mt-2">برای مشکلات حساب، بار یا سفر، موضوع خود را از مسیرهای زیر پیگیری کنید.</p><div className="grid grid-cols-2 gap-2 mt-4"><Button size="sm" variant="outline" onClick={()=>notify('چت پشتیبانی در نسخه نهایی فعال می‌شود.')}>گفتگوی آنلاین</Button><a href="tel:02100000000" className="min-h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center gap-2 text-sm font-bold"><Phone className="w-4 h-4"/> تماس</a></div></CardBody></Card><Card><CardBody><b>وضعیت سرویس</b><div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 className="w-4 h-4"/> همه بخش‌های آزمایشی فعال هستند</div></CardBody></Card></div>;
    if (page==='display') return <Card><CardBody className="p-5 space-y-4"><div><h3 className="font-black text-lg">تنظیمات ظاهری</h3><p className="text-sm text-gray-500 mt-1">تنظیمات نمایشی فعلاً روی دستگاه شبیه‌سازی می‌شوند.</p></div><div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><div><b className="text-sm">حالت کم‌نور</b><p className="text-xs text-gray-400 mt-1">در نسخه نهایی به تنظیمات دستگاه متصل می‌شود.</p></div><button onClick={()=>notify('حالت کم‌نور فعلاً در حالت آزمایشی است.')} className="rounded-full bg-gray-200 px-4 py-2 text-xs font-bold">خاموش</button></div><div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><div><b className="text-sm">اعلان‌ها</b><p className="text-xs text-gray-400 mt-1">کنترل اعلان‌های برنامه</p></div><button onClick={()=>{setNotifications(0);notify('اعلان‌ها در حالت آزمایشی خاموش شدند.')}} className="rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-bold">فعال</button></div></CardBody></Card>;
    if (page==='rules') return <div className="space-y-4">
      <Card><CardBody className="p-5 text-sm text-gray-700 leading-8">
        <h3 className="font-black text-xl text-gray-900">قوانین و مقررات اپلیکیشن رانندگان براه</h3>
        <p className="text-xs text-gray-400 mt-2">نسخه ۱.۰ — آخرین به‌روزرسانی: [تاریخ]</p>
        <p className="mt-4">این قوانین و مقررات، چارچوب استفاده رانندگان از اپلیکیشن «براه» و خدمات مرتبط با جستجوی بار، ارسال پیشنهاد، پذیرش حمل، انجام سفر و تحویل بار را مشخص می‌کند. استفاده از اپلیکیشن به معنی مطالعه و پذیرش این شرایط است.</p>

        {[
          ['۱. تعاریف و اصطلاحات','«براه» به اپلیکیشن و خدمات الکترونیکی ارائه‌شده به رانندگان اطلاق می‌شود. «راننده» شخص حقیقی دارای حساب کاربری و مدارک معتبر است که از طریق براه برای دریافت و حمل بار اقدام می‌کند. «صاحب بار» شخص یا مجموعه‌ای است که اطلاعات بار را در سامانه ارائه می‌کند. «بار» محموله‌ای است که مشخصات آن از جمله مبدأ، مقصد، نوع، وزن، زمان و شرایط حمل در سامانه اعلام می‌شود.'],
          ['۲. موارد سلب مسئولیت','براه بستر ارتباط و هماهنگی میان راننده و صاحب بار است و مسئولیت صحت اطلاعاتی که کاربران وارد می‌کنند بر عهده همان کاربر است. راننده موظف است پیش از پذیرش حمل، اطلاعات بار، نوع کالا، وزن، مبدأ، مقصد، زمان‌بندی، مبلغ و شرایط تحویل را بررسی کند. مسئولیت تصمیم نهایی برای پذیرش یا رد هر بار بر عهده راننده است، مگر در مواردی که قانون یا قرارداد معتبر ترتیب دیگری مقرر کند.'],
          ['۳. شرایط ایجاد حساب کاربری','ثبت حساب باید با اطلاعات واقعی راننده انجام شود. هر راننده مسئول حفظ اطلاعات ورود، شماره تلفن و دسترسی به حساب خود است و نباید حساب خود را در اختیار شخص دیگری قرار دهد. ایجاد چند حساب یا استفاده از هویت شخص دیگر ممنوع است. براه می‌تواند برای حفظ امنیت، صحت اطلاعات یا اجرای مقررات، اطلاعات حساب را بررسی یا دسترسی را محدود کند.'],
          ['۴. احراز هویت و مدارک راننده','راننده فقط پس از تکمیل فرایندهای احراز هویت و تأیید مدارک لازم می‌تواند از خدمات حمل بار استفاده کند. اطلاعات هویتی، مدارک رانندگی، مشخصات خودرو، مدارک مرتبط با خودرو و اطلاعات بانکی لازم برای تسویه باید صحیح، معتبر و به‌روز باشند. ارائه مدرک جعلی، منقضی یا متعلق به شخص دیگر ممنوع است و می‌تواند موجب توقف دسترسی به خدمات شود.'],
          ['۵. شرایط استفاده از اپلیکیشن','راننده باید از براه مطابق قوانین جاری کشور، مقررات حمل‌ونقل و دستورالعمل‌های اعلام‌شده استفاده کند. هرگونه استفاده برای فعالیت غیرقانونی، ارائه اطلاعات خلاف واقع، ایجاد اختلال، دسترسی غیرمجاز، مهندسی معکوس یا سوءاستفاده از امکانات سامانه ممنوع است.'],
          ['۶. دریافت و انتخاب بار','نمایش بار در براه به معنی الزام راننده به پذیرش آن نیست. راننده باید پیش از ارسال پیشنهاد یا پذیرش حمل، ظرفیت و نوع خودروی خود، مسیر، وزن، زمان بارگیری و شرایط بار را بررسی کند. ارسال پیشنهاد باید آگاهانه و با مبلغی باشد که راننده واقعاً قادر به اجرای حمل با آن است.'],
          ['۷. کرایه و پرداخت','مبلغ کرایه و شرایط پرداخت باید پیش از شروع حمل برای راننده روشن باشد. هرگونه کارمزد یا هزینه خدمات براه، در صورت وجود، مطابق شرایط اعلام‌شده در سامانه محاسبه می‌شود. تسویه، برگشت وجه، اختلاف مالی و زمان‌بندی پرداخت تابع وضعیت حمل و مقررات اعلامی براه خواهد بود.'],
          ['۸. بارنامه و مدارک حمل','راننده موظف است مدارک قانونی لازم برای حمل را پیش از حرکت بررسی و در طول سفر نگهداری کند. در صورت وجود مغایرت میان اطلاعات سامانه و اسناد حمل، راننده باید پیش از شروع یا ادامه حمل موضوع را از مسیرهای رسمی پیگیری کند.'],
          ['۹. لغو بار و انصراف راننده','لغو پیشنهاد یا انصراف از حمل باید از مسیرهای رسمی براه انجام شود. لغو مکرر یا بدون دلیل موجه، عدم حضور در زمان توافق‌شده یا پذیرش بار بدون توانایی اجرای آن می‌تواند طبق مقررات عملیاتی براه موجب محدودیت دسترسی یا بررسی حساب شود.'],
          ['۱۰. انجام سفر و تحویل بار','پس از پذیرش حمل، راننده موظف است مراحل سفر را مطابق وضعیت‌های اعلام‌شده در اپلیکیشن انجام دهد؛ از جمله مراجعه برای بارگیری، کنترل وضعیت بار، شروع حرکت، حفظ شرایط ایمن حمل و تحویل محموله در مقصد. راننده نباید بدون هماهنگی معتبر، بار را به شخص دیگری واگذار کند. ثبت وضعیت‌های سفر باید مطابق واقع انجام شود.'],
          ['۱۱. موقعیت مکانی','برای ارائه خدماتی مانند نمایش بارهای نزدیک، ثبت مراحل سفر و بهبود ایمنی و پشتیبانی، براه ممکن است با رضایت و تنظیمات دستگاه از اطلاعات موقعیت مکانی استفاده کند. راننده نباید موقعیت جعلی یا ابزارهای غیرمجاز برای تغییر وضعیت سفر استفاده کند.'],
          ['۱۲. ارتباط با صاحب بار','ارتباط درباره بار باید تا حد امکان از مسیرهای رسمی و اطلاعاتی که براه در اختیار طرفین قرار می‌دهد انجام شود. راننده موظف است از توهین، تهدید، مزاحمت، افشای اطلاعات خصوصی یا استفاده خارج از موضوع حمل از اطلاعات تماس خودداری کند.'],
          ['۱۳. قوانین خودرو','خودروی معرفی‌شده در براه باید با اطلاعات ثبت‌شده در حساب مطابقت داشته و از نظر قانونی و فنی برای نوع بار و مسیر موردنظر مناسب باشد. راننده مسئول اعتبار مدارک خودرو، معاینه و الزامات قانونی مرتبط با وسیله نقلیه است.'],
          ['۱۴. ممنوعیت ربات و روش‌های غیرمجاز','استفاده از ربات، اسکریپت، ابزار خودکار، دستکاری درخواست‌ها، دور زدن محدودیت‌های سامانه یا هر روش غیرمجاز برای دریافت بار، ثبت پیشنهاد یا تغییر وضعیت سفر ممنوع است. براه می‌تواند فعالیت‌های مشکوک را بررسی و در صورت لزوم دسترسی حساب را محدود کند.'],
          ['۱۵. اطلاعات و محرمانگی','اطلاعات هویتی، تماس، خودرو، موقعیت مکانی، سوابق پیشنهاد و سفر و اطلاعات مالی در حدود لازم برای ارائه خدمات، امنیت، پشتیبانی و انجام تعهدات قانونی پردازش می‌شوند. براه باید اطلاعات کاربران را مطابق قوانین و سیاست‌های حریم خصوصی خود مدیریت کند. راننده نیز موظف است اطلاعاتی را که درباره صاحب بار یا سایر کاربران دریافت می‌کند محرمانه نگه دارد.'],
          ['۱۶. تعرفه و خدمات براه','در صورت وجود هزینه یا تعرفه برای استفاده از خدمات براه، مبلغ و شرایط آن پیش از اعمال هزینه در مسیرهای رسمی اعلام می‌شود. براه می‌تواند امکانات، تعرفه‌ها و شرایط خدمات را با اعلام قبلی و مطابق قوانین اصلاح کند.'],
          ['۱۷. قطع یا محدود شدن دسترسی','در صورت تخلف از قوانین، ارائه اطلاعات نادرست، استفاده غیرمجاز، شکایت معتبر، نقص مدارک یا ایجاد خطر برای کاربران و عملیات حمل، براه می‌تواند تا زمان بررسی موضوع دسترسی به بخشی یا تمام خدمات را محدود یا متوقف کند. در موارد لازم، رفع محدودیت منوط به تکمیل مدارک یا بررسی پشتیبانی خواهد بود.'],
          ['۱۸. مالکیت فکری','نام، نشان تجاری، طراحی، نرم‌افزار، متن‌ها، تصاویر، ساختار و محتوای اختصاصی براه متعلق به براه یا صاحبان قانونی آن است و استفاده، کپی، انتشار یا بهره‌برداری تجاری بدون مجوز ممنوع است.'],
          ['۱۹. توافق الکترونیکی','ثبت‌نام، ورود، ارسال پیشنهاد، پذیرش بار و استفاده از خدمات براه می‌تواند به عنوان اعلام قصد و پذیرش الکترونیکی شرایط مربوط تلقی شود. سوابق ثبت‌شده در سامانه در حدود قوانین و مقررات قابل استناد خواهند بود.'],
          ['۲۰. ارتباط با براه','برای مشکلات حساب، احراز هویت، بار، سفر، پرداخت یا اعتراض به محدودیت حساب، راننده باید از مسیرهای رسمی پشتیبانی استفاده کند. اطلاعات تماس رسمی براه در نسخه نهایی در این بخش درج می‌شود: [شماره پشتیبانی]، [ایمیل رسمی براه]، [وب‌سایت رسمی براه].'],
          ['۲۱. پذیرش قوانین','با استفاده از براه، راننده تأیید می‌کند که قوانین و مقررات را مطالعه کرده و متعهد به رعایت آن‌ها است. ادامه استفاده از خدمات پس از انتشار نسخه به‌روزشده قوانین، در صورت اعلام و مطابق قوانین، به منزله پذیرش شرایط جدید خواهد بود. برای استفاده از خدمات ارسال پیشنهاد، راننده باید تأیید پذیرش قوانین را در حساب خود ثبت کرده باشد.']
        ].map(([h,p])=><section key={h} className="border-t border-gray-100 pt-4"><h4 className="font-black text-gray-900">{h}</h4><p className="mt-2">{p}</p></section>)}
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 leading-7"><b>توجه حقوقی:</b> این متن برای استفاده در اپلیکیشن براه تنظیم شده و پیش از انتشار عمومی باید توسط مشاور حقوقی براه با اطلاعات ثبتی، قوانین حمل‌ونقل و سیاست حریم خصوصی نهایی تطبیق داده شود.</div>
      </CardBody></Card>
      <Card><CardBody className="p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-primary-600 shrink-0 mt-1"/>
          <div className="flex-1"><b>تأیید مطالعه و پذیرش قوانین</b><p className="text-xs text-gray-500 mt-1 leading-6">برای ارسال پیشنهاد بار، مطالعه و تأیید این قوانین الزامی است.</p></div>
        </div>
        <button onClick={()=>{setTermsAccepted(v=>!v);notify(!termsAccepted?'پذیرش قوانین ثبت شد.':'پذیرش قوانین لغو شد.')}} className={`w-full mt-4 rounded-xl px-4 py-3 text-sm font-black ${termsAccepted?'bg-emerald-100 text-emerald-700':'bg-primary-600 text-white'}`}>{termsAccepted?'✓ قوانین پذیرفته شده است':'مطالعه کردم و می‌پذیرم'}</button>
      </CardBody></Card>
    </div>;
    return <ProfilePage/>;
  };

  return <div dir="rtl" className="min-h-screen bg-[#f8f8f7] text-gray-900">
    <Header />
    <main className="max-w-lg mx-auto px-4 pt-5 pb-24">
      {page!=='home' && page!=='profile' && <button onClick={()=>go(page==='cargo-detail' || page==='origin-select' || page==='destination-select' || page==='destination-all' ? 'search':'home')} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500"><ArrowLeft className="w-4 h-4"/> بازگشت</button>}
      {page==='home' ? <HomePage/> : page==='search' ? <SearchPage/> : page==='profile' ? <ProfilePage/> : page==='cargo-detail' ? <DetailPage/> : page==='origin-select' ? <LocationSelectPage mode="origin"/> : page==='destination-select' ? <LocationSelectPage mode="destination"/> : page==='destination-all' ? <LocationSelectPage mode="destination" allCities/> : <SimplePage/>}
    </main>
    <BottomNav />
    <Drawer />
    <Toast message={toast} onClose={()=>setToast('')} />
    {confirmAction && <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-5"><div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"><h3 className="font-black text-lg">تأیید عملیات</h3><p className="text-sm text-gray-500 mt-2">{confirmAction==='cancel-offer'?'آیا می‌خواهید پیشنهاد انتخاب‌شده لغو شود؟':'آیا می‌خواهید این بار لغو شود؟ این عملیات در نسخه آزمایشی فقط وضعیت رابط را تغییر می‌دهد.'}</p><div className="grid grid-cols-2 gap-2 mt-5"><Button variant="outline" onClick={()=>setConfirmAction(null)}>انصراف</Button><Button onClick={()=>{setConfirmAction(null);setActionBusy(true);setTimeout(()=>{setActionBusy(false);notify('پیشنهاد لغو شد.');},500)}}>{actionBusy?'در حال انجام...':'تأیید'}</Button></div></div></div>}
    {page==='shipment' && shipmentStage==='delivered' && <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4"><div className="rounded-2xl bg-white border shadow-xl p-4"><b>سفر با موفقیت تحویل شد</b><div className="flex gap-2 mt-3">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} className={`text-2xl ${n<=rating?'':'opacity-30'}`}>★</button>)}</div><Button className="w-full mt-3" onClick={()=>notify(rating?'امتیاز شما در حالت آزمایشی ثبت شد.':'لطفاً امتیاز را انتخاب کنید.')}>ثبت امتیاز</Button></div></div>}
    {offerOpen && selected && <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"><div className="w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-7"><div className="flex items-center justify-between"><h3 className="font-black text-lg">ثبت پیشنهاد</h3><button onClick={()=>setOfferOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div><p className="text-sm text-gray-500 mt-2">{selected.title}</p><div className="mt-4 rounded-2xl bg-gray-50 p-4"><div className="flex items-center justify-between text-sm"><span className="text-gray-500">کرایه اعلامی</span><b>{money(selected.price)} تومان</b></div><div className="mt-3 rounded-xl bg-primary-50 p-3 text-xs text-primary-800"><div className="flex items-center gap-2 font-bold"><CircleDollarSign className="w-4 h-4"/> شاخص میانگین قیمت مسیر</div><div className="mt-4" dir="ltr"><div className="relative h-7 overflow-visible rounded-full bg-gradient-to-r from-lime-200 via-lime-300 to-lime-500"><div className="absolute top-1/2 left-[68%] -translate-x-1/2 -translate-y-1/2"><span className="block w-4 h-4 rounded-full bg-white border-[3px] border-lime-700 shadow"></span><span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-lime-700"></span></div></div><div className="mt-3 flex items-center justify-between text-[10px] text-gray-500" dir="rtl"><span className="flex items-center gap-1"><Coins className="w-4 h-4 text-lime-500"/>کم</span><span className="flex items-center gap-1"><Coins className="w-5 h-5 text-lime-700"/>زیاد</span></div></div></div></div><label className="block text-sm font-bold mt-5">مبلغ پیشنهادی (تومان)</label><input autoFocus inputMode="numeric" value={offerPrice} onChange={e=>setOfferPrice(e.target.value.replace(/[^0-9]/g,''))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-left outline-none focus:border-primary-400" dir="ltr"/><Button size="full" className="mt-4" disabled={actionBusy} onClick={submitOffer}>{actionBusy?'در حال ثبت...':'ارسال پیشنهاد'}</Button></div></div>}
  </div>;