import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Bell, Car, CarFront, CheckCircle2, ChevronLeft, Clock3, Weight as WeightIcon, Percent,
  FileText, Headphones, Home, LogOut, MapPin, Menu, Navigation, Package,
  Phone, PhoneCall, ReceiptText, Search, Settings, ShieldCheck,
  Truck, Container, BusFront, User, WalletCards, X, RefreshCw, Plus, Star, MoreVertical, Route, CircleDollarSign, Coins, Target, Globe2, AlertTriangle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { iranLocations } from '@/data/iranLocations';

type Page =
  | 'home' | 'search' | 'nearby' | 'calls' | 'profile' | 'account' | 'vehicle' | 'vehicle-select'
  | 'wallet' | 'transactions' | 'support' | 'rules' | 'notifications' | 'display'
  | 'cargo-detail' | 'vehicle-loader' | 'trailer-select' | 'flatbed-size' | 'report' | 'offers' | 'verification' | 'shipment' | 'origin-select' | 'destination-select' | 'nearby-destination-select' | 'nearby-results' | 'destination-all' | 'frequent-route' | 'contact-report';

type LoadStatus = 'open' | 'reserved' | 'delivered';
type Load = {
  id: string; title: string; from: string; to: string; type: string; vehicle: string;
  weight: number; price: number; pickup: string; delivery: string; status: LoadStatus;
  distance: number; routeDistance: number; description: string; phone: string;
};

type GeoPoint = { lat:number; lon:number };

const seedLoads: Load[] = [
  { id:'l1', title:'بار خشک تهران به مشهد', from:'تهران', to:'مشهد', type:'بار خشک', vehicle:'تریلی', weight:18000, price:24500000, pickup:'امروز، ۱۴:۳۰', delivery:'فردا، ۱۰:۰۰', status:'open', distance:18, routeDistance:897, description:'بار خشک بسته‌بندی‌شده؛ بارگیری در محل اعلام‌شده و تحویل طبق زمان‌بندی.', phone:'09120000001' },
  { id:'l2', title:'مواد غذایی کرج به اصفهان', from:'کرج', to:'اصفهان', type:'مواد غذایی', vehicle:'کامیون', weight:9000, price:12800000, pickup:'فردا، ۰۸:۰۰', delivery:'فردا، ۲۰:۰۰', status:'open', distance:42, routeDistance:435, description:'مواد غذایی بسته‌بندی‌شده؛ نیازمند حمل مناسب و تحویل در بازه تعیین‌شده.', phone:'09120000002' },
  { id:'l3', title:'کالای تجاری تبریز به تهران', from:'تبریز', to:'تهران', type:'کالای تجاری', vehicle:'خاور', weight:4500, price:8600000, pickup:'فردا، ۱۱:۳۰', delivery:'پس‌فردا، ۰۹:۰۰', status:'open', distance:76, routeDistance:630, description:'کالای تجاری بسته‌بندی‌شده؛ جزئیات محموله هنگام هماهنگی حمل اعلام می‌شود.', phone:'09120000003' },
  { id:'l4', title:'مصالح ساختمانی قم به تهران', from:'قم', to:'تهران', type:'ساختمانی', vehicle:'تریلی', weight:22000, price:16400000, pickup:'شنبه، ۰۷:۰۰', delivery:'شنبه، ۱۳:۰۰', status:'reserved', distance:96, routeDistance:140, description:'مصالح ساختمانی بسته‌بندی‌شده؛ هماهنگی بارگیری و تحویل طبق برنامه حمل.', phone:'09120000004' },
  { id:'l5', title:'بار کشاورزی رشت به قزوین', from:'رشت', to:'قزوین', type:'کشاورزی', vehicle:'کامیون', weight:7500, price:9700000, pickup:'شنبه، ۰۹:۰۰', delivery:'شنبه، ۱۶:۰۰', status:'open', distance:118, routeDistance:178, description:'بار کشاورزی بسته‌بندی‌شده؛ شرایط حمل و زمان تحویل هنگام هماهنگی اعلام می‌شود.', phone:'09120000005' },
  { id:'l6', title:'تره بار شهر صنعتی البرز به قائمشهر', from:'شهر صنعتی البرز', to:'قائمشهر', type:'تره بار', vehicle:'کامیون', weight:2000, price:10000000, pickup:'امروز، ۱۰:۰۰', delivery:'امروز، ۱۸:۰۰', status:'open', distance:240, routeDistance:330, description:'نمونه بار برای نمایش ساختار کارت؛ مبدأ شهر صنعتی البرز از استان قزوین و مقصد قائمشهر از استان مازندران.', phone:'09120000006' },
];
const searchOnlyLoads: Load[] = [
  { id:'s1', title:'بار خشک تهران به شیراز', from:'تهران', to:'شیراز', type:'بار خشک', vehicle:'تریلی', weight:17000, price:19800000, pickup:'امروز، ۱۵:۰۰', delivery:'فردا، ۱۱:۰۰', status:'open', distance:35, routeDistance:845, description:'بار خشک بسته‌بندی‌شده؛ بارگیری و تحویل طبق زمان‌بندی.', phone:'09121110001' },
  { id:'s2', title:'مواد غذایی مشهد به تهران', from:'مشهد', to:'تهران', type:'مواد غذایی', vehicle:'کامیون', weight:10000, price:14200000, pickup:'فردا، ۰۷:۳۰', delivery:'فردا، ۲۱:۰۰', status:'open', distance:48, routeDistance:900, description:'مواد غذایی بسته‌بندی‌شده؛ نیازمند حمل مناسب.', phone:'09121110002' },
  { id:'s3', title:'بار تجاری اصفهان به تبریز', from:'اصفهان', to:'تبریز', type:'کالای تجاری', vehicle:'خاور', weight:5200, price:9200000, pickup:'فردا، ۱۰:۰۰', delivery:'پس‌فردا، ۰۸:۳۰', status:'open', distance:62, routeDistance:820, description:'کالای تجاری بسته‌بندی‌شده.', phone:'09121110003' },
  { id:'s4', title:'مصالح ساختمانی کرج به قم', from:'کرج', to:'قم', type:'ساختمانی', vehicle:'تریلی', weight:21000, price:15100000, pickup:'شنبه، ۰۶:۳۰', delivery:'شنبه، ۱۳:۳۰', status:'open', distance:74, routeDistance:230, description:'مصالح ساختمانی بسته‌بندی‌شده.', phone:'09121110004' },
  { id:'s5', title:'بار کشاورزی رشت به تهران', from:'رشت', to:'تهران', type:'کشاورزی', vehicle:'کامیون', weight:7800, price:10800000, pickup:'شنبه، ۰۹:۳۰', delivery:'شنبه، ۱۷:۰۰', status:'open', distance:88, routeDistance:325, description:'بار کشاورزی بسته‌بندی‌شده.', phone:'09121110005' },
  { id:'s6', title:'تره بار اهواز به اصفهان', from:'اهواز', to:'اصفهان', type:'تره بار', vehicle:'کامیون', weight:12000, price:17600000, pickup:'یکشنبه، ۰۸:۰۰', delivery:'یکشنبه، ۲۰:۰۰', status:'open', distance:102, routeDistance:740, description:'تره بار با نیاز به حمل مناسب.', phone:'09121110006' },
  { id:'s7', title:'بار صنعتی قزوین به مشهد', from:'قزوین', to:'مشهد', type:'بار صنعتی', vehicle:'تریلی', weight:19500, price:22400000, pickup:'یکشنبه، ۰۷:۰۰', delivery:'دوشنبه، ۱۰:۰۰', status:'open', distance:116, routeDistance:1050, description:'بار صنعتی بسته‌بندی‌شده.', phone:'09121110007' },
  { id:'s8', title:'لوازم خانگی تهران به رشت', from:'تهران', to:'رشت', type:'لوازم خانگی', vehicle:'کامیون', weight:6800, price:11900000, pickup:'دوشنبه، ۰۹:۰۰', delivery:'دوشنبه، ۱۷:۳۰', status:'open', distance:128, routeDistance:320, description:'لوازم خانگی بسته‌بندی‌شده.', phone:'09121110008' },
  { id:'s9', title:'بار بسته‌بندی شیراز به بندرعباس', from:'شیراز', to:'بندرعباس', type:'بار بسته‌بندی', vehicle:'تریلی', weight:16000, price:18700000, pickup:'دوشنبه، ۱۳:۰۰', delivery:'سه‌شنبه، ۰۹:۰۰', status:'open', distance:140, routeDistance:570, description:'بار بسته‌بندی‌شده برای حمل جاده‌ای.', phone:'09121110009' },
  { id:'s10', title:'محصولات کشاورزی ساری به تهران', from:'ساری', to:'تهران', type:'کشاورزی', vehicle:'کامیون', weight:7300, price:10100000, pickup:'سه‌شنبه، ۰۸:۳۰', delivery:'سه‌شنبه، ۱۵:۳۰', status:'open', distance:155, routeDistance:280, description:'محصولات کشاورزی بسته‌بندی‌شده.', phone:'09121110010' },
];

const frequentRoutes = [
  { from:'تهران', to:'مشهد' },
  { from:'کرج', to:'اصفهان' },
  { from:'تبریز', to:'تهران' },
];


const money = (v:number) => new Intl.NumberFormat('fa-IR').format(v);
const fa = (v:string|number) => String(v).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const cityProvinceName = (city:string) => {
  for (const province of iranLocations) for (const county of province.counties) if (county.cities.includes(city)) return province.name;
  return '';
};

function VehicleIcon({ type }: { type: string }) {
  const common = { width: 28, height: 28, viewBox: '0 0 64 40', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'تریلی') return <svg {...common} aria-hidden="true"><path d="M3 27V12h20v15M23 27h7V18h10l6 9h15v4H3v-4"/><path d="M40 18V12h10l6 9"/><circle cx="13" cy="31" r="4"/><circle cx="35" cy="31" r="4"/><circle cx="54" cy="31" r="4"/><path d="M27 27h4"/></svg>;
  if (type === 'جفت') return <svg {...common} aria-hidden="true"><path d="M3 28V11h22v17h8V18h10l7 10h11v4H3v-4"/><circle cx="12" cy="32" r="4"/><circle cx="37" cy="32" r="4"/><circle cx="53" cy="32" r="4"/><path d="M25 28h8"/></svg>;
  if (type === 'تک') return <svg {...common} aria-hidden="true"><path d="M3 28V11h22v17h8V18h10l7 10h8v4H3v-4"/><circle cx="12" cy="32" r="4"/><circle cx="37" cy="32" r="4"/><path d="M25 28h8"/></svg>;
  if (type === 'کامیونت') return <svg {...common} aria-hidden="true"><path d="M5 28V10h25v18h7V17h10l7 11h5v4H5v-4"/><circle cx="15" cy="32" r="4"/><circle cx="42" cy="32" r="4"/><path d="M30 28h7"/></svg>;
  return <svg {...common} aria-hidden="true"><path d="M5 27V15h25v12h6v-7h10l8 7h5v4H5v-4"/><path d="M37 20h8l5 7"/><circle cx="14" cy="31" r="4"/><circle cx="45" cy="31" r="4"/><path d="M30 27h6"/></svg>;
}

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

