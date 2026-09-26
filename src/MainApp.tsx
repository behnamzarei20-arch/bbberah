import { useMemo, useState } from 'react';
import {
  ArrowLeft, Bell, CarFront, CheckCircle2, ChevronLeft, CircleAlert, Clock3,
  FileText, Headphones, Home, LogOut, MapPin, Menu, Navigation, Package,
  PackagePlus, Phone, PhoneCall, ReceiptText, Search, Settings, ShieldCheck,
  Truck, User, WalletCards, X, RefreshCw, Plus, Star, Route, CircleDollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

type Page =
  | 'home' | 'search' | 'nearby' | 'calls' | 'profile' | 'account' | 'vehicle'
  | 'wallet' | 'transactions' | 'support' | 'rules' | 'notifications' | 'display'
  | 'cargo-detail' | 'create-cargo' | 'offers' | 'shipment';

type LoadStatus = 'open' | 'reserved' | 'delivered';
type Load = {
  id: string; title: string; from: string; to: string; type: string; vehicle: string;
  weight: number; price: number; pickup: string; delivery: string; status: LoadStatus;
  distance: number; shipper: string; phone: string;
};

const seedLoads: Load[] = [
  { id:'l1', title:'بار خشک تهران به مشهد', from:'تهران', to:'مشهد', type:'بار خشک', vehicle:'تریلی', weight:18000, price:24500000, pickup:'امروز، ۱۴:۳۰', delivery:'فردا، ۱۰:۰۰', status:'open', distance:18, shipper:'شرکت پارس کالا', phone:'09120000001' },
  { id:'l2', title:'مواد غذایی کرج به اصفهان', from:'کرج', to:'اصفهان', type:'مواد غذایی', vehicle:'کامیون', weight:9000, price:12800000, pickup:'فردا، ۰۸:۰۰', delivery:'فردا، ۲۰:۰۰', status:'open', distance:42, shipper:'توزیع البرز', phone:'09120000002' },
  { id:'l3', title:'کالای تجاری تبریز به تهران', from:'تبریز', to:'تهران', type:'کالای تجاری', vehicle:'خاور', weight:4500, price:8600000, pickup:'فردا، ۱۱:۳۰', delivery:'پس‌فردا، ۰۹:۰۰', status:'open', distance:76, shipper:'بازرگانی آذران', phone:'09120000003' },
  { id:'l4', title:'مصالح ساختمانی قم به تهران', from:'قم', to:'تهران', type:'ساختمانی', vehicle:'تریلی', weight:22000, price:16400000, pickup:'شنبه، ۰۷:۰۰', delivery:'شنبه، ۱۳:۰۰', status:'reserved', distance:96, shipper:'پایدار سازه', phone:'09120000004' },
  { id:'l5', title:'بار کشاورزی رشت به قزوین', from:'رشت', to:'قزوین', type:'کشاورزی', vehicle:'کامیون', weight:7500, price:9700000, pickup:'شنبه، ۰۹:۰۰', delivery:'شنبه، ۱۶:۰۰', status:'open', distance:118, shipper:'سبزینه شمال', phone:'09120000005' },
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
  const [query, setQuery] = useState('');
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showMenu, setShowMenu] = useState(false);
  const [city, setCity] = useState('');
  const [cargoForm, setCargoForm] = useState({from:'',to:'',type:'بار خشک',vehicle:'تریلی',weight:'',price:'',pickup:''});
  const [offerPrice, setOfferPrice] = useState('');
  const [shipmentStage, setShipmentStage] = useState<'accepted'|'loading'|'in_transit'|'delivered'>('accepted');
  const [rating, setRating] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | 'cancel-offer' | 'cancel-cargo'>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({type:'تریلی',plate:'',model:'',year:''});
  const [accountName, setAccountName] = useState(profile?.full_name || '');

  const notify = (m:string) => { setToast(m); window.setTimeout(()=>setToast(''), 2600); };
  const go = (p:Page) => { setPage(p); setShowMenu(false); window.scrollTo({top:0,behavior:'smooth'}); };
  const filtered = useMemo(() => loads.filter(l => l.status !== 'delivered' && (!query || `${l.title} ${l.from} ${l.to} ${l.type} ${l.vehicle}`.includes(query)) && (!city || l.to === city || l.from === city)), [loads,query,city]);
  const title:Record<Page,string> = {
    home:'براه', search:'جستجوی بار', nearby:'اطراف من', calls:'تماس‌های من', profile:'حساب کاربری',
    account:'اطلاعات حساب', vehicle:'خودروی من', wallet:'کیف پول', transactions:'تراکنش‌ها',
    support:'پشتیبانی', rules:'قوانین و مقررات', notifications:'اعلان‌ها', display:'تنظیمات ظاهری', 'cargo-detail':'جزئیات بار',
    'create-cargo':'ثبت بار جدید', offers:'پیشنهادهای من', shipment:'سفر جاری'
  };

  const requestOffer = (load:Load) => { setSelected(load); setOfferPrice(String(load.price)); setOfferOpen(true); };
  const submitOffer = () => {
    if (actionBusy) return;
    const n = Number(offerPrice.replace(/,/g,''));
    if (!n || n < 1000000) return notify('مبلغ پیشنهاد را به‌صورت معتبر وارد کنید.');
    setActionBusy(true);
    setTimeout(()=>setActionBusy(false),500);
    setOfferOpen(false); go('offers'); notify('پیشنهاد شما با موفقیت در حالت آزمایشی ثبت شد.');
  };
  const createCargo = () => {
    const weight=Number(cargoForm.weight), price=Number(cargoForm.price);
    if (!cargoForm.from.trim() || !cargoForm.to.trim()) return notify('مبدأ و مقصد را وارد کنید.');
    if (cargoForm.from.trim() === cargoForm.to.trim()) return notify('مبدأ و مقصد نمی‌توانند یکسان باشند.');
    if (!weight || weight <= 0) return notify('وزن بار باید بیشتر از صفر باشد.');
    if (!price || price < 100000) return notify('کرایه پیشنهادی معتبر وارد کنید.');
    if (!cargoForm.pickup) return notify('زمان بارگیری را انتخاب کنید.');
    const newLoad:Load = { id:`new-${Date.now()}`, title:`بار ${cargoForm.from} به ${cargoForm.to}`, from:cargoForm.from, to:cargoForm.to, type:cargoForm.type, vehicle:cargoForm.vehicle, weight, price, pickup:cargoForm.pickup, delivery:'تاریخ انتخاب نشده', status:'open', distance:0, shipper:profile?.full_name || 'کاربر براه', phone:profile?.phone || '' };
    setLoads(v=>[newLoad,...v]); go('home'); notify('بار آزمایشی شما ثبت شد. در فاز دوم به دیتابیس متصل می‌شود.');
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
      ].map(([p,l,I])=><button key={p as string} onClick={()=>go(p as Page)} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${page===p?'text-primary-700 font-black':'text-gray-400'}`}><I className="w-5 h-5"/>{l}</button>)}
    </div>
  </nav>;

  const Drawer = () => showMenu ? <div className="fixed inset-0 z-50 bg-black/30" onClick={()=>setShowMenu(false)}>
    <aside className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6"><div><b className="text-xl">{profile?.full_name || 'کاربر براه'}</b><span className="block text-xs text-gray-400 mt-1">{profile?.phone}</span></div><button onClick={()=>setShowMenu(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div>
      <div className="space-y-1">
        {[
          ['profile','حساب کاربری',User],['vehicle','خودروی من',CarFront],['wallet','کیف پول',WalletCards],['offers','پیشنهادهای من',ReceiptText],['shipment','سفر جاری',Truck],['support','پشتیبانی',Headphones],['rules','قوانین و مقررات',FileText],['display','تنظیمات ظاهری',Settings]
        ].map(([p,l,I])=><button key={p as string} onClick={()=>go(p as Page)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-orange-50"><Icon className="w-5 h-5 text-primary-600"/><span className="flex-1 font-bold text-sm">{l}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}
        <button onClick={()=>signOut()} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right text-red-600 mt-3"><LogOut className="w-5 h-5"/><span className="font-bold text-sm">خروج از حساب</span></button>
      </div>
    </aside>
  </div> : null;

  const HomePage = () => <div className="space-y-5">
    <section className="rounded-[28px] bg-gradient-to-br from-orange-500 to-amber-500 text-white p-5 shadow-lg shadow-orange-100">
      <div className="flex items-start justify-between"><div><p className="text-sm text-white/80">سلام {profile?.full_name || 'دوست براهی'} 👋</p><h2 className="text-2xl font-black mt-1">بار مناسب مسیرت را پیدا کن</h2></div><Truck className="w-10 h-10 opacity-80"/></div>
      <button onClick={()=>go('search')} className="mt-5 w-full bg-white text-gray-800 rounded-2xl px-4 py-3.5 text-right flex items-center gap-3"><Search className="w-5 h-5 text-gray-400"/><span className="text-sm text-gray-400">مبدأ، مقصد یا نوع بار را جستجو کن</span></button>
    </section>
    <div className="grid grid-cols-2 gap-3">
      <button onClick={()=>go('nearby')} className="rounded-2xl bg-white border border-gray-100 p-4 text-right"><Navigation className="w-6 h-6 text-primary-600"/><b className="block mt-5">اطراف من</b><span className="text-[11px] text-gray-400">بارهای نزدیک</span></button>
      <button onClick={()=>go('create-cargo')} className="rounded-2xl bg-white border border-gray-100 p-4 text-right"><PackagePlus className="w-6 h-6 text-primary-600"/><b className="block mt-5">ثبت بار</b><span className="text-[11px] text-gray-400">ثبت بار جدید</span></button>
    </div>
    <div className="flex items-center justify-between"><h3 className="font-black">بارهای پیشنهادی</h3><button onClick={()=>go('search')} className="text-xs text-primary-700 font-bold">مشاهده همه</button></div>
    <div className="space-y-3">{loads.filter(l=>l.status==='open').slice(0,3).map(l=><LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>)}</div>
  </div>;

  const SearchPage = () => <div className="space-y-4">
    <div className="relative"><Search className="absolute right-4 top-3.5 w-5 h-5 text-gray-400"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white pr-12 pl-4 py-3.5 outline-none focus:border-orange-400" placeholder="مثلاً تهران، مشهد، تریلی..." /></div>
    <div className="flex gap-2 overflow-auto pb-1">{['همه','تهران','مشهد','اصفهان','کرج'].map(c=><button key={c} onClick={()=>setCity(c==='همه'?'':c)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${city===(c==='همه'?'':c)?'bg-primary-600 text-white':'bg-white border border-gray-200 text-gray-600'}`}>{c}</button>)}</div>
    {filtered.length ? <div className="space-y-3">{filtered.map(l=><LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>)}</div> : <Card><CardBody><Empty title="بار موردنظر پیدا نشد" text="فیلترها را تغییر دهید یا دوباره جستجو کنید." action={()=>{setQuery('');setCity('')}}/></CardBody></Card>}
  </div>;

  const ProfilePage = () => <div className="space-y-3">
    <Card><CardBody className="p-5 flex items-center gap-4"><div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center"><User className="w-7 h-7 text-primary-700"/></div><div><b className="text-lg">{profile?.full_name || 'کاربر براه'}</b><p className="text-xs text-gray-400 mt-1" dir="ltr">{profile?.phone}</p></div></CardBody></Card>
    {[
      ['account','اطلاعات حساب','نام، شهر و شماره تماس',User],['vehicle','خودروی من','مشخصات خودرو و پلاک',CarFront],['wallet','کیف پول','موجودی و عملیات مالی',WalletCards],['transactions','تراکنش‌ها','سوابق مالی',ReceiptText],['offers','پیشنهادهای من','پیشنهادهای ارسال‌شده',ReceiptText],['shipment','سفر جاری','وضعیت بار فعال',Truck],['support','پشتیبانی','راهنما و ارتباط',Headphones]
    ].map(([p,l,s,I])=><button key={p as string} onClick={()=>go(p as Page)} className="w-full rounded-2xl bg-white border border-gray-100 p-4 flex items-center gap-3 text-right"><I className="w-5 h-5 text-primary-600"/><span className="flex-1"><b className="block text-sm">{l}</b><small className="text-gray-400">{s}</small></span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}
  </div>;

  const DetailPage = () => selected ? <div className="space-y-4">
    <Card><CardBody className="p-5"><div className="flex items-center justify-between"><Status status={selected.status}/><span className="text-xs text-gray-400">{fa(selected.distance)} کیلومتر تا مبدأ</span></div><h2 className="text-xl font-black mt-3">{selected.title}</h2><div className="flex items-center gap-4 mt-5"><div className="flex-1"><b className="text-lg">{selected.from}</b><span className="block text-xs text-gray-400 mt-1">مبدأ</span></div><Route className="w-6 h-6 text-primary-500 rotate-180"/><div className="flex-1 text-left"><b className="text-lg">{selected.to}</b><span className="block text-xs text-gray-400 mt-1">مقصد</span></div></div></CardBody></Card>
    <Card><CardBody className="p-5 space-y-4"><h3 className="font-black">جزئیات</h3><div className="grid grid-cols-2 gap-3 text-sm"><div className="bg-gray-50 rounded-xl p-3">نوع بار<b className="block mt-1">{selected.type}</b></div><div className="bg-gray-50 rounded-xl p-3">وسیله<b className="block mt-1">{selected.vehicle}</b></div><div className="bg-gray-50 rounded-xl p-3">وزن<b className="block mt-1">{fa(selected.weight)} کیلو</b></div><div className="bg-gray-50 rounded-xl p-3">کرایه<b className="block mt-1">{money(selected.price)} تومان</b></div></div><div className="flex items-center gap-3 text-sm"><Clock3 className="w-5 h-5 text-primary-600"/><span>بارگیری: <b>{selected.pickup}</b></span></div><div className="flex items-center gap-3 text-sm"><MapPin className="w-5 h-5 text-primary-600"/><span>تحویل: <b>{selected.delivery}</b></span></div></CardBody></Card>
    <Card><CardBody className="p-5"><h3 className="font-black">صاحب بار</h3><p className="text-sm mt-2">{selected.shipper}</p><a href={`tel:${selected.phone}`} className="mt-4 w-full rounded-xl bg-gray-50 py-3 flex items-center justify-center gap-2 font-bold text-sm"><Phone className="w-4 h-4"/> تماس تلفنی</a></CardBody></Card>
    <Button size="full" disabled={selected.status!=='open'} onClick={()=>requestOffer(selected)}>{selected.status==='open'?'ثبت پیشنهاد برای این بار':'این بار قابل پیشنهاد نیست'}</Button>
  </div> : <Empty title="بار انتخاب نشده" text="از جستجو یک بار را انتخاب کنید." action={()=>go('search')}/>;

  const CreateCargo = () => <div className="space-y-4">
    <Card><CardBody className="p-5 space-y-4"><p className="text-sm text-gray-500">این فرم فعلاً نمایشی است و برای طراحی کامل جریان ثبت بار استفاده می‌شود.</p>
      {[
        ['from','مبدأ','مثلاً تهران'],['to','مقصد','مثلاً مشهد'],['weight','وزن بار (کیلو)','مثلاً ۱۸۰۰۰'],['price','کرایه پیشنهادی (تومان)','مثلاً ۲۴۵۰۰۰۰۰']
      ].map(([k,l,p])=><div key={k}><label className="text-sm font-bold">{l}</label><input inputMode={k==='weight'||k==='price'?'numeric':'text'} value={(cargoForm as any)[k]} onChange={e=>setCargoForm(v=>({...v,[k]:e.target.value}))} placeholder={p} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400"/></div>)}
      <div><label className="text-sm font-bold">نوع بار</label><select value={cargoForm.type} onChange={e=>setCargoForm(v=>({...v,type:e.target.value}))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"><option>بار خشک</option><option>مواد غذایی</option><option>کالای تجاری</option><option>ساختمانی</option><option>کشاورزی</option></select></div>
      <div><label className="text-sm font-bold">زمان بارگیری</label><input type="datetime-local" value={cargoForm.pickup} onChange={e=>setCargoForm(v=>({...v,pickup:e.target.value}))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"/></div>
      <div><label className="text-sm font-bold">نوع وسیله</label><select value={cargoForm.vehicle} onChange={e=>setCargoForm(v=>({...v,vehicle:e.target.value}))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"><option>تریلی</option><option>کامیون</option><option>خاور</option><option>نیسان</option></select></div>
      <Button size="full" onClick={createCargo}>ثبت بار</Button>
    </CardBody></Card>
  </div>;

  const SimplePage = () => {
    if (page==='nearby') return <div className="space-y-4"><Card><CardBody className="p-5"><div className="flex gap-3"><MapPin className="w-6 h-6 text-primary-600"/><div><b>بارهای اطراف</b><p className="text-xs text-gray-400 mt-1">برای فاز اول، فاصله‌ها شبیه‌سازی شده‌اند.</p></div></div><Button className="w-full mt-4" onClick={()=>notify('موقعیت مکانی آزمایشی به‌روزرسانی شد.')}>به‌روزرسانی موقعیت</Button></CardBody></Card>{loads.filter(l=>l.status==='open').sort((a,b)=>a.distance-b.distance).slice(0,4).map(l=><LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>)}</div>;
    if (page==='calls') return <div className="space-y-3">{loads.slice(0,2).map(l=><Card key={l.id}><CardBody className="p-4 flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center"><PhoneCall className="w-5 h-5 text-primary-600"/></div><div className="flex-1"><b>{l.shipper}</b><p className="text-xs text-gray-400 mt-1">{l.title}</p></div><a href={`tel:${l.phone}`} className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center"><Phone className="w-5 h-5"/></a></CardBody></Card>)}<Empty title="سوابق تماس" text="تماس‌های واقعی بعد از اتصال به سرویس ثبت خواهند شد."/></div>;
    if (page==='notifications') return <div className="space-y-3">{['بار جدید در مسیر تهران به مشهد ثبت شد.','پیشنهاد آزمایشی شما در انتظار بررسی است.','اطلاعات حساب شما با موفقیت ذخیره شد.'].map((n,i)=><Card key={i}><CardBody className="p-4 flex gap-3"><Bell className="w-5 h-5 text-primary-600"/><div><b className="text-sm">{n}</b><p className="text-[11px] text-gray-400 mt-1">{i===0?'امروز':'دیروز'}</p></div></CardBody></Card>)}</div>;
    if (page==='offers') return <div className="space-y-3"><Card><CardBody className="p-5"><div className="flex justify-between"><span className="text-gray-400 text-sm">پیشنهادهای فعال</span><b>۲</b><Button variant="outline" className="w-full mt-3" onClick={()=>setConfirmAction('cancel-offer')}>لغو پیشنهاد انتخاب‌شده</Button></div><div className="h-2 bg-gray-100 rounded-full mt-4 overflow-hidden"><div className="h-full w-2/3 bg-primary-500 rounded-full"/></div></CardBody></Card><Card><CardBody className="p-5"><b>تهران ← مشهد</b><p className="text-xs text-gray-400 mt-1">پیشنهاد شما: ۲۳,۵۰۰,۰۰۰ تومان</p><div className="mt-4 flex items-center gap-2 text-xs text-amber-700"><Clock3 className="w-4 h-4"/> در انتظار پاسخ صاحب بار</div></CardBody></Card></div>;
    if (page==='shipment') return <div className="space-y-4"><Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><b>سفر تهران به مشهد</b><p className="text-xs text-gray-400 mt-1">بار خشک • تریلی</p></div></div><div className="mt-5 space-y-4">{['پیشنهاد تأیید شد','بارگیری انجام شد','در مسیر مقصد'].map((s,i)=><div key={s} className="flex gap-3"><div className={`w-7 h-7 rounded-full flex items-center justify-center ${i<2?'bg-emerald-100 text-emerald-700':'bg-orange-100 text-orange-700'}`}>{i<2?<CheckCircle2 className="w-4 h-4"/>:<Navigation className="w-4 h-4"/>}</div><div><b className="text-sm">{s}</b><p className="text-xs text-gray-400 mt-1">{i<2?'تکمیل شده':'وضعیت فعلی'}</p></div></div>)}</div></CardBody></Card></div>;
    if (page==='wallet') return <div className="space-y-4"><Card><CardBody className="p-6 text-center"><CircleDollarSign className="w-8 h-8 mx-auto text-primary-600"/><p className="text-sm text-gray-400 mt-3">موجودی آزمایشی</p><b className="text-3xl block mt-2">۰ تومان</b><Button className="w-full mt-5" onClick={()=>notify('درگاه پرداخت در فاز دوم متصل می‌شود.')}>افزایش موجودی</Button></CardBody></Card></div>;
    if (page==='transactions') return <Card><CardBody><Empty title="تراکنشی وجود ندارد" text="سوابق مالی پس از اتصال کیف پول نمایش داده می‌شوند." action={()=>notify('داده آزمایشی جدیدی وجود ندارد.')}/></CardBody></Card>;
    if (page==='vehicle') return <Card><CardBody className="p-5 space-y-4"><div className="flex items-center gap-3"><CarFront className="w-7 h-7 text-primary-600"/><div><b>خودروی من</b><p className="text-xs text-gray-400 mt-1">اطلاعات خودرو در حالت آزمایشی نگهداری می‌شود.</p></div></div><select value={vehicleForm.type} onChange={e=>setVehicleForm(v=>({...v,type:e.target.value}))} className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-white"><option>تریلی</option><option>کامیون</option><option>خاور</option><option>نیسان</option></select><input value={vehicleForm.plate} onChange={e=>setVehicleForm(v=>({...v,plate:e.target.value}))} placeholder="پلاک خودرو" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><input value={vehicleForm.model} onChange={e=>setVehicleForm(v=>({...v,model:e.target.value}))} placeholder="مدل خودرو" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><input inputMode="numeric" value={vehicleForm.year} onChange={e=>setVehicleForm(v=>({...v,year:e.target.value.replace(/\D/g,'').slice(0,4)}))} placeholder="سال ساخت" className="w-full rounded-xl border border-gray-200 px-4 py-3"/><Button className="w-full" onClick={()=>{if(!vehicleForm.plate.trim()||!vehicleForm.model.trim())return notify('پلاک و مدل خودرو را کامل کنید.');notify('خودرو در حالت آزمایشی ذخیره شد.')}}>ذخیره خودرو</Button></CardBody></Card>;
    if (page==='account') return <Card><CardBody className="p-5 space-y-4"><label className="text-sm font-bold">نام و نام خانوادگی</label><input value={accountName} onChange={e=>setAccountName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3"/><label className="text-sm font-bold">شماره موبایل</label><input value={profile?.phone||''} disabled dir="ltr" className="w-full rounded-xl border border-gray-200 px-4 py-3 bg-gray-50"/><Button className="w-full" onClick={()=>notify('تغییرات به‌صورت آزمایشی ذخیره شد.')}>ذخیره تغییرات</Button></CardBody></Card>;
    if (page==='support') return <div className="space-y-3"><Card><CardBody className="p-5"><Headphones className="w-7 h-7 text-primary-600"/><h3 className="font-black mt-3">مرکز پشتیبانی</h3><p className="text-sm text-gray-500 leading-7 mt-2">برای مشکلات حساب، بار یا سفر، موضوع خود را از مسیرهای زیر پیگیری کنید.</p><div className="grid grid-cols-2 gap-2 mt-4"><Button size="sm" variant="outline" onClick={()=>notify('چت پشتیبانی در نسخه نهایی فعال می‌شود.')}>گفتگوی آنلاین</Button><a href="tel:02100000000" className="min-h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center gap-2 text-sm font-bold"><Phone className="w-4 h-4"/> تماس</a></div></CardBody></Card><Card><CardBody><b>وضعیت سرویس</b><div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 className="w-4 h-4"/> همه بخش‌های آزمایشی فعال هستند</div></CardBody></Card></div>;
    if (page==='display') return <Card><CardBody className="p-5 space-y-4"><div><h3 className="font-black text-lg">تنظیمات ظاهری</h3><p className="text-sm text-gray-500 mt-1">تنظیمات نمایشی فعلاً روی دستگاه شبیه‌سازی می‌شوند.</p></div><div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><div><b className="text-sm">حالت کم‌نور</b><p className="text-xs text-gray-400 mt-1">در نسخه نهایی به تنظیمات دستگاه متصل می‌شود.</p></div><button onClick={()=>notify('حالت کم‌نور فعلاً در حالت آزمایشی است.')} className="rounded-full bg-gray-200 px-4 py-2 text-xs font-bold">خاموش</button></div><div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"><div><b className="text-sm">اعلان‌ها</b><p className="text-xs text-gray-400 mt-1">کنترل اعلان‌های برنامه</p></div><button onClick={()=>{setNotifications(0);notify('اعلان‌ها در حالت آزمایشی خاموش شدند.')}} className="rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-bold">فعال</button></div></CardBody></Card>;
    if (page==='rules') return <Card><CardBody className="p-5 text-sm text-gray-600 leading-8"><h3 className="font-black text-lg text-gray-900">قوانین و مقررات</h3><p className="mt-3">اطلاعات بار، خودرو و حساب باید صحیح و قابل استناد باشد.</p><p className="mt-2">شرایط حمل، قیمت و زمان‌بندی باید پیش از شروع سفر برای طرفین روشن باشد.</p><p className="mt-2">نسخه حقوقی نهایی این بخش پیش از انتشار عمومی تکمیل خواهد شد.</p></CardBody></Card>;
    return <ProfilePage/>;
  };

  return <div dir="rtl" className="min-h-screen bg-[#f8f8f7] text-gray-900">
    <Header />
    <main className="max-w-lg mx-auto px-4 pt-5 pb-24">
      {page!=='home' && page!=='profile' && <button onClick={()=>go(page==='cargo-detail'?'search':'home')} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500"><ArrowLeft className="w-4 h-4"/> بازگشت</button>}
      {page==='home' ? <HomePage/> : page==='search' ? <SearchPage/> : page==='profile' ? <ProfilePage/> : page==='cargo-detail' ? <DetailPage/> : page==='create-cargo' ? <CreateCargo/> : <SimplePage/>}
    </main>
    <BottomNav />
    <Drawer />
    <Toast message={toast} onClose={()=>setToast('')} />
    {confirmAction && <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-5"><div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"><h3 className="font-black text-lg">تأیید عملیات</h3><p className="text-sm text-gray-500 mt-2">{confirmAction==='cancel-offer'?'آیا می‌خواهید پیشنهاد انتخاب‌شده لغو شود؟':'آیا می‌خواهید این بار لغو شود؟ این عملیات در نسخه آزمایشی فقط وضعیت رابط را تغییر می‌دهد.'}</p><div className="grid grid-cols-2 gap-2 mt-5"><Button variant="outline" onClick={()=>setConfirmAction(null)}>انصراف</Button><Button onClick={()=>{setConfirmAction(null);setActionBusy(true);setTimeout(()=>{setActionBusy(false);notify(confirmAction==='cancel-offer'?'پیشنهاد لغو شد.':'بار لغو شد.');},500)}}>{actionBusy?'در حال انجام...':'تأیید'}</Button></div></div></div>}
    {page==='shipment' && shipmentStage==='delivered' && <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4"><div className="rounded-2xl bg-white border shadow-xl p-4"><b>سفر با موفقیت تحویل شد</b><div className="flex gap-2 mt-3">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRating(n)} className={`text-2xl ${n<=rating?'':'opacity-30'}`}>★</button>)}</div><Button className="w-full mt-3" onClick={()=>notify(rating?'امتیاز شما در حالت آزمایشی ثبت شد.':'لطفاً امتیاز را انتخاب کنید.')}>ثبت امتیاز</Button></div></div>}
    {offerOpen && selected && <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"><div className="w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-7"><div className="flex items-center justify-between"><h3 className="font-black text-lg">ثبت پیشنهاد</h3><button onClick={()=>setOfferOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div><p className="text-sm text-gray-500 mt-2">{selected.title}</p><label className="block text-sm font-bold mt-5">مبلغ پیشنهادی (تومان)</label><input autoFocus inputMode="numeric" value={offerPrice} onChange={e=>setOfferPrice(e.target.value.replace(/[^0-9]/g,''))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-left outline-none focus:border-orange-400" dir="ltr"/><Button size="full" className="mt-4" disabled={actionBusy} onClick={submitOffer}>{actionBusy?'در حال ثبت...':'ارسال پیشنهاد'}</Button></div></div>}
  </div>;
}