function LoadCard({ load, onOpen, onOffer, interactionLabel, interactionClass }: { load:Load; onOpen:()=>void; onOffer:()=>void; interactionLabel?:string; interactionClass?:string }) {
  const commission = Math.round(load.price * 0.05);
  return <Card hoverable>
    <CardBody className="p-4">
      <div className="text-center pb-2">
        <b className="block text-2xl font-black text-gray-950 leading-9">{money(load.price)} تومان</b>
      </div>

      {interactionLabel && (
        <div className={`mt-1 mb-3 rounded-xl border px-3 py-2 text-center text-sm font-black ${interactionClass || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          {interactionLabel}
        </div>
      )}

      <div className="px-1 pt-2 pb-6">
        <div className="relative mx-auto w-[12.5rem] h-8" dir="ltr">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center" aria-label="قیمت کم">
            <CircleDollarSign className="w-5 h-5 text-primary-200" strokeWidth={2.2} aria-hidden="true"/>
          </div>
          <div className="absolute left-7 right-7 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-primary-200 via-primary-400 to-primary-700">
            <span className="absolute top-1/2 left-[38%] -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-primary-700 shadow-sm" aria-hidden="true"/>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6" aria-label="قیمت زیاد">
            <CircleDollarSign className="absolute inset-0 w-6 h-6 text-primary-700" strokeWidth={2.4} aria-hidden="true"/>
            <Coins className="absolute left-0.5 top-2.5 w-3.5 h-3.5 text-primary-500" strokeWidth={2.2} aria-hidden="true"/>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 py-7 mt-4 mb-16 border-y border-gray-100" dir="rtl">
        <div className="flex-1 min-w-0 text-center">
          <div className="flex justify-center mb-2 w-full"><Target className="w-6 h-6 text-primary-600 shrink-0" aria-hidden="true"/></div>
          <b className="block min-w-0 text-xl font-black leading-8 truncate">{load.from}</b>
          <span className="block text-xs font-bold text-gray-400 mt-0.5">استان {cityProvinceName(load.from)}</span>
        </div>
        <div className="w-28 relative flex items-center justify-center self-center">
          <div className="w-full border-t-2 border-dashed border-primary-300"/>
          <div className="absolute flex flex-col items-center bg-white px-1 -top-4">
            <Route className="w-5 h-5 text-primary-600" aria-hidden="true"/>
            <span className="text-xs font-black text-primary-800 mt-0.5">{fa(load.routeDistance)} کیلومتر</span>
          </div>
        </div>
        <div className="flex-1 min-w-0 text-center">
          <div className="flex justify-center mb-2 w-full"><MapPin className="w-6 h-6 text-primary-600 shrink-0" aria-hidden="true"/></div>
          <b className="block min-w-0 text-xl font-black leading-8 truncate">{load.to}</b>
          <span className="block text-xs font-bold text-gray-400 mt-0.5">استان {cityProvinceName(load.to)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-0">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"><Package className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/><b className="block text-xl font-black mt-1">{load.type}</b></div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"><WeightIcon className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/><b className="block text-xl font-black mt-1">{fa(load.weight)} kg</b></div>
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center"><CircleDollarSign className="w-5 h-5 mx-auto text-primary-600" aria-hidden="true"/><b className="block text-xl font-black mt-1">کمیسیون براه</b><span className="block text-base font-bold text-gray-500 mt-0.5">{money(commission)} تومان</span></div>
      </div>

      <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex items-center gap-2 mb-1.5"><FileText className="w-5 h-5 text-primary-600" aria-hidden="true"/><span className="text-xl font-black text-gray-700">توضیحات بار</span></div>
        <p className="text-xl leading-8 font-bold text-gray-700 text-right">{load.description}</p>
      </div>
      <div className="mt-3">
        <Button size="full" onClick={onOpen} className="h-14 text-base font-black bg-primary-500 hover:bg-primary-600 text-white border-primary-500">
          <Truck className="w-5 h-5 ml-2" aria-hidden="true"/> {interactionLabel ? 'تماس گرفته‌اید' : 'درخواست برای حمل بار'}
        </Button>
      </div>
    </CardBody>
  </Card>;
}
function Empty({ title, text, action }: {title:string;text:string;action?:()=>void}) {
  return <div className="py-14 text-center"><Package className="w-10 h-10 mx-auto text-gray-300"/><h3 className="font-black mt-3">{title}</h3><p className="text-sm text-gray-400 mt-2">{text}</p>{action && <Button size="sm" variant="outline" className="mt-5" onClick={action}>تلاش دوباره</Button>}</div>;
}

export function MainApp() {
  const { profile, session, signOut } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const [pressedHomeCard, setPressedHomeCard] = useState<string | null>(null);
  const [loads, setLoads] = useState<Load[]>([...seedLoads, ...searchOnlyLoads]);
  const [selected, setSelected] = useState<Load|null>(null);
  const [origin, setOrigin] = useState('');
  const [originText, setOriginText] = useState('');
  const [originProvince, setOriginProvince] = useState('');
  const [originCounty, setOriginCounty] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [destinationProvince, setDestinationProvince] = useState('');
  const [destinationCounty, setDestinationCounty] = useState('');
  const [frequentRoute, setFrequentRoute] = useState<{from:string;to:string}|null>(null);
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [nearbyDestination, setNearbyDestination] = useState('');
  const [nearbyDestinationText, setNearbyDestinationText] = useState('');
  const [nearbyDestinationProvince, setNearbyDestinationProvince] = useState('');
  const [nearbyDestinationCounty, setNearbyDestinationCounty] = useState('');
  const [nearbyUserLocation, setNearbyUserLocation] = useState<GeoPoint | null>(null);
  const [nearbyLocationStatus, setNearbyLocationStatus] = useState<'idle'|'locating'|'ready'|'denied'>('idle');
  const [toast, setToast] = useState('');
  const [notifications, setNotifications] = useState(2);
  const [showMenu, setShowMenu] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [shipmentStage, setShipmentStage] = useState<'accepted'|'loading'|'in_transit'|'delivered'>('accepted');
  const [rating, setRating] = useState(0);
  const [ownerDriverRating, setOwnerDriverRating] = useState<number>(() => { const version = window.localStorage.getItem('bbberah_owner_driver_rating_seed_v2'); if (version !== '1') { window.localStorage.setItem('bbberah_owner_driver_rating_v1', '4.35'); window.localStorage.setItem('bbberah_owner_driver_rating_seed_v2', '1'); return 4.35; } const saved = window.localStorage.getItem('bbberah_owner_driver_rating_v1'); return saved === null ? 4.35 : Number(saved); });
  const [contactReport, setContactReport] = useState<null | 'agreed' | 'declined' | 'uncertain'>(null);
  const [pendingContactLoadId, setPendingContactLoadId] = useState<string | null>(() => window.localStorage.getItem('bbberah_pending_contact_load_v1'));
  const [declinedContactCounts, setDeclinedContactCounts] = useState<Record<string, number>>(() => { try { const v=JSON.parse(window.localStorage.getItem('bbberah_declined_contact_counts_v1') || '{}'); return v && typeof v==='object' ? v : {}; } catch { return {}; } });
  const contactCallStartedAt = useRef<number | null>(null);
  const [pendingContactReturn, setPendingContactReturn] = useState(false);
  const [agreedFollowupLoadId, setAgreedFollowupLoadId] = useState<string | null>(() => window.localStorage.getItem('bbberah_agreed_followup_load_v1'));
  const [driverScore, setDriverScore] = useState<number>(() => {
  const seededVersion = window.localStorage.getItem('bbberah_driver_score_seed_version_v1');
  if (seededVersion !== '2') {
    window.localStorage.setItem('bbberah_driver_score_v1', '200');
    window.localStorage.setItem('bbberah_driver_score_seed_version_v1', '2');
    return 200;
  }
  const saved = window.localStorage.getItem('bbberah_driver_score_v1');
  return saved === null ? 200 : Number(saved);
});
  const [walletBalance, setWalletBalance] = useState<number>(() => {
  const seededVersion = window.localStorage.getItem('bbberah_wallet_seed_version_v1');
  if (seededVersion !== '2') {
    window.localStorage.setItem('bbberah_wallet_balance_v1', '5000000');
    window.localStorage.setItem('bbberah_wallet_seed_version_v1', '2');
    return 5000000;
  }
  const saved = window.localStorage.getItem('bbberah_wallet_balance_v1');
  return saved === null ? 5000000 : Number(saved);
});
const [identityVerified, setIdentityVerified] = useState<boolean>(false);
const [identityPending, setIdentityPending] = useState<boolean>(() => window.localStorage.getItem('bbberah_identity_pending_v1') === 'true');
const [identityRejected, setIdentityRejected] = useState<boolean>(() => window.localStorage.getItem('bbberah_identity_rejected_v1') === 'true');
const [reportedLoadIds, setReportedLoadIds] = useState<string[]>(() => { try { const v=JSON.parse(window.localStorage.getItem('bbberah_reported_load_ids_v1') || '[]'); return Array.isArray(v) ? v.filter((x:any)=>typeof x==='string') : []; } catch { return []; } });
const [shipmentHistory, setShipmentHistory] = useState<Array<{loadId:string; outcome:'carried'|'withdrawn'; commission:number; scoreChange:number; at:number}>>(() => {
  try {
    const v = JSON.parse(window.localStorage.getItem('bbberah_shipment_history_v1') || '[]');
    return Array.isArray(v) ? v.filter((x:any) => x && typeof x.loadId === 'string' && (x.outcome === 'carried' || x.outcome === 'withdrawn')) : [];
  } catch { return []; }
});
const [contactHistory, setContactHistory] = useState<Array<{loadId:string; status:'agreed'|'declined'|'uncertain'|'carried'; at:number}>>(() => {
    window.localStorage.removeItem('bbberah_contact_history_v1');
    try {
      const v=JSON.parse(window.localStorage.getItem('bbberah_contact_history_v2') || '[]');
      if (!Array.isArray(v)) return [];
      const byLoad = new Map<string, {loadId:string; status:'agreed'|'declined'|'uncertain'|'carried'; at:number}>();
      v.filter((x:any) => x && typeof x.loadId === 'string').forEach((x:any) => {
        const prev = byLoad.get(x.loadId);
        if (!prev || Number(x.at) >= Number(prev.at)) byLoad.set(x.loadId, {loadId:x.loadId, status:x.status, at:Number(x.at)});
      });
      return Array.from(byLoad.values());
    } catch { return []; }
  });
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | 'cancel-offer'>(null);
  const [termsAccepted, setTermsAccepted] = useState(() => window.localStorage.getItem('bbberah_terms_accepted_v1') === '1');
  const [offerSuccess, setOfferSuccess] = useState(false);
  const [myOffers, setMyOffers] = useState<Array<{loadId:string; price:number; at:number; status:'pending'|'accepted'|'rejected'}>>(() => {
    try {
      const v=JSON.parse(window.localStorage.getItem('bbberah_my_offers_v1') || '[]');
      return Array.isArray(v) ? v.map((x:any) => ({...x, status:x?.status==='accepted'||x?.status==='rejected' ? x.status : 'pending'})) : [];
    } catch { return []; }
  });
  useEffect(() => { window.localStorage.setItem('bbberah_my_offers_v1', JSON.stringify(myOffers)); }, [myOffers]);
  useEffect(() => {
    window.localStorage.setItem('bbberah_terms_accepted_v1', termsAccepted ? '1' : '0');
  }, [termsAccepted]);
  useEffect(() => {
    if (agreedFollowupLoadId) window.localStorage.setItem('bbberah_agreed_followup_load_v1', agreedFollowupLoadId);
    else window.localStorage.removeItem('bbberah_agreed_followup_load_v1');
  }, [agreedFollowupLoadId]);
  useEffect(() => { window.localStorage.setItem('bbberah_driver_score_v1', String(driverScore)); }, [driverScore]);
  useEffect(() => { window.localStorage.setItem('bbberah_wallet_balance_v1', String(walletBalance)); }, [walletBalance]);
  useEffect(() => { window.localStorage.setItem('bbberah_shipment_history_v1', JSON.stringify(shipmentHistory)); }, [shipmentHistory]);
  useEffect(() => { window.localStorage.setItem('bbberah_owner_driver_rating_v1', String(ownerDriverRating)); }, [ownerDriverRating]);
useEffect(() => { window.localStorage.setItem('bbberah_contact_history_v2', JSON.stringify(contactHistory)); }, [contactHistory]);
  useEffect(() => { window.localStorage.setItem('bbberah_reported_load_ids_v1', JSON.stringify(reportedLoadIds)); }, [reportedLoadIds]);
  useEffect(() => {
    if (pendingContactLoadId) window.localStorage.setItem('bbberah_pending_contact_load_v1', pendingContactLoadId);
    else window.localStorage.removeItem('bbberah_pending_contact_load_v1');
  }, [pendingContactLoadId]);
  useEffect(() => {
    window.localStorage.setItem('bbberah_declined_contact_counts_v1', JSON.stringify(declinedContactCounts));
  }, [declinedContactCounts]);
  useEffect(() => {
    if (!pendingContactReturn) return;
    const returnFromCall = () => {
      const started = contactCallStartedAt.current;
      if (started && Date.now() - started < 800) return;
      if (document.visibilityState !== 'visible') return;
      setPendingContactReturn(false);
      contactCallStartedAt.current = null;
      go('calls');
    };
    window.addEventListener('pageshow', returnFromCall);
    document.addEventListener('visibilitychange', returnFromCall);
    window.addEventListener('focus', returnFromCall);
    return () => {
      window.removeEventListener('pageshow', returnFromCall);
      document.removeEventListener('visibilitychange', returnFromCall);
      window.removeEventListener('focus', returnFromCall);
    };
  }, [pendingContactReturn]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerDetailLoadId, setOfferDetailLoadId] = useState<string | null>(null);
  const [offerDetailDragY, setOfferDetailDragY] = useState(0);
  const offerDetailTouchStartY = useRef<number | null>(null);
  const [offerSlider, setOfferSlider] = useState(50);
  const [offerPercent, setOfferPercent] = useState(0);
  const offerTouchStartY = useRef<number | null>(null);
  const [offerDragY, setOfferDragY] = useState(0);
  useEffect(() => {
    if (!offerOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [offerOpen]);
  const [vehicleForm, setVehicleForm] = useState({type:'تریلی',usage:'',feature:'',plate:'',model:'',year:''});
  const [accountName, setAccountName] = useState(profile?.full_name || '');
  const [settlingCallLoadId, setSettlingCallLoadId] = useState<string | null>(null);
  const [shipmentRewardSummary, setShipmentRewardSummary] = useState<null | {scoreChange:number; commission:number; discount:number; walletBefore:number; walletAfter:number}>(null);

  const notify = (m:string) => { setToast(m); window.setTimeout(()=>setToast(''), 2600); };
  useEffect(() => {
    const state = window.history.state;
    if (!state?.bbberahPage) window.history.replaceState({ bbberahPage: page }, '', window.location.href.split('#')[0]);
    const onPopState = () => {
      const historyState = window.history.state;
      const next = historyState?.bbberahPage as Page | undefined;
      if (next) {
        if (next === 'origin-select') {
          setOrigin('');
          setOriginText('');
          setOriginProvince('');
          setOriginCounty('');
          setSearchSubmitted(false);
        }
        if (next === 'destination-select' || next === 'destination-all' || next === 'frequent-route') {
          setDestination('');
          setDestinationText('');
          setDestinationProvince('');
          setDestinationCounty('');
          setSearchSubmitted(false);
        }
        if (next === 'nearby-destination-select') {
          setNearbyDestination('');
          setNearbyDestinationText('');
          setNearbyDestinationProvince('');
          setNearbyDestinationCounty('');
        }
        if (next === 'nearby-results') {
          setNearbyDestination('');
          setNearbyDestinationText('');
          setNearbyDestinationProvince('');
          setNearbyDestinationCounty('');
        }
        if (next === 'search') {
          const returningToResults = historyState?.bbberahSearchResults === true;
          setSearchSubmitted(returningToResults);
          if (!returningToResults) {
            setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
            setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
            setFrequentRoute(null);
          }
        }
        setPage(next);
        setShowMenu(false);
        window.scrollTo({top:0,behavior:'smooth'});
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const go = (p:Page, preserveSearch = false) => {
    if (p === 'search' && !preserveSearch) {
      setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
      setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
      setFrequentRoute(null); setSearchSubmitted(false);
    }
    if (p === page) { setShowMenu(false); return; }
    window.history.pushState({ bbberahPage: p }, '', '#' + p);
    setPage(p);
    setShowMenu(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const replacePage = (p:Page) => {
    window.history.replaceState({ bbberahPage: p }, '', '#' + p);
    setPage(p);
    setShowMenu(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const goHome = () => {
    window.history.replaceState({ bbberahPage: 'home' }, '', '#home');
    setPage('home');
    setShowMenu(false);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const resetSearchFields = () => {
    setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
    setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
    setFrequentRoute(null);
    setSearchSubmitted(false);
  };
  const openSearchPage = () => {
    resetSearchFields();
    go('search');
  };
  const findCityLocation = (city:string) => {
    for (const province of iranLocations) for (const county of province.counties) if (county.cities.includes(city)) return { provinceId:String(province.id), countyId:String(county.id) };
    return null;
  };
  const cityCoordinates:Record<string,GeoPoint> = {
    'تهران':{lat:35.6892,lon:51.3890}, 'کرج':{lat:35.8400,lon:50.9391}, 'تبریز':{lat:38.0962,lon:46.2738},
    'قم':{lat:34.6416,lon:50.8746}, 'رشت':{lat:37.2808,lon:49.5832}, 'مشهد':{lat:36.2605,lon:59.6168},
    'اصفهان':{lat:32.6546,lon:51.6680}, 'شیراز':{lat:29.5918,lon:52.5837}, 'قزوین':{lat:36.2688,lon:50.0041},
    'اهواز':{lat:31.3183,lon:48.6706}, 'ساری':{lat:36.5659,lon:53.0588}, 'بندرعباس':{lat:27.1832,lon:56.2666},
    'قائمشهر':{lat:36.4638,lon:52.8615}, 'قائم شهر':{lat:36.4638,lon:52.8615}, 'شهر صنعتی البرز':{lat:36.2828,lon:50.0175}
  };
  const distanceKm = (a:GeoPoint,b:GeoPoint) => {
    const rad = (v:number) => v * Math.PI / 180;
    const dLat = rad(b.lat-a.lat), dLon = rad(b.lon-a.lon);
    const h = Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  };
  const requestNearbyLocation = () => {
    if (!navigator.geolocation) { setNearbyLocationStatus('denied'); return; }
    setNearbyLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      pos => { setNearbyUserLocation({lat:pos.coords.latitude,lon:pos.coords.longitude}); setNearbyLocationStatus('ready'); },
      () => { setNearbyUserLocation(null); setNearbyLocationStatus('denied'); },
      { enableHighAccuracy:true, timeout:10000, maximumAge:30000 }
    );
  };
  const filtered = useMemo(() => loads.filter(l => {
    if (l.status === 'delivered') return false;
    const ol = findCityLocation(l.from), dl = findCityLocation(l.to);
    const originMatch = origin === '__nearby__'
      ? !!nearbyUserLocation && !!cityCoordinates[l.from] && distanceKm(nearbyUserLocation, cityCoordinates[l.from]) <= 50
      : origin
        ? l.from === origin
        : !originProvince
          ? true
          : !!ol && ol.provinceId === originProvince && (!originCounty || ol.countyId === originCounty);
    const destinationMatch = destination === '__all__'
      ? true
      : destination === '__province__'
        ? !!dl && dl.provinceId === destinationProvince
        : destination
          ? l.to === destination
        : !destinationProvince
          ? true
          : !!dl && dl.provinceId === destinationProvince && (!destinationCounty || dl.countyId === destinationCounty);
    return originMatch && destinationMatch;
  }), [loads, origin, originProvince, originCounty, destination, destinationProvince, destinationCounty, nearbyUserLocation]);
  const title:Record<Page,string> = {
    home:'براه', search:'جستجوی بار', nearby:'اطراف من', calls:'تماس‌های من', profile:'حساب کاربری',
    account:'اطلاعات حساب', verification:'احراز هویت', vehicle:'خودروی من', 'vehicle-select':'نوع خودرو', wallet:'کیف پول', transactions:'تراکنش‌ها',
    support:'پشتیبانی', rules:'قوانین و مقررات', notifications:'اعلان‌ها', display:'تنظیمات ظاهری', 'cargo-detail':'جزئیات بار',
offers:'پیشنهادهای من', 'vehicle-loader':'ویژگی کاربری', 'trailer-select':'نوع کاربری را انتخاب کنید', 'flatbed-size':'ویژگی کاربری', report:'گزارش تخلف', shipment:'سفر جاری', 'origin-select':'انتخاب مبدأ', 'destination-select':'انتخاب مقصد', 'destination-all':'انتخاب شهر مقصد', 'frequent-route':'بارهای مسیر', 'contact-report':'نتیجه تماس', 'nearby-destination-select':'انتخاب مقصد', 'nearby-results':'اطراف من'
  };

  const openOfferDetail = (loadId:string) => {
    setOfferDetailLoadId(loadId);
    setOfferDetailDragY(0);
    window.history.pushState({ bbberahPage: page, bbberahOfferDetail: true }, '', window.location.href);
  };
  const closeOfferDetail = () => {
    if (window.history.state?.bbberahOfferDetail) {
      window.history.back();
    } else {
      setOfferDetailLoadId(null);
      setOfferDetailDragY(0);
    }
  };
  useEffect(() => {
    if (!offerDetailLoadId) return;
    const prevOverflow = document.body.style.overflow;
    const prevOverscroll = document.body.style.overscrollBehavior;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overscrollBehavior = 'none';
    const onOfferDetailBack = () => {
      setOfferDetailLoadId(null);
      setOfferDetailDragY(0);
    };
    window.addEventListener('popstate', onOfferDetailBack);
    return () => {
      window.removeEventListener('popstate', onOfferDetailBack);
      document.body.style.overflow = prevOverflow;
      document.body.style.overscrollBehavior = prevOverscroll;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.documentElement.style.overscrollBehavior = prevHtmlOverscroll;
    };
  }, [offerDetailLoadId]);

  const requestOffer = (load:Load) => {
    if (myOffers.some(o => o.loadId === load.id)) {
      notify('برای این بار قبلاً پیشنهاد ارسال شده است. امکان ارسال یا ویرایش دوباره وجود ندارد.');
      go('offers');
      return;
    }
    setSelected(load); setOfferPrice(String(load.price)); setOfferSlider(50); setOfferPercent(0); setOfferDragY(0); setOfferOpen(true); window.history.pushState({ bbberahPage: page, bbberahOffer: true }, '', window.location.href);
  };
  const updateOfferSlider = (clientX:number, element:HTMLElement) => {
    if (!selected) return;
    const rect = element.getBoundingClientRect();
    const minPrice = Math.max(0, selected.price * 0.8);
    const maxPrice = selected.price * 1.2;
    const rawPrice = minPrice + ((clientX - rect.left) / rect.width) * (maxPrice - minPrice);
    const steppedPrice = Math.max(0, Math.round(rawPrice / 50000) * 50000);
    const percent = selected.price ? ((steppedPrice / selected.price) - 1) * 100 : 0;
    const slider = maxPrice > minPrice ? ((steppedPrice - minPrice) / (maxPrice - minPrice)) * 100 : 50;
    setOfferPercent(Math.round(percent));
    setOfferSlider(Math.max(0, Math.min(100, slider)));
    setOfferPrice(String(steppedPrice));
  };
  const adjustOfferPrice = (delta:number) => {
    if (!selected) return;
    const current = Number(offerPrice.replace(/,/g,'')) || selected.price;
    const nextPrice = Math.max(0, Math.round((current + delta) / 50000) * 50000);
    const minPrice = Math.max(0, selected.price * 0.8);
    const maxPrice = selected.price * 1.2;
    const percent = selected.price ? ((nextPrice / selected.price) - 1) * 100 : 0;
    const slider = maxPrice > minPrice ? ((nextPrice - minPrice) / (maxPrice - minPrice)) * 100 : 50;
    setOfferPercent(Math.round(percent));
    setOfferSlider(Math.max(0, Math.min(100, slider)));
    setOfferPrice(String(nextPrice));
  };

  const submitOffer = () => {
    if (actionBusy) return;
    const n = Number(offerPrice.replace(/,/g,''));
    if (!termsAccepted) return notify('ابتدا قوانین و مقررات براه را مطالعه و تأیید کنید.');
    if (!session) return notify('برای ثبت پیشنهاد ابتدا به براه متصل شوید.');
    if (!Number.isFinite(n) || n < 0) return notify('مبلغ پیشنهاد نامعتبر است.');
    setActionBusy(true);
    setTimeout(()=>setActionBusy(false),500);
    if (selected && myOffers.some(o => o.loadId === selected.id)) {
      setOfferOpen(false); setOfferDragY(0);
      return notify('برای این بار قبلاً پیشنهاد ارسال شده است. امکان ارسال یا ویرایش دوباره وجود ندارد.');
    }
    if (selected) setMyOffers(prev => [...prev, { loadId: selected.id, price: n, at: Date.now(), status:'pending' }]);
    setOfferOpen(false); setOfferDragY(0); setOfferSuccess(true); notify('پیشنهاد شما با موفقیت ارسال شد.');
  };
  useEffect(() => {
    if (!offerOpen) return;
    const onOfferBack = () => {
      if (window.history.state?.bbberahOffer) return;
      setOfferOpen(false);
      setOfferDragY(0);
    };
    window.addEventListener('popstate', onOfferBack);
    return () => window.removeEventListener('popstate', onOfferBack);
  }, [offerOpen]);

  const Header = () => <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
    <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
      <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center" onClick={()=>setShowMenu(true)} aria-label="منو"><Menu className="w-5 h-5"/></button>
      <button onClick={()=>goHome()} className="font-black text-2xl tracking-tight text-primary-700">براه</button>
      <button onClick={()=>{setNotifications(0);go('notifications')}} className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center" aria-label="اعلان‌ها"><Bell className="w-5 h-5"/>{notifications>0&&<span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">{fa(notifications)}</span>}</button>
    </div>
  </header>;

  const BottomNav = () => <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur">
    <div className="max-w-lg mx-auto grid grid-cols-4 h-[72px]">
      {[
        ['home','خانه',Home],['search','جستجو',Search],['calls','تماس‌ها',PhoneCall],['profile','حساب',User]
      ].map(([p,l,I])=><button key={p as string} onClick={()=>p==='search' ? openSearchPage() : go(p as Page)} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${page===p?'text-primary-900 font-black':'text-gray-900 font-bold'}`}>{createElement(I as any,{className:"w-5 h-5"})}{String(l)}</button>)}
    </div>
  </nav>;

  const Drawer = () => showMenu ? <div className="fixed inset-0 z-50 bg-black/30" onClick={()=>setShowMenu(false)}>
    <aside className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-5 shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className="flex items-center justify-between mb-6"><div><b className="text-xl">{profile?.full_name || 'کاربر براه'}</b><span className="block text-xs text-gray-400 mt-1">{profile?.phone}</span></div><button onClick={()=>setShowMenu(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div>
      <div className="space-y-1">
        {[
          ['account','حساب کاربری',User],['vehicle','خودروی من',CarFront],['wallet','کیف پول',WalletCards],['offers','پیشنهادهای من',ReceiptText],['support','پشتیبانی',Headphones],['rules','قوانین و مقررات',FileText],['display','تنظیمات برنامه',Settings]
        ].map(([p,l,I])=><button key={p as string} onClick={()=>go(p as Page)} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50">{createElement(I as any,{className:"w-5 h-5 text-primary-600"})}<span className="flex-1 font-bold text-sm">{String(l)}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}
        <button onClick={()=>signOut()} className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right text-red-600 mt-3"><LogOut className="w-5 h-5"/><span className="font-bold text-sm">خروج از حساب کاربری</span></button>
      </div>
    </aside>
  </div> : null;

  const contactStatusLabel = {agreed:'توافق کردیم',declined:'توافق نکردیم',uncertain:'مشخص نیست',carried:'بار را حمل کردم'} as const;
  const getLoadInteraction = (loadId:string) => {
    const contact = contactHistory.some(item => item.loadId === loadId);
    const offer = myOffers.some(item => item.loadId === loadId);
    if (contact || offer) return { label:'تماس گرفته‌اید', cls:'border-primary-200 bg-primary-50 text-primary-700' };
    return null;
  };
  const contactStatusClass = {agreed:'text-emerald-700 bg-emerald-50',declined:'text-red-700 bg-red-50',uncertain:'text-amber-700 bg-amber-50',carried:'text-blue-700 bg-blue-50'} as const;

  const animateHomeCard = (id:string, action:()=>void) => {
    if (pressedHomeCard) return;
    setPressedHomeCard(id); navigator.vibrate?.(18);
    window.setTimeout(() => { setPressedHomeCard(null); action(); }, 320);
  };

  const HomePage = () => {
    const resolveUncertainContact = (item: typeof contactHistory[number], status:'agreed'|'declined') => {
      const load = loads.find(l=>l.id===item.loadId);
      if (!load) return;
      setContactHistory(prev=>prev.map(entry=>entry.loadId===item.loadId && entry.at===item.at ? {...entry,status,at:Date.now()} : entry));
      if (status==='agreed') {
        setPendingContactLoadId(null);
        setAgreedFollowupLoadId(load.id);
        notify('وضعیت تماس به «توافق کردیم» تغییر کرد. نتیجه نهایی حمل را بعد از انجام حمل ثبت کنید.');
      } else {
        setPendingContactLoadId(null);
        setDeclinedContactCounts(prev=>({...prev,[load.id]:(prev[load.id]||0)+1}));
        notify('وضعیت تماس به «توافق نکردیم» تغییر کرد.');
      }
    };
    return <><style>{`@keyframes brah-card-press { 0% { transform: scale(1); box-shadow: 0 4px 14px rgba(0,0,0,0.10); } 22% { transform: scale(1.025); box-shadow: 0 9px 22px rgba(37,99,235,0.18), 0 3px 8px rgba(0,0,0,0.08); } 48% { transform: scale(1.055); box-shadow: 0 15px 32px rgba(37,99,235,0.26), 0 4px 10px rgba(0,0,0,0.10); } 68% { transform: scale(1.035); box-shadow: 0 12px 27px rgba(37,99,235,0.22); } 84% { transform: scale(1.015); box-shadow: 0 8px 20px rgba(37,99,235,0.16); } 100% { transform: scale(1); box-shadow: 0 4px 14px rgba(0,0,0,0.10); } } @keyframes brah-marquee { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } } @keyframes brah-search-marquee { 0%, 34% { transform: translateX(-50%); } 66%, 100% { transform: translateX(0); } }`}</style><div className="grid grid-cols-2 gap-3 w-full">
      <button onClick={()=>animateHomeCard('search',openSearchPage)} className={`relative aspect-square w-full min-h-[190px] rounded-2xl bg-white border-2 border-black p-4 text-center flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[1.035] active:shadow-[0_12px_28px_rgba(37,99,235,0.24),0_3px_8px_rgba(0,0,0,0.10)] transition-[transform,box-shadow] duration-100 ease-out ${pressedHomeCard==='search' ? 'animate-[brah-card-press_320ms_cubic-bezier(0.22,1,0.36,1)]' : ''}`}>
        <Search className="absolute top-4 right-4 w-7 h-7 text-primary-600" aria-hidden="true"/>
        <div className="w-full text-center"><b className="block text-xl font-black text-gray-950">جستجوی بار</b><span className="absolute bottom-3 left-3 right-3 overflow-hidden whitespace-nowrap text-sm font-extrabold text-gray-900" dir="ltr"><span className="flex w-[200%] h-full" style={{animation:"brah-search-marquee 10s linear infinite"}}><span className="w-1/2 shrink-0 flex items-center justify-center" dir="rtl">مبدأ/مقصد را انتخاب کن</span><span aria-hidden="true" className="w-1/2 shrink-0 flex items-center justify-center" dir="rtl">مبدأ/مقصد را انتخاب کن</span></span></span></div>
      </button>
      <button onClick={()=>animateHomeCard('nearby',()=>{setNearbyDestination('');setNearbyDestinationText('');setNearbyDestinationProvince('');setNearbyDestinationCounty('');requestNearbyLocation();go('nearby-destination-select')})} className={`relative aspect-square w-full min-h-[190px] rounded-2xl bg-white border-2 border-black p-4 text-center flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.94] active:shadow-[inset_0_3px_7px_rgba(0,0,0,0.14)] transition-transform duration-100 ease-out ${pressedHomeCard==='nearby' ? 'animate-[brah-card-press_320ms_cubic-bezier(0.22,1,0.36,1)]' : ''}`}>
        <Navigation className="absolute top-4 right-4 w-7 h-7 text-primary-600" aria-hidden="true"/>
        <div className="w-full text-center"><b className="block text-xl font-black text-gray-950">اطراف من</b><span className="absolute bottom-3 left-3 right-3 overflow-hidden whitespace-nowrap text-sm font-extrabold text-gray-900" dir="ltr"><span className="flex w-[200%] h-full" style={{animation:"brah-search-marquee 8s linear infinite"}}><span className="w-1/2 shrink-0 flex items-center justify-center" dir="rtl">بارهای نزدیک را ببین</span><span aria-hidden="true" className="w-1/2 shrink-0 flex items-center justify-center" dir="rtl">بارهای نزدیک را ببین</span></span></span></div>
      </button>
      <button onClick={()=>animateHomeCard('offers',()=>go('offers'))} className={`relative aspect-square w-full min-h-[190px] rounded-2xl bg-white border-2 border-black p-4 text-center flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.94] active:shadow-[inset_0_3px_7px_rgba(0,0,0,0.14)] transition-transform duration-100 ease-out ${pressedHomeCard==='offers' ? 'animate-[brah-card-press_320ms_cubic-bezier(0.22,1,0.36,1)]' : ''}`}>
        <ReceiptText className="absolute top-4 right-4 w-7 h-7 text-primary-600" aria-hidden="true"/>
        <div className="w-full text-center"><b className="block text-xl font-black text-gray-950">پیشنهادهای من</b><span className="absolute bottom-3 left-3 right-3 overflow-hidden whitespace-nowrap text-sm font-extrabold text-gray-900" dir="ltr"><span className="inline-flex min-w-max" style={{animation:"brah-marquee 7s linear infinite"}}><span dir="rtl">پیشنهادهای ارسال‌شده را پیگیری کن</span><span aria-hidden="true" className="mx-10" dir="rtl">پیشنهادهای ارسال‌شده را پیگیری کن</span></span></span></div>
      </button>
      <button type="button" onClick={()=>animateHomeCard('calls',()=>go('calls'))} className={`relative aspect-square w-full min-h-[190px] rounded-2xl bg-white border-2 border-black p-4 text-center flex flex-col items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.94] active:shadow-[inset_0_3px_7px_rgba(0,0,0,0.14)] transition-transform duration-100 ease-out ${pressedHomeCard==='calls' ? 'animate-[brah-card-press_320ms_cubic-bezier(0.22,1,0.36,1)]' : ''}`}>
        <PhoneCall className="absolute top-4 right-4 w-7 h-7 text-primary-600" aria-hidden="true"/>
        <div className="w-full text-center"><b className="block text-xl font-black text-gray-950">تماس‌ها و وضعیت‌ها</b><span className="absolute bottom-3 left-3 right-3 overflow-hidden whitespace-nowrap text-sm font-extrabold text-gray-900" dir="ltr"><span className="inline-flex min-w-max" style={{animation:"brah-marquee 7s linear infinite"}}><span dir="rtl">سوابق تماس‌های ثبت‌شده و وضعیت آن‌ها</span><span aria-hidden="true" className="mx-10" dir="rtl">سوابق تماس‌های ثبت‌شده و وضعیت آن‌ها</span></span></span></div>
      </button>
    </div></>;
  };

  const NearbyResultsPage = () => {
    const nearbyFiltered = loads.filter(l => {
      if (l.status === 'delivered') return false;
      if (nearbyLocationStatus !== 'ready' || !nearbyUserLocation || !cityCoordinates[l.from]) return false;
      if (distanceKm(nearbyUserLocation, cityCoordinates[l.from]) > 50) return false;
      if (nearbyDestination === '__all__') return true;
      const dl = findCityLocation(l.to);
      if (nearbyDestination === '__province__') return !!dl && dl.provinceId === nearbyDestinationProvince;
      if (nearbyDestination) return l.to === nearbyDestination;
      if (!nearbyDestinationProvince) return true;
      return !!dl && dl.provinceId === nearbyDestinationProvince && (!nearbyDestinationCounty || dl.countyId === nearbyDestinationCounty);
    });
    return nearbyFiltered.length ? (
      <div className="space-y-3">
        {nearbyFiltered.map(l=>{const interaction=getLoadInteraction(l.id); return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)} interactionLabel={interaction?.label} interactionClass={interaction?.cls}/>;})}
      </div>
    ) : (
      <Card><CardBody><Empty title="بار مرتبط پیدا نشد" text="برای اطراف این مقصد هنوز باری ثبت نشده است."/></CardBody></Card>
    );
  };

  const SearchPage = () => {
    const runSearch = () => {
      const allDestinationsMode = destinationText === 'همه شهرها';
      if (!originText || (!destinationText && !allDestinationsMode)) return notify('لطفاً مبدأ/مقصد را انتخاب کن.');
      if (!origin) setOrigin(originText);
      if (!destination && destinationText && !allDestinationsMode) setDestination(destinationText);
      // Keep the current search-selection entry, then add one history step for results.
      // Back from results returns to the empty search-selection page; the next Back goes Home.
      window.history.pushState({ bbberahPage: 'search', bbberahSearchResults: true }, '', '#search-results');
      setSearchSubmitted(true);
    };
    const clearAll = () => {
      setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
      setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
      setSearchSubmitted(false);
    };

    if (searchSubmitted) {
      return filtered.length ? (
        <div className="space-y-3">
          {filtered.map(l=>{const interaction=getLoadInteraction(l.id); return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)} interactionLabel={interaction?.label} interactionClass={interaction?.cls}/>;})}
        </div>
      ) : (
        <Card><CardBody><Empty title="بار مرتبط پیدا نشد" text="برای این مسیر هنوز باری ثبت نشده است." action={clearAll}/></CardBody></Card>
      );
    }

    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="flex items-center gap-2 px-1"><Search className="w-5 h-5 text-primary-700" aria-hidden="true"/><h2 className="font-black text-lg text-gray-900">جستجوی بار</h2></div>
        <button onClick={()=>{setOrigin('');setOriginText('');setOriginProvince('');setOriginCounty('');replacePage('origin-select');}} className="w-full mt-5 mb-3 rounded-2xl border border-black bg-white p-4 text-right active:bg-gray-50">
          <span className="block text-xs font-bold text-gray-400 mb-1">مبدأ</span>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary-600 shrink-0"/><span className={originText ? 'text-gray-900 font-bold' : 'text-gray-400'}>{originText || 'مبدأ را انتخاب کنید'}</span><ChevronLeft className="w-4 h-4 text-gray-300 mr-auto"/></div>
        </button>
        <div className="border-t border-gray-100 my-6"/>
        <button onClick={()=>{setDestination('');setDestinationText('');setDestinationProvince('');setDestinationCounty('');replacePage('destination-select');}} className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-right active:bg-gray-50">
          <span className="block text-xs font-bold text-gray-400 mb-1">مقصد</span>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary-600 shrink-0"/><span className={destinationText ? 'text-gray-900 font-bold' : 'text-gray-400'}>{destinationText || 'مقصد را انتخاب کنید'}</span><ChevronLeft className="w-4 h-4 text-gray-300 mr-auto"/></div>
        </button>
      </CardBody></Card>
      <Button size="full" className="mt-6 h-14 text-base font-black shadow-lg shadow-primary-100" onClick={runSearch}><Search className="w-5 h-5 ml-2"/> جستجوی بار</Button>
      <Card><CardBody className="p-4">
        <div className="flex items-center justify-between mb-3"><h3 className="font-black">سه مسیر پرتکرار</h3><span className="text-[11px] text-gray-400">انتخاب سریع</span></div>
        <div className="space-y-2">{frequentRoutes.map(route=><button type="button" key={route.from+'-'+route.to} onClick={()=>{
          const fromLocation=findCityLocation(route.from); const toLocation=findCityLocation(route.to);
          setOrigin(route.from); setOriginText(route.from); setOriginProvince(fromLocation?.provinceId || ''); setOriginCounty(fromLocation?.countyId || '');
          setDestination(route.to); setDestinationText(route.to); setDestinationProvince(toLocation?.provinceId || ''); setDestinationCounty(toLocation?.countyId || '');
          setFrequentRoute({from:route.from,to:route.to}); go('frequent-route');
        }} className="w-full rounded-xl border border-gray-100 bg-gray-50 p-3 flex items-center justify-between text-right"><span className="font-bold text-sm">{route.from} <span className="text-gray-400 mx-1">←</span> {route.to}</span><ChevronLeft className="w-4 h-4 text-gray-300"/></button>)}</div>
      </CardBody></Card>
    </div>;
  };

  const FrequentRoutePage = () => {
    const routeLoads = frequentRoute
      ? loads.filter(l => !l.id.startsWith('s') && l.status !== 'delivered' && l.from === frequentRoute.from && l.to === frequentRoute.to)
      : [];
    return routeLoads.length ? (
      <div className="space-y-3">
        {routeLoads.map(l=>{const interaction=getLoadInteraction(l.id); return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)} interactionLabel={interaction?.label} interactionClass={interaction?.cls}/>;})}
      </div>
    ) : (
      <Card><CardBody><Empty title="بار مرتبط پیدا نشد" text="برای این مسیر هنوز باری ثبت نشده است."/></CardBody></Card>
    );
  };

  const LocationSelectPage = ({ mode }: { mode:'origin'|'destination'|'nearby-destination' }) => {
    const isOrigin = mode === 'origin';
    const isNearby = mode === 'nearby-destination';
    const provinceId = isOrigin ? originProvince : isNearby ? nearbyDestinationProvince : destinationProvince;
    const setProvince = isOrigin ? setOriginProvince : isNearby ? setNearbyDestinationProvince : setDestinationProvince;
    const setCounty = isOrigin ? setOriginCounty : isNearby ? setNearbyDestinationCounty : setDestinationCounty;
    const setCity = isOrigin ? setOrigin : isNearby ? setNearbyDestination : setDestination;
    const setText = isOrigin ? setOriginText : isNearby ? setNearbyDestinationText : setDestinationText;
    const provinceData = iranLocations.find(p => String(p.id) === provinceId);
    const [query, setQuery] = useState('');
    const normalizeSearch = (value:string) => value
      .normalize('NFKC')
      .trim()
      .toLocaleLowerCase('fa-IR')
      .replace(/[يى]/g,'ی')
      .replace(/ك/g,'ک')
      .replace(/[ةۀ]/g,'ه')
      .replace(/[إأآ]/g,'ا')
      .replace(/ؤ/g,'و')
      .replace(/[\u200c\u200f\u202a-\u202e]/g,'')
      .replace(/[ًٌٍَُِّْـ]/g,'')
      .replace(/\s+/g,'');
    const normalized = normalizeSearch(query).replace(/^شهرستان/, '');
    const visibleProvinces = iranLocations
      .filter(p => !normalized || normalizeSearch(p.name).includes(normalized))
      .sort((a,b) => a.name.localeCompare(b.name, 'fa'));
    const allDestinationCities = iranLocations.flatMap(p => p.counties.flatMap(c => c.cities.map(city => ({ city, countyId:String(c.id), countyName:c.name, provinceId:String(p.id), provinceName:p.name }))));
    const provinceCities = provinceData ? provinceData.counties.flatMap(c => c.cities.map(city => ({ city, countyId:String(c.id), countyName:c.name, provinceId:String(provinceData.id), provinceName:provinceData.name }))) : [];
    const selectedCountyId = isOrigin ? originCounty : isNearby ? nearbyDestinationCounty : destinationCounty;
    const selectedCounty = provinceData?.counties.find(c => String(c.id) === selectedCountyId);
    const selectedCountyCities = selectedCounty ? selectedCounty.cities.map(city => ({ city, countyId:String(selectedCounty.id), countyName:selectedCounty.name, provinceId:String(provinceData!.id), provinceName:provinceData!.name })) : [];
    const sourceCities = allDestinationCities;
    const filteredCities = sourceCities
      .filter(x => !normalized || normalizeSearch(x.city).slice(0, normalized.length) === normalized)
      .sort((a,b) => {
        const aExact = normalizeSearch(a.city) === normalized ? 0 : 1;
        const bExact = normalizeSearch(b.city) === normalized ? 0 : 1;
        return aExact - bExact;
      });
    const filteredCounties = iranLocations.flatMap(p => p.counties
      .filter(c => (!normalized || !provinceId || String(p.id) === provinceId) && (!normalized || normalizeSearch(c.name).startsWith(normalized)))
      .map(c => ({ countyId:String(c.id), countyName:c.name, provinceId:String(p.id), provinceName:p.name, cities:c.cities }))
    );
    const [cityLimit, setCityLimit] = useState(120);
    const visibleCities = filteredCities.slice(0, cityLimit);

    const openAllDestinationCities = () => {
      if (isNearby) {
        setNearbyDestinationProvince(''); setNearbyDestinationCounty(''); setNearbyDestination('__all__'); setNearbyDestinationText('همه شهرها');
        setQuery(''); setCityLimit(120); go('nearby-results');
      } else {
        setDestinationProvince(''); setDestinationCounty(''); setDestination('__all__'); setDestinationText('همه شهرها');
        setQuery(''); setCityLimit(120); setSearchSubmitted(false); replacePage('search');
      }
    };
    const chooseProvince = (id:string) => {
      const province = iranLocations.find(p => String(p.id) === id);
      setProvince(id); setCounty(''); setCity(''); setText(province?.name || ''); setQuery(''); setCityLimit(120);
      if (isOrigin) {
        setOriginProvince(id);
        setOriginCounty('');
        setOrigin('');
        setOriginText(province?.name || '');
        setSearchSubmitted(false);
        replacePage('search');
      } else if (isNearby) {
        setNearbyDestinationProvince(id);
        setNearbyDestinationCounty('');
        setNearbyDestination('__province__');
        setNearbyDestinationText(province?.name || '');
        go('nearby-results');
      } else {
        setDestinationProvince(id);
        setDestinationCounty('');
        setDestination('__province__');
        setDestinationText(province?.name || '');
        setSearchSubmitted(false);
        replacePage('search');
      }
    };
    const chooseCounty = (provinceId:string, countyId:string) => {
      setProvince(provinceId); setCounty(countyId); setCity(''); setText('');
      setQuery(''); setCityLimit(120);
    };
    const chooseCity = (city:string, countyId:string) => {
      const location = allDestinationCities.find(x => x.city === city && x.countyId === countyId);
      const provinceIdForCity = location?.provinceId || provinceId;
      if (isOrigin) {
        setOriginProvince(provinceIdForCity || '');
        setOriginCounty(countyId);
        setOrigin(city);
        setOriginText(city);
        setSearchSubmitted(false);
        replacePage('search');
      } else if (isNearby) {
        setNearbyDestinationProvince(provinceIdForCity || '');
        setNearbyDestinationCounty(countyId);
        setNearbyDestination(city);
        setNearbyDestinationText(city);
        setQuery('');
        setCityLimit(120);
        go('nearby-results');
      } else {
        setDestinationProvince(provinceIdForCity || '');
        setDestinationCounty(countyId);
        setDestination(city);
        setDestinationText(city);
        setQuery('');
        setCityLimit(120);
        setSearchSubmitted(false);
        replacePage('search');
      }
    };
    const chooseNearby = () => {
      if (!isOrigin) return;
      setOriginProvince('');
      setOriginCounty('');
      setOrigin('__nearby__');
      setOriginText('اطراف من');
      requestNearbyLocation();
      setSearchSubmitted(false);
      // Replace the selector entry instead of going back: popstate would clear the nearby origin.
      replacePage('search');
    };

    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={()=>{ if (isOrigin) { goHome(); } else if (isNearby) { setNearbyDestination(''); setNearbyDestinationText(''); setNearbyDestinationProvince(''); setNearbyDestinationCounty(''); goHome(); } else { setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty(''); goHome(); } }} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5"/></button>
          <div><h2 className="font-black text-lg">{isOrigin ? 'مبدأ را انتخاب کنید' : 'مقصد را انتخاب کنید'}</h2></div>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
          <input value={query} onChange={e=>{const value=e.target.value; setQuery(value); if(isNearby){ const q=normalizeSearch(value).replace(/^شهرستان/,''); if(q){ const exactProvince=iranLocations.find(p=>normalizeSearch(p.name)===q); if(exactProvince){ chooseProvince(String(exactProvince.id)); return; } const exactCity=allDestinationCities.find(x=>normalizeSearch(x.city)===q); if(exactCity){ chooseCity(exactCity.city, exactCity.countyId); return; } } }}} placeholder={isOrigin ? 'مثال تهران' : 'مثال یزد'} className="w-full rounded-2xl border-2 border-gray-400 bg-white pr-11 pl-4 py-4 outline-none focus:border-blue-700"/>
        </div>
        {isOrigin && <button type="button" onClick={chooseNearby} className="w-full mt-3 rounded-2xl bg-primary-100 text-primary-900 border border-primary-200 p-4 flex items-center justify-center gap-2 font-black active:scale-[0.99]">
          <Navigation className="w-5 h-5" />
          اطراف من
        </button>}
        {!isOrigin && <button type="button" onClick={openAllDestinationCities} className="w-full mt-3 rounded-2xl bg-primary-100 text-primary-900 border border-primary-200 p-4 flex items-center justify-center gap-2 font-black active:scale-[0.99]">
          <Globe2 className="w-5 h-5" />
          همه شهرها
        </button>}
        {!provinceData && !normalized && <div className="mt-5">
          <div className="space-y-2 max-h-[52vh] overflow-auto">{visibleProvinces.map(p=><button type="button" key={p.id} onClick={()=>chooseProvince(String(p.id))} className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"><span className="font-bold">{p.name}</span><MapPin className="w-4 h-4 text-black shrink-0" aria-hidden="true"/></button>)}</div>
        </div>}
        {normalized && <div className="mt-5">
          <div className="space-y-2 max-h-[52vh] overflow-auto">
            {visibleProvinces.map(p=><button type="button" key={"province-search-" + p.id} onClick={()=>chooseProvince(String(p.id))} className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"><span className="font-bold">{p.name}</span><MapPin className="w-4 h-4 text-black shrink-0" aria-hidden="true"/></button>)}
            {filteredCities.map(x=><button type="button" key={'city-' + x.countyId + '-' + x.city} onClick={()=>chooseCity(x.city,x.countyId)} className="w-full rounded-xl bg-gray-50 hover:bg-primary-50 p-3.5 flex items-center justify-between text-right"><span><b className="block text-base font-black leading-7">{x.city}</b><span className="block text-xs font-bold text-gray-400 mt-0.5">شهرستان {x.countyName}</span><span className="block text-[11px] font-bold text-gray-400 mt-0.5">استان {x.provinceName}</span></span><span className="text-[11px] text-gray-400">انتخاب شهر</span></button>)}
            {filteredCounties.map(x=><button type="button" key={'county-' + x.provinceId + '-' + x.countyId} onClick={()=>chooseCounty(x.provinceId,x.countyId)} className="w-full rounded-xl bg-primary-50 border border-primary-100 p-3.5 flex items-center justify-between text-right">
              <span><b className="block text-base font-black leading-7">شهرستان {x.countyName}</b><span className="block text-[11px] font-bold text-gray-400 mt-0.5">استان {x.provinceName}</span><span className="block text-[11px] font-bold text-primary-700 mt-1">{fa(x.cities.length)} شهر — انتخاب شهرستان</span></span><ChevronLeft className="w-4 h-4 text-primary-400"/>
            </button>)}
            {!visibleProvinces.length && !filteredCounties.length && !filteredCities.length && <Empty title="نتیجه‌ای پیدا نشد" text="نام شهر یا شهرستان را تغییر دهید."/>}
          </div>
        </div>}
      </CardBody></Card>
    </div>;
  };
  const AllDestinationCitiesPage = () => {
    const [query, setQuery] = useState('');
    const normalizeSearch = (value:string) => value.normalize('NFKC').trim().toLocaleLowerCase('fa-IR')
      .replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[ةۀ]/g,'ه').replace(/[إأآ]/g,'ا').replace(/ؤ/g,'و')
      .replace(/[\u200c\u200f\u202a-\u202e]/g,'').replace(/[ًٌٍَُِّْـ]/g,'').replace(/\s+/g,'');
    const normalized = normalizeSearch(query).replace(/^شهرستان/,'');
    const matches = (value:string) => !normalized || normalizeSearch(value).includes(normalized);
    const chooseCity = (city:string, countyId:string, provinceId:string) => {
      setDestinationProvince(provinceId); setDestinationCounty(countyId);
      setDestination(city); setDestinationText(city); setSearchSubmitted(false); replacePage('search');
    };
    const totalCities = iranLocations.reduce((sum,p)=>sum+p.counties.reduce((n,c)=>n+c.cities.length,0),0);
    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={()=>{setDestination('');setDestinationText('');setDestinationProvince('');setDestinationCounty('');setSearchSubmitted(false);goHome();}} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><ArrowLeft className="w-5 h-5"/></button>
          <div><h2 className="font-black text-lg">همه شهرها</h2><p className="text-xs text-gray-400 mt-1">{fa(iranLocations.length)} استان و {fa(totalCities)} شهر ایران</p></div>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو در همه استان‌ها و شهرها" className="w-full rounded-2xl border-2 border-gray-400 bg-white pr-11 pl-4 py-4 outline-none focus:border-blue-700"/>
        </div>
        <div className="mt-5 space-y-3 max-h-[68vh] overflow-auto">
          {iranLocations.map(province => {
            const provinceMatches = matches(province.name);
            const counties = province.counties.map(county => ({...county,cities:county.cities.filter(city => provinceMatches || matches(county.name) || matches(city))})).filter(county => provinceMatches || matches(county.name) || county.cities.length);
            if (normalized && !provinceMatches && !counties.length) return null;
            return <div key={province.id} className="rounded-2xl border border-gray-100 bg-gray-50 overflow-hidden">
              <div className="px-4 py-3 bg-primary-50 border-b border-primary-100"><b className="block text-base font-black">{province.name}</b><span className="text-[11px] text-gray-500">{fa(province.counties.length)} شهرستان</span></div>
              <div className="p-2 space-y-2">{counties.map(county => <div key={county.id} className="rounded-xl bg-white border border-gray-100">
                <div className="px-3 py-2 border-b border-gray-50"><b className="text-sm">شهرستان {county.name}</b></div>
                <div className="p-2 grid grid-cols-1 gap-1.5">{county.cities.map(city => <button type="button" key={String(county.id)+'-'+city} onClick={()=>chooseCity(city,String(county.id),String(province.id))} className="w-full rounded-lg bg-gray-50 hover:bg-primary-50 px-3 py-2.5 flex items-center justify-between text-right"><span className="font-bold text-sm">{city}</span><span className="text-[10px] text-gray-400">انتخاب</span></button>)}</div>
              </div>)}</div>
            </div>;
          })}
          {normalized && !iranLocations.some(p => matches(p.name) || p.counties.some(c => matches(c.name) || c.cities.some(city=>matches(city)))) && <Empty title="نتیجه‌ای پیدا نشد" text="نام استان، شهرستان یا شهر را تغییر دهید."/>}
        </div>
      </CardBody></Card>
    </div>;
  };

const ProfilePage = () => <div className="space-y-3">
    <Card><CardBody className="p-5 space-y-4">
      <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">نام و نام خانوادگی</span><b className="text-sm">{profile?.full_name || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">کد ملی</span><b className="text-sm">{(profile as any)?.national_id || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-2 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">موبایل</span><b className="text-sm" dir="ltr">{profile?.phone || 'ثبت نشده'}</b></div>
      <button type="button" onClick={()=>go('verification')} className="w-full flex items-center justify-between py-2 border-b border-gray-100 text-right">
        <span className="text-sm font-bold text-gray-500">احراز هویت</span>
        <span className={identityVerified ? 'text-sm font-black text-emerald-600' : identityRejected ? 'text-sm font-black text-red-600' : identityPending ? 'text-sm font-black text-orange-600' : 'text-sm font-black text-primary-600'}>{identityVerified ? '✓ تایید شده' : identityRejected ? 'عدم تایید' : identityPending ? 'در انتظار تایید' : 'ارسال مدارک'}</span>
      </button>
      <div className="flex items-center justify-between py-2"><span className="text-sm font-bold text-gray-500">شماره هوشمند راننده</span><b className="text-sm">{(profile as any)?.driver_smart_number || 'ثبت نشده'}</b></div>
    </CardBody></Card>
  </div>;

  const normalizeNationalId = (value:string) => value.split('').map(ch => { const i='۰۱۲۳۴۵۶۷۸۹'.indexOf(ch); return i>=0 ? String(i) : ch; }).filter(ch => ch>='0' && ch<='9').join('').slice(0,10);

  const VerificationPage = () => {
    const [verificationStep, setVerificationStep] = useState<1 | 2 | 3>(1);
    const [nationalId, setNationalId] = useState('');
    const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
    const [licenseFacePhoto, setLicenseFacePhoto] = useState<File | null>(null);
    const [picker, setPicker] = useState<'license' | 'face' | null>(null);

    const chooseSource = (source: 'gallery' | 'camera') => {
      const input = document.getElementById(`verification-${picker}-${source}`) as HTMLInputElement | null;
      setPicker(null);
      input?.click();
    };

    const submitNationalId = () => {
      if (nationalId.length !== 10) return notify('لطفاً کد ملی ۱۰ رقمی خود را وارد کنید.');
      setVerificationStep(2);
    };

    const submitLicense = () => {
      if (!licensePhoto) return notify('لطفاً تصویر گواهینامه را انتخاب کنید.');
      setVerificationStep(3);
    };

    const submitVerification = () => {
      if (!licenseFacePhoto) return notify('لطفاً تصویر چهره همراه با گواهینامه را انتخاب کنید.');
      setIdentityPending(true);
      setIdentityRejected(false);
      window.localStorage.setItem('bbberah_identity_pending_v1', 'true');
      window.localStorage.removeItem('bbberah_identity_rejected_v1');
      notify('مدارک با موفقیت ارسال شد و منتظر تایید است.');
      go('account');
    };

    const sourceInputs = (type: 'license' | 'face') => (
      <>
        <input id={`verification-${type}-gallery`} type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0] || null;
          if (type === 'license') setLicensePhoto(file); else setLicenseFacePhoto(file);
        }}/>
        <input id={`verification-${type}-camera`} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {
          const file = e.target.files?.[0] || null;
          if (type === 'license') setLicensePhoto(file); else setLicenseFacePhoto(file);
        }}/>
      </>
    );

    const pickerMenu = picker && <div className="fixed inset-0 z-[80] bg-black/40 flex items-end justify-center" onClick={() => setPicker(null)}>
      <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-black text-lg mb-4">انتخاب تصویر</h3>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="rounded-2xl border border-gray-200 p-4 text-center font-black" onClick={() => chooseSource('gallery')}>از گالری</button>
          <button type="button" className="rounded-2xl border border-gray-200 p-4 text-center font-black" onClick={() => chooseSource('camera')}>از دوربین</button>
        </div>
      </div>
    </div>;

    if (identityVerified) return <Card><CardBody className="p-5 text-center"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500"/><h3 className="font-black text-lg mt-3 text-emerald-700">احراز هویت تایید شده</h3><p className="text-sm text-gray-500 mt-2">مدارک هویتی شما تایید شده است.</p></CardBody></Card>;


    if (identityVerified) return <Card><CardBody className="p-5 text-center"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500"/><h3 className="font-black text-lg mt-3 text-emerald-700">احراز هویت تایید شده</h3><p className="text-sm text-gray-500 mt-2">مدارک هویتی شما تایید شده است.</p></CardBody></Card>;

    if (identityRejected) return <Card><CardBody className="p-5 text-center space-y-4"><div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center"><XCircle className="w-8 h-8 text-red-500"/></div><h3 className="font-black text-lg text-red-600">احراز هویت تأیید نشد</h3><p className="text-sm text-gray-500 leading-7">مدارک ارسالی شما نیاز به اصلاح دارد. پس از اصلاح می‌توانید دوباره مدارک را ارسال کنید.</p><div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-right space-y-2"><div className="text-sm font-black text-red-700">دلیل عدم تأیید</div><div className="text-sm text-gray-600 leading-7">تصویر مدارک واضح نیست یا نیاز به بررسی و اصلاح دارد.</div></div><Button size="full" onClick={() => { setIdentityRejected(false); setIdentityPending(false); setVerificationStep(1); window.localStorage.removeItem('bbberah_identity_rejected_v1'); window.localStorage.removeItem('bbberah_identity_pending_v1'); }} className="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600">اصلاح و ارسال مجدد</Button></CardBody></Card>;

    if (identityPending) return <Card><CardBody className="p-5 text-center space-y-3"><Clock3 className="w-12 h-12 mx-auto text-orange-500"/><h3 className="font-black text-lg text-orange-600">در انتظار تایید احراز هویت</h3><p className="text-sm text-gray-500 leading-7">مدارک شما ارسال شده و تا زمان بررسی نهایی قابل ویرایش یا ارسال مجدد نیست.</p><div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 text-sm font-bold text-orange-700">لطفاً منتظر نتیجه بررسی بمانید.</div></CardBody></Card>;

    if (verificationStep === 1) return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">کد ملی خود را وارد کنید</h2><button type="button" onClick={()=>go("account")} className="text-sm font-black text-gray-500">بازگشت</button></div>
        <div>
          <input value={nationalId} onChange={e => setNationalId(normalizeNationalId(e.target.value))} inputMode="numeric" maxLength={10} placeholder="کد ملی" className="w-full rounded-2xl border border-gray-200 px-4 py-4 text-base font-black outline-none focus:border-primary-500" dir="ltr"/>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800 leading-7">
          مدارک شما محرمانه حفظ می‌شود و در هیچ جای اپلیکیشن نمایش داده نخواهد شد. این اطلاعات فقط برای افزایش اعتماد و اطمینان صاحب کالا دریافت می‌شود.
        </div>
        <Button size="full" onClick={submitNationalId} disabled={nationalId.length !== 10} className={nationalId.length === 10 ? '!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600' : '!bg-gray-300 !text-gray-500 !border-gray-300'}>ارسال</Button>
      </CardBody></Card>
    </div>;

    if (verificationStep === 2) return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">ارسال عکس گواهینامه</h2><button type="button" onClick={()=>setVerificationStep(1)} className="text-sm font-black text-gray-500">بازگشت</button></div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm font-black text-gray-400">نمونه تصویر گواهینامه</div>
          <p className="text-xs font-bold text-gray-500 mt-3 text-center">نمونه را فقط برای راهنمایی نحوه قرارگیری تصویر ببینید.</p>
        </div>
        <button type="button" onClick={() => setPicker('license')} className="w-full rounded-2xl border-2 border-primary-200 bg-primary-50 p-5 text-center font-black text-primary-700">
          {licensePhoto ? <img src={URL.createObjectURL(licensePhoto)} alt="تصویر گواهینامه" className="w-full h-48 object-contain rounded-xl" /> : <span>انتخاب تصویر</span>}
        </button>
        {sourceInputs('license')}
        {licensePhoto && <button type="button" onClick={() => setPicker('license')} className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm font-black text-gray-700">تغییر تصویر</button>}
        <Button size="full" onClick={submitLicense}>بعدی</Button>
      </CardBody></Card>
      {pickerMenu}
    </div>;

    return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">عکس گواهینامه همراه با چهره</h2><button type="button" onClick={()=>setVerificationStep(2)} className="text-sm font-black text-gray-500">بازگشت</button></div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm font-black text-gray-400">نمونه چهره با گواهینامه</div>
          <p className="text-xs font-bold text-gray-500 mt-3 text-center">چهره و گواهینامه را همزمان و واضح داخل کادر قرار دهید.</p>
        </div>
        <button type="button" onClick={() => setPicker('face')} className="w-full rounded-2xl border-2 border-primary-200 bg-primary-50 p-5 text-center font-black text-primary-700">
          {licenseFacePhoto ? <img src={URL.createObjectURL(licenseFacePhoto)} alt="چهره همراه گواهینامه" className="w-full h-48 object-contain rounded-xl" /> : <span>انتخاب تصویر</span>}
        </button>
        {sourceInputs('face')}
        {licenseFacePhoto && <button type="button" onClick={() => setPicker('face')} className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-sm font-black text-gray-700">تغییر تصویر</button>}
        <Button size="full" onClick={submitVerification}>ارسال و منتظر تایید</Button>
      </CardBody></Card>
      {pickerMenu}
    </div>;
  };

  const DetailPage = () => selected ? (() => { const commission = Math.round(selected.price * 0.05); return <div className="space-y-4">
    <Card><CardBody className="p-5"><h2 className="text-xl font-black">{selected.title}</h2><div className="flex items-center gap-4 mt-5" dir="rtl"><div className="flex-1 text-center"><b className="block text-lg">{selected.from}</b><span className="block text-sm font-bold text-gray-500 mt-1">استان {cityProvinceName(selected.from)}</span></div><div className="w-24 relative flex items-center justify-center"><div className="w-full border-t-2 border-dashed border-primary-300"/><div className="absolute flex flex-col items-center bg-white px-1"><Route className="w-5 h-5 text-primary-500 rotate-180"/><span className="text-xs font-black text-primary-700 mt-0.5">{fa(selected.routeDistance)} کیلومتر</span></div></div><div className="flex-1 text-center"><b className="block text-lg">{selected.to}</b><span className="block text-sm font-bold text-gray-500 mt-1">استان {cityProvinceName(selected.to)}</span></div></div></CardBody></Card>
    <Card><CardBody className="p-5 space-y-4"><h3 className="font-black">جزئیات بار</h3><div className="grid grid-cols-2 gap-3 text-sm">
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Package className="w-5 h-5 text-primary-600"/></div><span className="block text-gray-500 mt-2 text-base font-bold">نوع بار</span><b className="block mt-1 text-base font-black">{selected.type}</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center"><Percent className="w-4 h-4 text-primary-600"/></div><span className="block text-gray-500 mt-2 text-base font-bold">کمیسیون براه</span><b className="block mt-1 text-base font-black">{money(commission)} تومان</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center"><WeightIcon className="w-5 h-5 text-amber-600"/></div><span className="block text-gray-500 mt-2 text-base font-bold">وزن بار</span><b className="block mt-1 text-base font-black">{fa(selected.weight)} کیلو</b></div>
      <div className="bg-gray-50 rounded-xl p-3"><div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center"><CircleDollarSign className="w-5 h-5 text-emerald-600"/></div><span className="block text-gray-500 mt-2 text-base font-bold">کرایه اعلامی</span><b className="block mt-1 text-base font-black">{money(selected.price)} تومان</b></div>
    </div><div className="flex items-center gap-3 text-sm"><Clock3 className="w-5 h-5 text-primary-600"/><span>بارگیری: <b>{selected.pickup}</b></span></div><div className="flex items-center gap-3 text-sm"><MapPin className="w-5 h-5 text-primary-600"/><span>تحویل: <b>{selected.delivery}</b></span></div></CardBody></Card>
    <Card><CardBody className="p-5"><h3 className="font-black">توضیحات</h3><p className="text-sm text-gray-600 mt-2 leading-7">{selected.description}</p></CardBody></Card>
  </div> })() : <Empty title="بار انتخاب نشده" text="از جستجو یک بار را انتخاب کنید." action={()=>go('search')}/>;

  const saveContactResult = (loadId:string, status:'agreed'|'declined'|'uncertain'|'carried') => {
    const at = Date.now();
    setContactHistory(prev => {
      const next = [...prev.filter(item => item.loadId !== loadId), {loadId, status, at}];
      return next;
    });
    if (status === 'agreed' || status === 'carried') {
      setMyOffers(prev => prev.map(offer => offer.loadId === loadId ? {...offer, status:'accepted'} : offer));
    } else if (status === 'declined') {
      setMyOffers(prev => prev.map(offer => offer.loadId === loadId ? {...offer, status:'rejected'} : offer));
    }
  };

  const settleShipment = (load:Load, outcome:'carried'|'withdrawn') => {
    const existing = shipmentHistory.find(item => item.loadId === load.id);
    if (existing) {
      notify('این بار قبلاً تعیین تکلیف شده و امکان ثبت دوباره ندارد.');
      setAgreedFollowupLoadId(null);
      return;
    }
    const commission = Math.round(load.price * 0.05);
    const discount = Number((load as Load & {discount?:number}).discount || 0);
    const payableCommission = Math.max(0, commission - discount);
    const scoreChange = Math.max(1, Math.round(payableCommission / 50000));
    const at = Date.now();
    if (outcome === 'carried') {
      const walletBefore = walletBalance;
      const walletAfter = walletBefore - payableCommission;
      setWalletBalance(walletAfter);
      setDriverScore(prev => prev + scoreChange);
      setContactHistory(prev => [...prev, {loadId:load.id, status:'carried', at}]);
      setShipmentHistory(prev => [...prev, {loadId:load.id, outcome, commission:payableCommission, scoreChange, at}]);
      setAgreedFollowupLoadId(null);
      setShipmentRewardSummary({scoreChange, commission:payableCommission, discount, walletBefore, walletAfter});
      return;
    }
    setDriverScore(prev => prev - scoreChange);
    setContactHistory(prev => [...prev, {loadId:load.id, status:'declined', at}]);
    setShipmentHistory(prev => [...prev, {loadId:load.id, outcome, commission:0, scoreChange:-scoreChange, at}]);
    setAgreedFollowupLoadId(null);
  };

  const ViolationReportPage = () => {
    const reportLoad = selected;
    const reportOptions = [
      'اطلاعات بار با واقعیت مطابقت ندارد',
      'مبلغ یا شرایط بار متفاوت است',
      'رفتار نامناسب یا توهین‌آمیز',
      'مشکل در زمان یا محل بارگیری یا تحویل',
    ];
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const [reportText, setReportText] = useState('');
    if (!reportLoad) return <Empty title="بار انتخاب نشده" text="ابتدا بار موردنظر را انتخاب کنید." action={()=>go('calls')}/>;
    const submitReport = () => {
      if (!selectedReports.length && !reportText.trim()) return notify('لطفاً حداقل یک مورد را انتخاب یا توضیحات بیشتری وارد کنید.');
      setReportedLoadIds(prev => prev.includes(reportLoad.id) ? prev : [...prev, reportLoad.id]);
      notify('گزارش تخلف با موفقیت ثبت شد و برای بررسی ارسال گردید.');
      goHome();
    };
    return <div className="space-y-4">
      <Card><CardBody className="p-5">
        <div className="mt-4 space-y-2">
          {reportOptions.map(option => {
            const checked = selectedReports.includes(option);
            return <button key={option} type="button" onClick={()=>setSelectedReports(prev=>checked ? prev.filter(item=>item!==option) : [...prev, option])} className={`w-full rounded-2xl border p-3 text-right flex items-center gap-3 transition ${checked ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700'}`}>
              <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${checked ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white'}`}>{checked ? '✓' : ''}</span>
              <span className="text-sm font-bold">{option}</span>
            </button>;
          })}
        </div>
        <textarea value={reportText} onChange={e=>setReportText(e.target.value)} placeholder="توضیحات بیشتر (اختیاری)..." className="mt-4 w-full min-h-32 rounded-2xl border border-gray-200 p-4 text-sm font-bold outline-none focus:border-primary-500 resize-none" />
        <Button size="full" className="mt-3 bg-red-600 hover:bg-red-700 text-white border-red-600" onClick={submitReport}>ارسال گزارش</Button>
      </CardBody></Card>
    </div>;
  };

  const ContactReportPage = () => {
    const declinedCount = selected ? (declinedContactCounts[selected.id] || 0) : 0;
    const declinedBlocked = declinedCount >= 2;
    const submitContactReport = () => {
      if (!contactReport) return notify('لطفاً یکی از سه نتیجه تماس را انتخاب کنید.');
      if (!selected) return notify('بار موردنظر پیدا نشد.');
      if (contactReport === 'agreed') {
        setPendingContactLoadId(null);
        saveContactResult(selected.id, 'agreed');
        setAgreedFollowupLoadId(selected.id);
        notify('توافق ثبت شد. نتیجه نهایی حمل را بعد از انجام حمل ثبت کنید.');
        goHome();
        return;
      }
      if (contactReport === 'declined') {
        if (declinedBlocked) return notify('این نتیجه برای این بار دو بار ثبت شده و دیگر قابل انتخاب نیست.');
        const nextCount = declinedCount + 1;
        setDeclinedContactCounts(prev => ({...prev, [selected.id]: nextCount}));
        saveContactResult(selected.id, 'declined');
        setPendingContactLoadId(null);
        notify(nextCount >= 2 ? 'این بار دو بار بدون توافق ثبت شد؛ انتخاب دوباره این گزینه برای همین بار بسته شد.' : 'عدم توافق ثبت شد.');
        goHome();
        return;
      }
      setPendingContactLoadId(selected.id);
      saveContactResult(selected.id, 'uncertain');
      notify('این بار در وضعیت «مشخص نیست» باقی ماند و یادآوری آن در برنامه نمایش داده می‌شود.');
      goHome();
    };
    const options = [
      ['agreed','توافق کردیم','bg-emerald-50 border-emerald-200 text-emerald-800'],
      ['declined','توافق نکردیم','bg-red-50 border-red-200 text-red-800'],
      ['uncertain','مشخص نیست','bg-amber-50 border-amber-200 text-amber-800'],
    ] as const;
    return <div className="space-y-4">
      <Card><CardBody className="p-5">
        <div className="flex items-start gap-3">
          <PhoneCall className="w-6 h-6 text-primary-600 shrink-0 mt-1"/>
          <div><h2 className="text-xl font-black">نتیجه تماس را ثبت کنید</h2><p className="text-sm text-gray-500 mt-2 leading-6">بعد از تماس یکی از سه گزینه را انتخاب کنید.</p></div>
        </div>
        {selected && <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-100 p-4"><b className="block">{selected.title}</b><span className="text-sm text-gray-500 mt-1 block">{selected.from} ← {selected.to}</span></div>}
      </CardBody></Card>
      <Card><CardBody className="p-4">
        <div className="space-y-2">
          {options.map(([value,title,cls])=>{
            const blocked = value==='declined' && declinedBlocked;
            return <button key={value} type="button" disabled={blocked} onClick={()=>setContactReport(value)} className={`w-full text-right rounded-2xl border-2 p-4 transition ${contactReport===value?'border-primary-600 ring-2 ring-primary-100':'border-transparent'} ${cls} ${blocked?'opacity-45 cursor-not-allowed':''}`}>
              <span className="block font-black text-base">{title}</span>
              {value==='declined' && <span className="block text-xs font-black mt-2">{declinedCount}/۲ ثبت برای این بار</span>}
            </button>;
          })}
        </div>
        <Button size="full" className="mt-4 h-14 text-base font-black" onClick={submitContactReport}>ثبت نتیجه تماس</Button>
      </CardBody></Card>
    </div>;
  };

  const SimplePage = () => {
    if (page==='verification') return <VerificationPage/>;
    if (page==='nearby') return <div className="space-y-4">{loads.filter(l=>!l.id.startsWith('s') && l.status==='open' && l.distance<=50).sort((a,b)=>a.distance-b.distance).map(l=>{const interaction=getLoadInteraction(l.id); return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)} interactionLabel={interaction?.label} interactionClass={interaction?.cls}/>;})}</div>;
    if (page==='calls') return <div className="space-y-3">
      {contactHistory.length===0 ? <Card><CardBody className="p-5"><Empty title="هنوز تماسی ثبت نشده" text="بعد از تماس با صاحب بار، نتیجه تماس را مشخص کنید تا اینجا ثبت شود."/></CardBody></Card> : [...contactHistory].reverse().map((item,idx)=>{
        const load=loads.find(l=>l.id===item.loadId);
        if(!load) return null;
        const shipmentResult = shipmentHistory.find(h => h.loadId === load.id);
        const status = item.status==='carried'
          ? 'حمل انجام شد'
          : shipmentResult?.outcome==='withdrawn'
            ? 'از حمل بار منصرف شدید'
            : contactStatusLabel[item.status];
        const canResolve = item.status==='uncertain' && !shipmentResult;
        return <Card key={item.loadId+'-'+item.at+'-'+idx}><CardBody className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><b className="block">{load.title}</b><p className="text-xs text-gray-500 mt-1">{load.from} ← {load.to}</p><p className="text-[11px] text-gray-400 mt-1">{new Date(item.at).toLocaleDateString('fa-IR')}</p></div>
            <span className={'shrink-0 rounded-full px-3 py-1 text-xs font-black '+contactStatusClass[item.status]}>{status}</span>
          </div>
          {canResolve && <div className="grid grid-cols-2 gap-2 mt-4">
            <Button size="sm" className="w-full" onClick={()=>{setSelected(load);setContactReport('agreed');go('contact-report')}}>توافق شد</Button>
            <Button size="sm" variant="outline" className="w-full" onClick={()=>{setSelected(load);setContactReport('declined');go('contact-report')}}>عدم توافق</Button>
          </div>}
          {item.status==='agreed' && !shipmentResult && settlingCallLoadId !== load.id && <Button size="sm" className="w-full mt-3" onClick={()=>setSettlingCallLoadId(load.id)}>تعیین وضعیت حمل</Button>}
          {item.status==='agreed' && !shipmentResult && settlingCallLoadId === load.id && <div className="grid grid-cols-1 gap-2 mt-3">
            <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" onClick={()=>{setSelected(load);settleShipment(load,'carried');setSettlingCallLoadId(null);}}>بار را حمل کردم</Button>
            <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white border-red-600" onClick={()=>{settleShipment(load,'withdrawn');setSettlingCallLoadId(null);goHome();}}>از حمل بار منصرف شدم</Button>
          </div>}
          {item.status!=='uncertain' && <div className="grid grid-cols-1 gap-2 mt-3">
            <Button size="sm" className="w-full" variant="outline" onClick={()=>{setSelected(load);go('cargo-detail');}}>مشاهده جزئیات بار</Button>
            <a href={`tel:${load.phone}`} onClick={()=>{setSelected(load);contactCallStartedAt.current=Date.now();setPendingContactReturn(true);}} className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 flex items-center justify-center gap-2 text-sm font-black text-emerald-700"><Phone className="w-4 h-4"/> تماس</a>
            <Button size="sm" className="w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-200" variant="outline" disabled={reportedLoadIds.includes(load.id)} onClick={()=>{if(reportedLoadIds.includes(load.id)) return; setSelected(load);go('report');}}>{reportedLoadIds.includes(load.id) ? 'گزارش ثبت شده' : 'گزارش تخلف'}</Button>
          </div>}
        </CardBody></Card>;
      })}
    </div>;
    if (page==='notifications') return <div className="space-y-3">{['بار جدید در مسیر تهران به مشهد ثبت شد.','پیشنهاد آزمایشی شما در انتظار بررسی است.','اطلاعات حساب شما با موفقیت ذخیره شد.'].map((n,i)=><Card key={i}><CardBody className="p-4 flex gap-3"><Bell className="w-5 h-5 text-primary-600"/><div><b className="text-sm">{n}</b><p className="text-[11px] text-gray-400 mt-1">{i===0?'امروز':'دیروز'}</p></div></CardBody></Card>)}</div>;
    if (page==='offers') return <div className="space-y-3">
      {myOffers.length===0 ? <Card><CardBody className="p-5"><Empty title="هنوز پیشنهادی ارسال نشده" text="پیشنهادهای شما برای هر بار بعد از ارسال، جداگانه اینجا نمایش داده می‌شود."/></CardBody></Card> :
        [...myOffers].reverse().map((offer)=>{
          const load=loads.find(l=>l.id===offer.loadId); if(!load) return null;
          const offerDate=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(offer.at));
          const offerWeekday=new Intl.DateTimeFormat('fa-IR',{weekday:'long'}).format(new Date(offer.at));
          const statusBox=offer.status==='accepted'?'bg-emerald-50 text-emerald-700 border-emerald-200':offer.status==='rejected'?'bg-red-50 text-red-700 border-red-200':'bg-gray-100 text-gray-600 border-gray-200';
          const statusText=offer.status==='accepted'?'پذیرفته شد':offer.status==='rejected'?'رد شد':'در انتظار';
          return <Card key={offer.loadId}><CardBody className="p-4">
            <div className="flex items-center gap-3" dir="rtl">
              <div className="flex-1 min-w-0"><div className="flex items-center justify-center gap-2 text-lg font-black whitespace-nowrap"><span className="text-gray-950">⚫️{load.from}</span><span className="text-gray-400">---&gt;</span><span className="text-blue-600">🔵{load.to}</span></div><div className="mt-2 text-center text-xs font-bold text-gray-400">{offerDate} / {offerWeekday}</div></div>
              <button type="button" onClick={()=>openOfferDetail(offer.loadId)} aria-label="دیدن جزئیات" className="w-9 h-9 shrink-0 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center"><MoreVertical className="w-5 h-5 text-gray-500"/></button>
            </div>
            <div className="mt-4 flex justify-center"><span className={`rounded-xl border px-4 py-2 text-xs font-black ${statusBox}`}>{statusText}</span></div>
          </CardBody></Card>;
        })}
      {offerDetailLoadId && (()=>{const detailOffer=myOffers.find(o=>o.loadId===offerDetailLoadId), detailLoad=loads.find(l=>l.id===offerDetailLoadId); if(!detailOffer||!detailLoad)return null; return <div className="fixed inset-0 z-[80] bg-black/40 flex items-end justify-center overscroll-none" onClick={closeOfferDetail}><div className="w-full max-w-lg rounded-t-[28px] bg-white p-5 pb-7 select-none overscroll-none" onClick={e=>e.stopPropagation()} onPointerDown={e=>{const target=e.target as HTMLElement;if(target.closest('button,a'))return;e.currentTarget.setPointerCapture(e.pointerId);offerDetailTouchStartY.current=e.clientY;}} onPointerMove={e=>{const start=offerDetailTouchStartY.current;if(start===null)return;setOfferDetailDragY(Math.max(0,e.clientY-start));}} onPointerUp={e=>{const start=offerDetailTouchStartY.current;offerDetailTouchStartY.current=null;if(start!==null){const delta=e.clientY-start;if(delta>70){closeOfferDetail();}else setOfferDetailDragY(0);}}} onPointerCancel={()=>{offerDetailTouchStartY.current=null;setOfferDetailDragY(0);}} style={{transform:`translateY(${offerDetailDragY}px)`,transition:offerDetailTouchStartY.current===null?'transform 180ms ease-out':'none',touchAction:"none"}} dir="rtl"><div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-3 touch-none" aria-hidden="true"/><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black">جزئیات بار</h3><button type="button" onClick={closeOfferDetail} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div><div className="mt-4 rounded-2xl bg-gray-50 p-4"><div className="text-center text-lg font-black"><span>⚫️{detailLoad.from}</span><span className="mx-2 text-gray-400">---&gt;</span><span className="text-blue-600">🔵{detailLoad.to}</span></div><div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><WeightIcon className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">وزن بار</span><b className="block mt-1 text-sm font-black">{fa(detailLoad.weight)} کیلو</b></div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><Package className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">نوع بار</span><b className="block mt-1 text-sm font-black">{detailLoad.type}</b></div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><CircleDollarSign className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">کرایه</span><b className="block mt-1 text-sm font-black">{money(detailLoad.price)} تومان</b></div>
              <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><Route className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">مسافت</span><b className="block mt-1 text-sm font-black">{fa(detailLoad.routeDistance)} کیلومتر</b></div>
            </div><p className="mt-4 text-sm font-bold leading-7 text-gray-700">{detailLoad.description}</p></div></div></div>})()}
    </div>;
    if (page==='shipment') return <div className="space-y-4">
      {agreedFollowupLoadId ? (() => {
        const followupLoad = loads.find(l=>l.id===agreedFollowupLoadId);
        if (!followupLoad) return null;
        const commission = Math.round(followupLoad.price * 0.05);
        const scoreChange = Math.max(1, Math.round(commission / 50000));
        return <Card><CardBody className="p-5">
          <div className="flex items-center gap-3"><CheckCircle2 className="w-7 h-7 text-emerald-600"/><div><b>تعیین تکلیف حمل</b><p className="text-xs text-gray-400 mt-1">{followupLoad.from} به {followupLoad.to}</p></div></div>
          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-bold leading-7">برای این بار توافق ثبت شده است. پس از تعیین نتیجه، امتیاز و کمیسیون مطابق عملکرد شما ثبت می‌شود.</div>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button size="full" className="h-14 text-base font-black" onClick={()=>settleShipment(followupLoad,'carried')}>۱. بار را حمل کردم</Button>
            <Button size="full" variant="outline" className="h-14 text-base font-black" onClick={()=>settleShipment(followupLoad,'withdrawn')}>۲. از حمل بار منصرف شدم</Button>
          </div>
        </CardBody></Card>;
      })() : <Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><b>سفر جاری</b><p className="text-xs text-gray-400 mt-1">در حال حاضر حمل توافق‌شده‌ای برای تعیین تکلیف ندارید.</p></div></div></CardBody></Card>}
    </div>;
    if (page==='wallet') return <div className="space-y-4"><Card><CardBody className="p-6 text-center"><CircleDollarSign className="w-8 h-8 mx-auto text-primary-600"/><p className="text-sm text-gray-400 mt-3">موجودی کیف پول</p><b className={`text-3xl block mt-2 ${walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{money(walletBalance)} تومان</b><Button className="w-full mt-5" onClick={()=>notify('درگاه پرداخت در فاز دوم متصل می‌شود.')}>افزایش موجودی</Button></CardBody></Card></div>;
    if (page==='transactions') return <div className="space-y-3">
      {shipmentHistory.length===0 ? <Card><CardBody><Empty title="سابقه‌ای وجود ندارد" text="پس از تعیین تکلیف هر بار، سابقه کمیسیون و امتیاز اینجا ثبت می‌شود."/></CardBody></Card> : [...shipmentHistory].reverse().map((item,idx)=>{
        const load=loads.find(l=>l.id===item.loadId);
        return <Card key={item.loadId+'-'+item.at+'-'+idx}><CardBody className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0"><b className="block">{load?.title || 'بار ثبت‌شده'}</b><p className="text-xs text-gray-500 mt-1">{load ? load.from+' ← '+load.to : ''}</p><p className="text-[11px] text-gray-400 mt-1">{new Date(item.at).toLocaleString('fa-IR')}</p></div>
            <span className={item.outcome==='carried' ? 'shrink-0 rounded-full px-3 py-1 text-xs font-black text-emerald-700 bg-emerald-50' : 'shrink-0 rounded-full px-3 py-1 text-xs font-black text-red-700 bg-red-50'}>{item.outcome==='carried'?'حمل انجام شد':'انصراف از حمل'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-xl bg-gray-50 p-3 text-center"><span className="block text-xs text-gray-400">کمیسیون</span><b className="block mt-1">{item.commission ? money(item.commission)+' تومان' : '۰ تومان'}</b></div>
            <div className="rounded-xl bg-gray-50 p-3 text-center"><span className="block text-xs text-gray-400">تغییر امتیاز</span><b className="block mt-1">{item.scoreChange > 0 ? '+' : ''}{fa(item.scoreChange)}</b></div>
          </div>
          <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs font-bold text-gray-600">این بار یک‌بار تعیین تکلیف شده و ثبت مجدد کمیسیون یا امتیاز برای آن امکان‌پذیر نیست.</div>
        </CardBody></Card>;
      })}
    </div>;
    if (page==='vehicle-select') return <div className="space-y-4">
      <Card><CardBody className="p-5"><div className="flex items-center gap-3"><CarFront className="w-7 h-7 text-primary-600"/><div><h2 className="font-black text-lg">نوع خودروی خود را انتخاب کنید</h2><p className="text-xs text-gray-400 mt-1">خودروی موردنظر را انتخاب کنید.</p></div></div></CardBody></Card>
      <div className="space-y-3">
        {(['تریلی','جفت','تک','کامیونت','نیسان و وانت']).map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:label,usage:label==='تریلی'?v.usage:'',feature:''}));if(label==='تریلی'){go('trailer-select');}else{go('vehicle-loader');}}} className="w-full rounded-2xl border-2 border-black bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center"><VehicleIcon type={label}/></span><span className="font-black">{label}</span></span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='vehicle') return <div className="space-y-4">
      <Card><CardBody className="p-5"><div className="flex items-center gap-3"><CarFront className="w-7 h-7 text-primary-600"/><div><h2 className="font-black text-lg">خودروی من</h2><p className="text-xs text-gray-400 mt-1">هر بخش را لمس کنید تا همان بخش را ویرایش کنید.</p></div></div></CardBody></Card>
      <div className="space-y-3">
        <button type="button" onClick={()=>go('vehicle-select')} className="w-full rounded-2xl border-2 border-black bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">نوع خودرو</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.type || 'انتخاب نشده'}</span>
        </button>
        {vehicleForm.type==='تریلی' && <button type="button" onClick={()=>go('trailer-select')} className="w-full rounded-2xl border-2 border-black bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">نوع کاربری</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.usage || 'انتخاب نشده'}</span>
        </button>}
        <button type="button" onClick={()=>go('vehicle-loader')} className="w-full rounded-2xl border-2 border-black bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">ویژگی کاربری</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.feature || 'انتخاب نشده'}</span>
        </button>
      </div>
    </div>;
    if (page==='trailer-select') return <div className="space-y-4">
      <Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><h2 className="font-black text-lg">نوع تریلی را انتخاب کنید</h2><p className="text-xs text-gray-400 mt-1">نوع بارگیر تریلی خود را انتخاب کنید.</p></div></div></CardBody></Card>
      <div className="space-y-3">
        {(['چادری','بغلدار','تیغه','کفی','کمپرسی','تانکر','یخچالی']).map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:'تریلی',usage:label,feature:''}));if(label==='چادری'||label==='بغلدار'){go('vehicle-loader');}else if(label==='کفی'){go('flatbed-size');}else{go('vehicle');}}} className="w-full rounded-2xl border-2 border-black bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='flatbed-size') return <div className="space-y-4">
      <Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><h2 className="font-black text-lg">ابعاد بارگیر را انتخاب کنید</h2><p className="text-xs text-gray-400 mt-1">ابعاد کفی خود را انتخاب کنید.</p></div></div></CardBody></Card>
      <div className="space-y-3">
        {(['طول ۹','طول ۱۱','طول ۱۲.۲۰','طول ۱۲.۶۰','طول ۱۳.۶۰','کفی کشویی']).map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,feature:label}));go('vehicle');}} className="w-full rounded-2xl border-2 border-black bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
      </div>
    </div>;
    if (page==='vehicle-loader') return <Card><CardBody className="p-5 space-y-4"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><h2 className="font-black text-lg">ویژگی کاربری</h2><p className="text-xs text-gray-400 mt-1">ویژگی‌های کاربری خودروی خود را انتخاب کنید.</p></div></div><button type="button" onClick={()=>{setVehicleForm(v=>({...v,feature:'ثبت شد'}));go('vehicle');}} className="w-full rounded-2xl border-2 border-black bg-white p-4 text-right font-black shadow-[0_4px_14px_rgba(0,0,0,0.10)]">ثبت ویژگی کاربری</button></CardBody></Card>;
    if (page==='account') return <Card><CardBody className="p-5 space-y-1">
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">نام و نام خانوادگی</span><b className="text-sm">{profile?.full_name || accountName || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">کد ملی</span><b className="text-sm">{(profile as any)?.national_id || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">موبایل</span><b className="text-sm" dir="ltr">{profile?.phone || 'ثبت نشده'}</b></div>
      <button type="button" onClick={()=>go('verification')} className="w-full flex items-center justify-between py-4 border-b border-gray-100 text-right"><span className="text-sm font-bold text-gray-500">احراز هویت</span><span className={identityVerified ? 'text-sm font-black text-emerald-600' : identityPending ? 'text-sm font-black text-orange-500' : 'text-sm font-black text-primary-600'}>{identityVerified ? '✓ تایید شده' : identityPending ? 'در انتظار تایید' : 'ارسال مدارک'}</span></button>
      <div className="flex items-center justify-between py-4"><span className="text-sm font-bold text-gray-500">شماره هوشمند راننده</span><b className="text-sm">{(profile as any)?.driver_smart_number || 'ثبت نشده'}</b></div>
    </CardBody></Card>;
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
      {pendingContactLoadId && page!=='contact-report' && <button type="button" onClick={()=>{const load=loads.find(l=>l.id===pendingContactLoadId); if(load){setSelected(load);go('contact-report');}}} className="w-full mb-4 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-right text-amber-900 shadow-sm"><b className="block">⚠️ این بار هنوز تعیین تکلیف نشده است</b><span className="block text-xs font-bold mt-1">نتیجه تماس را ثبت کنید تا این یادآوری بسته شود.</span></button>}
      {page!=='home' && page!=='profile' && page!=='verification' && <button onClick={()=>{if(page==='search'){goHome();}else{window.history.back();}}} className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500"><ArrowLeft className="w-4 h-4"/> بازگشت</button>}
      {page==='home' ? <HomePage/> : page==='search' ? <SearchPage/> : page==='profile' ? <ProfilePage/> : page==='cargo-detail' ? <DetailPage/> : page==='verification' ? <VerificationPage/> : page==='trailer-select' ? <SimplePage/> : page==='report' ? <ViolationReportPage/> : page==='origin-select' ? <LocationSelectPage mode="origin"/> : page==='destination-select' ? <LocationSelectPage mode="destination"/> : page==='nearby-destination-select' ? <LocationSelectPage mode="nearby-destination"/> : page==='nearby-results' ? <NearbyResultsPage/> : page==='destination-all' ? <AllDestinationCitiesPage/> : page==='frequent-route' ? <FrequentRoutePage/> : page==='contact-report' ? <ContactReportPage/> : <SimplePage/>}
    </main>
    <BottomNav />
    <Drawer />
    <Toast message={toast} onClose={()=>setToast('')} />
    {shipmentRewardSummary && <div className="fixed inset-0 z-[75] bg-black/40 flex items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center"><Star className="w-6 h-6 text-emerald-600"/></div>
          <div><h3 className="font-black text-lg">امتیاز حمل ثبت شد</h3><p className="text-xs text-gray-500 mt-1">جزئیات نتیجه حمل</p></div>
        </div>
        <div className="mt-5 space-y-2 text-sm font-bold">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-gray-500">امتیاز دریافت‌شده</span><b className="text-emerald-700">+{fa(shipmentRewardSummary.scoreChange)} امتیاز</b></div>
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-gray-500">کسر از کیف پول</span><b>{money(shipmentRewardSummary.commission)} تومان</b></div>
          {shipmentRewardSummary.discount > 0 && <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3"><span className="text-gray-500">تخفیف</span><b className="text-emerald-700">{money(shipmentRewardSummary.discount)} تومان</b></div>}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3"><span className="text-gray-500">موجودی باقی‌مانده کیف پول</span><b>{money(shipmentRewardSummary.walletAfter)} تومان</b></div>
        </div>
        <Button className="w-full mt-5" onClick={()=>{setShipmentRewardSummary(null);goHome();}}>باشه</Button>
      </div>
    </div>}
    {confirmAction && <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-5"><div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"><h3 className="font-black text-lg">تأیید عملیات</h3><p className="text-sm text-gray-500 mt-2">{confirmAction==='cancel-offer'?'آیا می‌خواهید پیشنهاد انتخاب‌شده لغو شود؟':'آیا می‌خواهید این بار لغو شود؟ این عملیات در نسخه آزمایشی فقط وضعیت رابط را تغییر می‌دهد.'}</p><div className="grid grid-cols-2 gap-2 mt-5"><Button variant="outline" onClick={()=>setConfirmAction(null)}>انصراف</Button><Button onClick={()=>{setConfirmAction(null);setActionBusy(true);setTimeout(()=>{setActionBusy(false);notify('پیشنهاد لغو شد.');},500)}}>{actionBusy?'در حال انجام...':'تأیید'}</Button></div></div></div>}
    {page==='shipment' && shipmentStage==='delivered' && <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4"><div className="rounded-2xl bg-white border shadow-xl p-4"><b>سفر با موفقیت تحویل شد</b><p className="text-xs text-gray-500 mt-1">صاحب کالا امتیاز راننده را ثبت می‌کند.</p><div className="flex gap-2 mt-3" dir="ltr">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setOwnerDriverRating(n)} className={`text-3xl ${n<=ownerDriverRating?'text-amber-400':'text-gray-300'}`}>★</button>)}</div><Button className="w-full mt-3" onClick={()=>notify(ownerDriverRating?'امتیاز صاحب کالا ثبت شد.':'لطفاً امتیاز را انتخاب کنید.')}>ثبت امتیاز راننده</Button></div></div>}
    {offerOpen && selected && <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center overscroll-none" style={{touchAction:"none"}} onTouchMove={e=>e.preventDefault()} onWheel={e=>e.preventDefault()}><div className="w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-7 select-none overscroll-none" onTouchStart={e=>{const target=e.target as HTMLElement;if(target.closest('button,a,[role="slider"]'))return;offerTouchStartY.current=e.touches[0].clientY;}} onTouchMove={e=>{const start=offerTouchStartY.current;if(start===null)return;e.preventDefault();setOfferDragY(Math.max(0,e.touches[0].clientY-start));}} onTouchEnd={e=>{const start=offerTouchStartY.current;offerTouchStartY.current=null;if(start!==null){const delta=e.changedTouches[0].clientY-start;if(delta>70){setOfferOpen(false);setOfferDragY(0);}else setOfferDragY(0);}}} style={{transform:`translateY(${offerDragY}px)`,transition:offerTouchStartY.current===null?'transform 180ms ease-out':'none',touchAction:"none"}}> <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-3 touch-none" aria-hidden="true"/><div className="flex items-center justify-between"><h3 className="font-black text-lg">ثبت پیشنهاد</h3><button onClick={()=>setOfferOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div><p className="text-sm text-gray-500 mt-2">{selected.title}</p><div className="mt-4 rounded-2xl bg-gray-50 p-4"><div className="flex items-center justify-between"><span className="text-base font-bold text-gray-500">قیمت اعلامی</span><b className="text-xl font-black">{money(selected.price)} تومان</b></div></div><div className="mt-4"><label className="block text-base font-bold text-gray-700">قیمت پیشنهادی</label><div className="mt-2 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-center text-xl font-black text-gray-900" dir="ltr">{money(Number(offerPrice)||0)} تومان</div><div className="mt-4 px-1" dir="ltr">
  <div className="flex items-center gap-3">
    <button type="button" aria-label="کاهش ۵۰ هزار تومان" className="w-10 h-10 shrink-0 rounded-xl border border-gray-200 bg-gray-50 text-2xl font-black text-gray-700 flex items-center justify-center" onClick={()=>adjustOfferPrice(-50000)}>−</button>
    <div className="relative flex-1 h-10 flex items-center cursor-pointer touch-none select-none" role="slider" aria-label="تغییر قیمت پیشنهاد" aria-valuemin={0} aria-valuemax={100} aria-valuenow={offerSlider} tabIndex={-1}
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);updateOfferSlider(e.clientX,e.currentTarget);}}
      onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)) updateOfferSlider(e.clientX,e.currentTarget);}}
      onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);}}>
      <div className="absolute left-0 right-0 h-3 rounded-full bg-gray-200"/>
      <div className="absolute left-0 h-3 rounded-full bg-primary-500" style={{width:`${offerSlider}%`}}/>
      <div className="absolute top-1/2 w-7 h-7 rounded-full bg-white border-4 border-primary-600 shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{left:`${offerSlider}%`}}/>
    </div>
    <button type="button" aria-label="افزایش ۵۰ هزار تومان" className="w-10 h-10 shrink-0 rounded-xl border border-gray-200 bg-gray-50 text-2xl font-black text-gray-700 flex items-center justify-center" onClick={()=>adjustOfferPrice(50000)}>+</button>
  </div>
  
</div></div>{!termsAccepted && <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold"><label className="flex items-center gap-3"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} className="w-5 h-5 accent-primary-600"/><span>قوانین و مقررات را مطالعه کردم و می‌پذیرم.</span></label><button type="button" className="mt-2 text-blue-600 font-black underline underline-offset-2" onClick={()=>{setOfferOpen(false);setOfferDragY(0);go('rules');}}>مشاهده قوانین و مقررات</button></div>}<Button size="full" className="mt-4 h-14 text-base font-black" disabled={actionBusy} onClick={submitOffer}>{actionBusy?'در حال ثبت...':'ارسال پیشنهاد'}</Button></div></div>}
  </div>;
}