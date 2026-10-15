import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Bell, Car, CarFront, CheckCircle2, ChevronLeft, Clock3, Weight as WeightIcon, Percent, Eye, Store, CreditCard, HeartPulse,
  FileText, Headset, Home, LogOut, MapPin, Navigation, Package,
  Phone, PhoneCall, ReceiptText, Search, ShieldCheck,
  Truck, Container, BusFront, User, X, RefreshCw, Plus, Star, Route, CircleDollarSign, Coins, Target, Globe2, AlertTriangle, XCircle, Sun, Moon, Monitor, Info, Instagram, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { iranLocations } from '@/data/iranLocations';

type Page =
  | 'home' | 'search' | 'nearby' | 'calls' | 'profile' | 'account' | 'vehicle' | 'vehicle-dashboard' | 'vehicle-select'
  | 'wallet' | 'transactions' | 'support' | 'rules' | 'notifications' | 'display'
  | 'cargo-detail' | 'vehicle-loader' | 'trailer-select' | 'jooft-usage' | 'jooft-feature' | 'tak-usage' | 'tak-feature' | 'komionet-usage' | 'komionet-feature' | 'van-usage' | 'van-feature' | 'flatbed-size' | 'report' | 'offers' | 'verification' | 'shipment' | 'origin-select' | 'destination-select' | 'nearby-destination-select' | 'nearby-results' | 'destination-all' | 'frequent-route' | 'contact-report';

type LoadStatus = 'open' | 'reserved' | 'delivered';
type Load = {
  id: string; title: string; from: string; to: string; type: string; vehicle: string;
  weight: number; price: number; pickup: string; delivery: string; status: LoadStatus;
  distance: number; routeDistance: number; description: string; phone: string;
  publishedAt?: number | string; isUrgent?: boolean; isNew?: boolean;
  rubari?: boolean; barbari?: boolean; freeCall?: boolean; priceIndex?: number;
};

type GeoPoint = { lat:number; lon:number };
type VehicleForm = { type:string; usage:string; feature:string; plate:string; model:string; year:string };

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

const notificationItems = [
  { id:'new-load-tehran-mashhad', message:'بار جدید در مسیر تهران به مشهد ثبت شد.', date:'امروز' },
  { id:'offer-pending-review', message:'پیشنهاد آزمایشی شما در انتظار بررسی است.', date:'دیروز' },
  { id:'account-saved', message:'اطلاعات حساب شما با موفقیت ذخیره شد.', date:'دیروز' },
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
  return <div className="fixed inset-x-4 bottom-5 z-50 mx-auto max-w-lg rounded-lg bg-gray-900 px-4 py-3 text-sm font-bold text-white shadow-2xl flex items-center gap-3">
    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    <span className="flex-1">{message}</span>
    <button onClick={onClose} aria-label="بستن"><X className="w-4 h-4" /></button>
  </div>;
}

function LoadCard({ load, onOpen, onOffer }: { load:Load; onOpen:()=>void; onOffer:()=>void }) {
  const weightTons = load.weight / 1000;
  const formattedWeightTons = fa(Number.isInteger(weightTons) ? weightTons : weightTons.toFixed(1)).replace(".", "/");
  const publishedAt = load.publishedAt ? new Date(load.publishedAt) : null;
  const publishedTime = (() => {
    if (!publishedAt || Number.isNaN(publishedAt.getTime())) {
      return typeof load.publishedAt === 'string' && /قبل|دقیقه|ساعت/.test(load.publishedAt) ? load.publishedAt : '';
    }
    const minutes = Math.max(0, Math.floor((Date.now() - publishedAt.getTime()) / 60000));
    if (minutes < 8) return 'دقایقی قبل';
    if (minutes < 23) return 'یک ربع قبل';
    if (minutes < 50) return 'نیم ساعت قبل';
    if (minutes < 100) return 'یک ساعت قبل';
    if (minutes < 180) return '۲ ساعت قبل';
    const hours = Math.max(1, Math.floor(minutes / 60));
    return `${fa(hours)} ساعت قبل`;
  })();
  // Stable pseudo-random labels per load: they don't flicker when React re-renders.
  const labelSeed = Array.from(load.id).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  const showUrgent = load.isUrgent ?? (labelSeed % 4 === 0);
  const showNew = load.isNew ?? (labelSeed % 3 === 0);
  const hasFeatures = Boolean(load.rubari || load.barbari || load.freeCall);
  const hasPriceIndex = typeof load.priceIndex === 'number' && Number.isFinite(load.priceIndex);
  const priceIndex = hasPriceIndex ? Math.max(0, Math.min(100, load.priceIndex as number)) : 0;
  return <div className="w-full overflow-hidden rounded-md border border-gray-400 bg-white shadow-sm">
      <div className="flex min-h-11 items-center justify-between gap-2 border-b border-gray-300 bg-primary-50 px-3 py-2.5 text-base font-bold">
        <div className="flex min-w-0 items-center gap-1.5 text-gray-600">
          <Clock3 className="h-5 w-5 shrink-0" aria-hidden="true"/>
          <span>{publishedTime}</span>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          {showUrgent && <span className="rounded-md bg-red-50 px-2.5 py-1.5 text-base font-black text-red-700">فوری</span>}
          {showNew && <span className="rounded-md bg-emerald-50 px-2.5 py-1.5 text-base font-black text-emerald-700">جدید</span>}
        </div>
      </div>

      {hasFeatures && <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-4 gap-y-2 border-b border-gray-300 px-3 py-2 text-base font-bold text-gray-800">
        {load.rubari && <span className="inline-flex items-center gap-1"><Package className="h-5 w-5 text-primary-600" aria-hidden="true"/>روباری</span>}
        {load.barbari && <span className="inline-flex items-center gap-1"><Truck className="h-5 w-5 text-primary-600" aria-hidden="true"/>باربری</span>}
        {load.freeCall && <span className="inline-flex items-center gap-1"><PhoneCall className="h-4 w-4 text-primary-600" aria-hidden="true"/>تماس رایگان</span>}
      </div>}

      <div className="border-b border-gray-300 py-2 text-center">
        <div className="inline-flex max-w-full flex-col items-center">
          <b className="inline-block text-2xl font-black leading-8 text-gray-950">{money(load.price)} تومان</b>
          {hasPriceIndex && <div className="mt-3 w-full" aria-hidden="true">
            <div className="relative h-2 overflow-visible rounded-full bg-slate-100 shadow-inner">
              <div className="absolute inset-0 rounded-full bg-gradient-to-l from-primary-700 via-primary-500 to-sky-200" />
              <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary-700 shadow-[0_1px_5px_rgba(15,23,42,0.28)]" style={{right:`calc(${priceIndex}% - 8px)`}} />
            </div>
          </div>}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-300 px-2.5 py-2" dir="rtl">
        <div className="min-w-0 flex-1 text-center">
          <div className="mb-1 flex h-5 items-center justify-center" aria-label="مبدأ">
            <span className="relative block h-4 w-4 rounded-full border-2 border-primary-600 bg-primary-600">
              <span className="absolute left-1/2 top-1/2 h-[22px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600"/>
              <span className="absolute left-1/2 top-1/2 h-[3px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-600"/>
              <span className="absolute inset-[3px] z-10 rounded-full bg-white"/>
            </span>
          </div>
          <b className="block truncate text-xl font-extrabold leading-7">{load.from}</b>
          <span className="block text-sm font-bold text-gray-600">استان {cityProvinceName(load.from)}</span>
        </div>
        <div className="flex w-24 shrink-0 flex-col items-center gap-1">
          <div className="flex w-full items-center">
            <div className="flex-1 border-t-2 border-dashed border-primary-400"/>
            <ArrowLeft className="h-5 w-5 shrink-0 text-primary-700" strokeWidth={3} aria-hidden="true"/>
          </div>
          <span className="text-sm font-bold text-gray-600">{fa(load.routeDistance)} کیلومتر</span>
        </div>
        <div className="min-w-0 flex-1 text-center">
          <div className="mb-1 flex h-5 items-center justify-center" aria-label="مقصد">
            <MapPin className="h-5 w-5 text-primary-600 [&>circle]:fill-white" fill="currentColor" aria-hidden="true" />
          </div>
          <b className="block truncate text-xl font-extrabold leading-7">{load.to}</b>
          <span className="block text-sm font-bold text-gray-600">استان {cityProvinceName(load.to)}</span>
        </div>
      </div>

      <div className="text-base">
        <div className="flex items-center justify-start gap-3 border-b border-gray-300 px-3 py-3 text-right"><Package className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true"/><b className="text-base font-black text-gray-950">{load.type}</b></div>
        <div className="flex items-center justify-start gap-3 border-b border-gray-300 px-3 py-3 text-right"><WeightIcon className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true"/><b className="text-base font-black text-gray-950">{formattedWeightTons} تن</b></div>
        <div className="flex items-start justify-start gap-3 border-b border-gray-300 px-3 py-3 text-right"><FileText className="mt-1 h-6 w-6 shrink-0 text-primary-600" aria-hidden="true"/><p className="min-w-0 text-right text-base font-bold leading-7 text-gray-900">{load.description}</p></div>
      </div>

      <Button size="full" onClick={onOpen} className="h-12 min-h-0 w-full rounded-none border-0 bg-accent-500 py-1.5 text-lg font-black text-white shadow-none hover:bg-accent-600">
        <PhoneCall className="ml-2 h-5 w-5" aria-hidden="true"/> تماس برای هماهنگی
      </Button>
    </div>;
}
function Empty({ title, text, action }: {title:string;text:string;action?:()=>void}) {
  return <div className="py-14 text-center"><Package className="w-10 h-10 mx-auto text-gray-300"/><h3 className="font-black mt-3">{title}</h3><p className="text-sm text-gray-400 mt-2">{text}</p>{action && <Button size="sm" variant="outline" className="mt-5" onClick={action}>تلاش دوباره</Button>}</div>;
}


function WalletMovementIcon({ type }: { type: 'increase' | 'decrease' | 'gift' }) {
  const gift = type === 'gift';
  const red = type === 'decrease';
  const color = red ? '#D92D3A' : '#07834F';
  const border = red ? '#F3A6AC' : '#9DDDB8';
  const surface = red ? '#FFF0F1' : '#E7F8ED';
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm" style={{ backgroundColor: surface, borderColor: border }}>
    {gift ? <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M4.5 10h15v10.2h-15z" fill={color} stroke={border} strokeWidth="1.35" strokeLinejoin="round"/>
      <path d="M3.5 7h17v4h-17z" fill={color} stroke={border} strokeWidth="1.35" strokeLinejoin="round"/>
      <path d="M12 7v13" stroke={surface} strokeWidth="1.7"/>
      <path d="M12 7C7.4 7 5.4 5.8 6.2 3.9 7.1 1.8 10.2 4 12 7Z" fill={color} stroke={border} strokeWidth="1.15" strokeLinejoin="round"/>
      <path d="M12 7c4.6 0 6.6-1.2 5.8-3.1C16.9 1.8 13.8 4 12 7Z" fill={color} stroke={border} strokeWidth="1.15" strokeLinejoin="round"/>
    </svg> : <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M4.1 7.1V5.8c0-1 .8-1.8 1.8-1.8h11.2c1 0 1.8.8 1.8 1.8v1.4" fill={color} stroke={border} strokeWidth="1.35" strokeLinejoin="round"/>
      <path d="M4.2 7h15.1c1.2 0 2.2 1 2.2 2.2v8.1c0 1.2-1 2.2-2.2 2.2H4.7c-1.2 0-2.2-1-2.2-2.2V9.2C2.5 8 3.4 7 4.2 7Z" fill={color} stroke={border} strokeWidth="1.35" strokeLinejoin="round"/>
      <path d="M15.2 10.1h6.1v5.2h-6.1a2.6 2.6 0 0 1-2.6-2.6v0a2.6 2.6 0 0 1 2.6-2.6Z" fill={color} stroke={border} strokeWidth="1.35" strokeLinejoin="round"/>
      <circle cx="16.1" cy="12.7" r="1" fill={surface}/>
    </svg>}
  </span>;
}

function FacelessAvatar({ className = 'h-16 w-16' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" role="img" aria-label="آواتار پیش‌فرض بدون چهره">
    <circle cx="50" cy="50" r="49" fill="#DCEAFE"/>
    <path d="M12 100c2-23 15-36 38-36s36 13 38 36" fill="#344B63"/>
    <path d="M42 59h16v15H42z" fill="#D8A27A"/>
    <path d="M30 39c0-18 8-28 20-28s20 10 20 28v9c0 14-9 24-20 24S30 62 30 48z" fill="#E8BE98"/>
    <path d="M27 42c-2-20 8-34 24-34 15 0 25 13 23 33-5-1-9-5-12-11-9 7-20 10-35 12Z" fill="#26384B"/>
    <path d="M28 39c-1 9 0 16 3 22l5 3-2-19Z" fill="#26384B"/>
    <path d="M67 39c1 8 0 15-3 21l-4 4 2-18Z" fill="#26384B"/>
  </svg>;
}

export function MainApp() {
  const { profile, session, signOut } = useAuth();
  const [page, setPage] = useState<Page>('home');
  const demoPublicationAges = [3, 15, 30, 60, 120, 180, 240, 15, 30, 60, 120, 180, 240, 5, 45, 90];
  const demoPriceIndexes = [72, 64, 83, 51, 76, 69, 58, 81, 62, 74, 68, 55, 77, 60, 88, 71];
  const [loads, setLoads] = useState<Load[]>([...seedLoads, ...searchOnlyLoads].map((load, index) => ({
    ...load,
    publishedAt: load.publishedAt ?? Date.now() - demoPublicationAges[index % demoPublicationAges.length] * 60_000,
    priceIndex: load.priceIndex ?? demoPriceIndexes[index % demoPriceIndexes.length],
  })));
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
  const [showPageHelp, setShowPageHelp] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('bbberah-read-notification-ids-v1') || '[]');
      return Array.isArray(saved) ? saved.filter((id:any) => typeof id === 'string') : [];
    } catch { return []; }
  });
  const unreadNotifications = notificationItems.filter(item => !readNotificationIds.includes(item.id)).length;
  const [displayMode, setDisplayMode] = useState<'day'|'night'|'auto'>(() => {
    const saved = window.localStorage.getItem('bbberah-display-mode');
    return saved === 'day' || saved === 'night' || saved === 'auto' ? saved : 'auto';
  });
  const [systemDark, setSystemDark] = useState<boolean>(() => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState<boolean>(() => window.localStorage.getItem('bbberah-sms-notifications-enabled') !== 'false');
  const themePressTimer = useRef<number | null>(null);
  const themeLongPressTriggered = useRef(false);
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
const [walletTransactions] = useState<Array<{id:string; type:'increase'|'decrease'; amount:number; at:number; title:string; description?:string; source?:string}>>(() => {
  try {
    const raw = window.localStorage.getItem('bbberah_wallet_transactions_v1');
    let saved = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(saved) || saved.length === 0) {
      const now = Date.now();
      saved = [
        {id:'demo-increase-1',type:'increase',amount:2500000,at:now-86400000*2,title:'افزایش موجودی',description:'شارژ کیف پول',source:'demo'},
        {id:'demo-gift-1',type:'increase',amount:500000,at:now-86400000,title:'هدیه افزایش موجودی',description:'هدیه خوش‌آمدگویی از طرف براه',source:'gift'},
        {id:'demo-increase-2',type:'increase',amount:1000000,at:now-3600000*5,title:'افزایش موجودی',description:'افزایش آزمایشی موجودی کیف پول',source:'demo'},
      ];
      window.localStorage.setItem('bbberah_wallet_transactions_v1', JSON.stringify(saved));
    }
    return saved.filter((x:any) => x && (x.type === 'increase' || x.type === 'decrease') && Number.isFinite(Number(x.amount)) && Number.isFinite(Number(x.at))).map((x:any) => ({id:String(x.id || x.at),type:x.type,amount:Number(x.amount),at:Number(x.at),title:String(x.title || (x.source === 'gift' ? 'هدیه افزایش موجودی' : x.type === 'increase' ? 'افزایش موجودی' : 'کاهش موجودی')),description:typeof x.description === 'string' ? x.description : '',source:typeof x.source === 'string' ? x.source : ''}));
  } catch { return []; }
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
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>(() => {
    try {
      const saved = window.localStorage.getItem('bbberah_vehicle_v1');
      return saved ? JSON.parse(saved) : {type:'تریلی',usage:'',feature:'',plate:'',model:'',year:''};
    } catch {
      return {type:'تریلی',usage:'',feature:'',plate:'',model:'',year:''};
    }
  });
  const [plateParts, setPlateParts] = useState<string[]>(() => {
    const saved = window.localStorage.getItem('bbberah_vehicle_v1');
    const plate = saved ? (() => { try { return JSON.parse(saved).plate || ''; } catch { return ''; } })() : '';
    const parts = plate.split('-');
    return [parts[0] || '', parts[1] || '', parts[2] || '', parts[3] || ''];
  });
  const plateLetters = ['الف','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی'];
  const updatePlatePart = (index:number, value:string) => {
    const next = [...plateParts];
    next[index] = value;
    setPlateParts(next);
    setVehicleForm(v => ({...v, plate: next.join('-')}));
    try {
      const saved = window.localStorage.getItem('bbberah_vehicle_v1');
      const current = saved ? JSON.parse(saved) : {};
      window.localStorage.setItem('bbberah_vehicle_v1', JSON.stringify({...current, plate: next.join('-')}));
    } catch {}
  };
  const [accountName, setAccountName] = useState(profile?.full_name || '');
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [shipmentRewardSummary, setShipmentRewardSummary] = useState<null | {scoreChange:number; commission:number; discount:number; walletBefore:number; walletAfter:number}>(null);

  const notify = (m:string) => { setToast(m); window.setTimeout(()=>setToast(''), 2600); };
  const effectiveDark = displayMode === 'night' || (displayMode === 'auto' && systemDark);
  useEffect(() => { window.localStorage.setItem('bbberah-display-mode', displayMode); }, [displayMode]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  useEffect(() => { window.localStorage.setItem('bbberah-sms-notifications-enabled', smsNotificationsEnabled ? 'true' : 'false'); }, [smsNotificationsEnabled]);
  useEffect(() => { window.localStorage.setItem('bbberah-read-notification-ids-v1', JSON.stringify(readNotificationIds)); }, [readNotificationIds]);
  const startThemePress = () => {
    themeLongPressTriggered.current = false;
    if (themePressTimer.current !== null) window.clearTimeout(themePressTimer.current);
    themePressTimer.current = window.setTimeout(() => {
      themeLongPressTriggered.current = true;
      setDisplayMode('auto');
    }, 650);
  };
  const endThemePress = () => {
    if (themePressTimer.current !== null) window.clearTimeout(themePressTimer.current);
    themePressTimer.current = null;
  };
  const handleThemeClick = () => {
    if (themeLongPressTriggered.current) {
      themeLongPressTriggered.current = false;
      return;
    }
    setDisplayMode(current => current === 'night' ? 'day' : 'night');
  };
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
        setPageWithTransition(next, 'back');
        
        window.scrollTo({top:0,behavior:'auto'});
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const setPageWithTransition = (next: Page, direction: 'forward' | 'back' = 'forward') => {
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => { finished: Promise<unknown> };
    };
    if (transitionDocument.startViewTransition) {
      document.documentElement.dataset.navDirection = direction;
      const transition = transitionDocument.startViewTransition(() => setPage(next));
      const clearDirection = () => { delete document.documentElement.dataset.navDirection; };
      transition.finished.then(clearDirection, clearDirection);
    } else {
      setPage(next);
    }
  };
  const go = (p:Page, preserveSearch = false) => {
    if (p === 'search' && !preserveSearch) {
      setOrigin(''); setOriginText(''); setOriginProvince(''); setOriginCounty('');
      setDestination(''); setDestinationText(''); setDestinationProvince(''); setDestinationCounty('');
      setFrequentRoute(null); setSearchSubmitted(false);
    }
    if (p === page) {  return; }
    window.history.pushState({ bbberahPage: p }, '', '#' + p);
    setPageWithTransition(p);
    
    window.scrollTo({top:0,behavior:'auto'});
  };
  const replacePage = (p:Page) => {
    window.history.replaceState({ bbberahPage: p }, '', '#' + p);
    setPageWithTransition(p);
    
    window.scrollTo({top:0,behavior:'auto'});
  };
  const goHome = () => {
    window.history.replaceState({ bbberahPage: 'home' }, '', '#home');
    setPageWithTransition('home', 'back');
    
    window.scrollTo({top:0,behavior:'auto'});
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
    account:'اطلاعات حساب', verification:'احراز هویت', vehicle:'خودروی من', 'vehicle-dashboard':'خودروی من', 'vehicle-select':'نوع خودرو', wallet:'کیف پول', transactions:'تراکنش‌ها',
    support:'پشتیبانی', rules:'قوانین و مقررات', notifications:'اعلان‌ها', display:'تنظیمات ظاهری', 'cargo-detail':'جزئیات بار',
offers:'پیشنهادهای من', 'vehicle-loader':'ویژگی کاربری', 'trailer-select':'نوع کاربری را انتخاب کنید', 'jooft-usage':'نوع کاربری خودرو خود را انتخاب کنید', 'jooft-feature':'ویژگی کاربری', 'tak-usage':'نوع کاربری خودرو خود را انتخاب کنید', 'tak-feature':'ویژگی کاربری', 'komionet-usage':'نوع بارگیر خود را انتخاب کنید', 'komionet-feature':'ویژگی بارگیر خود را انتخاب کنید', 'van-usage':'نوع کاربری خود را انتخاب کنید', 'van-feature':'ویژگی بارگیر خود را انتخاب کنید', 'flatbed-size':'ویژگی کاربری', report:'گزارش تخلف', shipment:'سفر جاری', 'origin-select':'انتخاب مبدأ', 'destination-select':'انتخاب مقصد', 'destination-all':'انتخاب شهر مقصد', 'frequent-route':'بارهای مسیر', 'contact-report':'نتیجه تماس', 'nearby-destination-select':'انتخاب مقصد', 'nearby-results':'اطراف من'
  };

  const openOfferDetail = (loadId:string) => setOfferDetailLoadId(loadId);
  const closeOfferDetail = () => setOfferDetailLoadId(null);

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

  const Header = () => <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
    <div className="relative max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
      <button type="button" onClick={()=>go('support')} className="w-10 h-10 rounded-xl border border-orange-200 bg-orange-50 text-accent-500 flex items-center justify-center" aria-label="پشتیبانی" title="پشتیبانی"><Headset className="w-5 h-5"/></button>
      <button type="button" onClick={()=>goHome()} className="absolute left-1/2 -translate-x-1/2 font-black text-2xl tracking-tight text-primary-700">براه</button>
      <div className="flex items-center gap-2">
        <button type="button"
          onPointerDown={startThemePress}
          onPointerUp={endThemePress}
          onPointerCancel={endThemePress}
          onPointerLeave={endThemePress}
          onContextMenu={e=>e.preventDefault()}
          onClick={handleThemeClick}
          className="w-10 h-10 rounded-xl border border-orange-200 bg-orange-50 text-accent-500 flex items-center justify-center"
          aria-label={displayMode==='auto'?'حالت نمایش خودکار':displayMode==='night'?'حالت شب':'حالت روز'}
          title="لمس کوتاه: روز/شب؛ نگه‌داشتن: خودکار">
          {displayMode==='auto' ? <Monitor className="w-5 h-5"/> : effectiveDark ? <Moon className="w-5 h-5"/> : <Sun className="w-5 h-5"/>}
        </button>
        <button type="button" onClick={()=>go('notifications')} className="relative w-10 h-10 rounded-xl border border-orange-200 bg-orange-50 text-accent-500 flex items-center justify-center" aria-label="اعلان‌ها" title="اعلان‌ها"><Bell className="w-5 h-5"/>{unreadNotifications>0&&<span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">{fa(unreadNotifications)}</span>}</button>
      </div>
    </div>
  </header>;

  const BottomNav = () => <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-orange-100 bg-white/95 backdrop-blur shadow-[0_-4px_16px_rgba(255,102,0,0.06)]">
    <div className="max-w-lg mx-auto grid grid-cols-4 h-[72px]">
      {[
        ['home','خانه',Home],['search','جستجو',Search],['calls','تماس‌ها',PhoneCall],['profile','حساب',User]
      ].map(([p,l,I])=>{
        const active = page===p || (p==='profile' && ['account','wallet','transactions','vehicle-dashboard','vehicle-select','vehicle','vehicle-loader','trailer-select','jooft-usage','jooft-feature','tak-usage','tak-feature','komionet-usage','komionet-feature','van-usage','van-feature','flatbed-size','rules','display'].includes(page));
        return <button key={p as string} onClick={()=>p==='search' ? openSearchPage() : go(p as Page)} className={`relative flex flex-col items-center justify-center gap-1 text-[11px] transition-colors ${active?'font-black text-accent-500':'font-bold text-gray-500 hover:text-accent-500'}`}>
          {active && <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-accent-500"/>}
          {createElement(I as any,{className:`w-5 h-5 ${active?'text-accent-500':'text-gray-500'}`})}
          {String(l)}
        </button>
      })}
    </div>
  </nav>;

  const AccountHome = () => {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
        const verificationLabel = identityVerified ? 'تأییدشده' : identityPending ? 'در انتظار تأیید' : 'تأییدنشده';
    const verificationClass = identityVerified ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : identityPending ? 'border-orange-200 bg-orange-50 text-orange-700' : identityRejected ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600';
    const savedVehicle = Boolean(window.localStorage.getItem('bbberah_vehicle_v1') && vehicleForm.type && vehicleForm.feature);
    const vehicleTypeLabel = vehicleForm.type === 'وانت و نیسان' ? 'نیسان' : vehicleForm.type;
    const vehicleSummary = [vehicleTypeLabel, vehicleForm.usage, vehicleForm.feature].filter(Boolean).join(' · ');
    const cardClass = 'w-full rounded-2xl border border-primary-300 bg-primary-200 shadow-sm overflow-hidden';
    const rowClass = 'w-full flex items-center justify-between gap-3 px-4 py-3 text-right';
    const labelClass = 'flex min-w-0 items-center gap-3 text-right text-xl font-black text-gray-900';
    const statusClass = 'shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2.5 py-1 text-base font-black text-primary-700';
    const verificationStatusClass = `shrink-0 rounded-full border px-2.5 py-1 text-base font-black ${identityVerified ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : identityPending ? 'border-orange-200 bg-orange-50 text-orange-700' : identityRejected ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600'}`;
    return <div className="space-y-3">
      <div className="rounded-2xl border border-primary-300 bg-primary-200 shadow-sm">
        <div className="p-4 flex items-center justify-between gap-3" dir="rtl">
          <div className="min-w-0 flex flex-col items-start text-right gap-2">
            <div aria-label="آواتار پیش‌فرض" className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary-100 bg-primary-50"><FacelessAvatar className="h-full w-full"/></div>
            <h2 className="font-black text-2xl text-gray-900">{profile?.full_name || 'کاربر براه'}</h2>
            <p className="text-base font-bold text-gray-900 dark:text-gray-900" dir="ltr">{profile?.phone || 'شماره موبایل ثبت نشده'}</p>
          </div>
          <div className="shrink-0 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-center text-orange-700">
            <div className="flex items-center justify-center gap-1.5 text-sm font-bold"><Star className="h-5 w-5 fill-orange-500 text-orange-500"/> امتیاز شما</div>
            <strong className="mt-1 block text-2xl font-black" dir="rtl">{money(driverScore)}</strong>
          </div>
        </div>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>go('account')} className={rowClass} dir="rtl">
          <span className={labelClass}><ShieldCheck className="h-5 w-5 shrink-0 text-primary-600"/>احراز هویت</span>
          <span className={verificationStatusClass}>{verificationLabel}</span>
        </button>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>go('vehicle-dashboard')} className={rowClass} dir="rtl">
          <span className={labelClass}><CarFront className="h-5 w-5 shrink-0 text-primary-600"/>خودروی من</span>
          <span className={`${statusClass} max-w-[55%] truncate`}>{savedVehicle ? vehicleSummary : 'ثبت نشده'}</span>
        </button>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>go('wallet')} className={rowClass} dir="rtl">
          <span className={labelClass}><WalletMovementIcon type="increase"/><span>کیف پول</span></span>
          <span className={statusClass}>{money(walletBalance)} تومان</span>
        </button>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>go('transactions')} className={rowClass} dir="rtl">
          <span className={labelClass}><ReceiptText className="h-5 w-5 shrink-0 text-primary-600"/>تراکنش‌ها</span>
          <ChevronLeft className="h-5 w-5 shrink-0 text-gray-400"/>
        </button>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>go('rules')} className={rowClass} dir="rtl">
          <span className={labelClass}><FileText className="h-5 w-5 shrink-0 text-black"/>قوانین و مقررات</span>
        </button>
      </div>

      <div className={cardClass}>
        <button type="button" onClick={()=>setShowLogoutConfirm(true)} className={rowClass} dir="rtl">
          <span className="flex min-w-0 items-center gap-3 text-xl font-black text-red-600"><LogOut className="h-5 w-5 shrink-0 text-red-600"/>خروج از حساب کاربری</span>
        </button>
      </div>
      <div className="rounded-2xl border border-primary-300 bg-primary-200 px-4 py-5 text-center shadow-sm">
        <div className="flex items-center justify-center gap-4">
          <span aria-label="اینستاگرام؛ لینک به‌زودی اضافه می‌شود" title="اینستاگرام — لینک به‌زودی اضافه می‌شود" className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white shadow-sm"><Instagram className="h-5 w-5"/></span>
          <span aria-label="لوگوی تلگرام" title="تلگرام" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm"><img src="https://telegram.org/img/t_logo.png" alt="لوگوی تلگرام" className="h-5 w-5 object-contain" loading="lazy"/></span>
          <span aria-label="روبیکا" title="روبیکا" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm"><img src="https://commons.wikimedia.org/wiki/Special:FilePath/Rubika_Icon.png" alt="لوگوی روبیکا" className="h-5 w-5 object-contain" loading="lazy"/></span>
        </div>
      </div>
      <div className="rounded-2xl border border-primary-300 bg-primary-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-bold text-gray-500">نسخه برنامه</span>
          <span className="font-black text-gray-800" dir="ltr">۱.۰.۱</span>
        </div>
      </div>
      {showLogoutConfirm && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLogoutConfirm(false)}}>
        <div dir="rtl" role="dialog" aria-modal="true" aria-labelledby="main-logout-confirm-title" className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600"><LogOut className="h-7 w-7"/></div>
          <h2 id="main-logout-confirm-title" className="text-center text-xl font-black text-gray-900">خروج از حساب کاربری</h2>
          <p className="mt-2 text-center text-base font-bold leading-6 text-gray-900">آیا از حساب کاربری خود خارج می شوید؟</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button type="button" onClick={()=>setShowLogoutConfirm(false)} className="rounded-xl border-2 border-orange-500 px-4 py-3 font-bold text-orange-600">انصراف</button>
            <button type="button" onClick={async()=>{setShowLogoutConfirm(false);await signOut()}} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white hover:bg-red-700">خروج</button>
          </div>
        </div>
      </div>}
    </div>;
  };

  const getLoadInteraction = (loadId:string) => {
    const contact = contactHistory.some(item => item.loadId === loadId);
    const offer = myOffers.some(item => item.loadId === loadId);
    if (contact || offer) return { label:'تماس گرفته‌اید', cls:'border-primary-200 bg-primary-50 text-primary-700' };
    return null;
  };
  const compactDateTime = (timestamp:number) => {
    const date=new Date(timestamp);
    const now=new Date();
    const todayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
    const dateStart=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
    const days=Math.round((todayStart-dateStart)/86400000);
    const dayLabel=days===0?'امروز':days===1?'دیروز':new Intl.DateTimeFormat('fa-IR-u-ca-persian',{day:'numeric',month:'short'}).format(date);
    const timeLabel=new Intl.DateTimeFormat('fa-IR',{hour:'2-digit',minute:'2-digit'}).format(date);
    return dayLabel+' '+timeLabel;
  };

  const animateHomeCard = (_id:string, action:()=>void) => {
    action();
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
    return <div className="flex min-h-0 flex-1 flex-col gap-2 w-full">
      <section aria-label="بنر کامیون‌ها و تریلی‌ها" className="relative h-[120px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 sm:h-[140px]">
        <img src="/bbberah/truck-banner.svg" alt="تریلی آبی در جاده" loading="eager" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-center"/>
        <div className="absolute inset-0 bg-gradient-to-l from-primary-900/75 via-primary-900/30 to-transparent"/>
        <div className="absolute inset-y-0 right-0 flex flex-col justify-center px-4 text-right text-white">
          <span className="text-lg font-black">براه</span>
          <span className="mt-1 text-xs font-bold text-white/95">همراه مسیرهای جاده‌ای</span>
        </div>
      </section>

      <section aria-label="دسترسی سریع" className="grid flex-none grid-cols-2 content-start gap-2 pt-1">
        <button type="button" onClick={()=>animateHomeCard('search',openSearchPage)} className="home-quick-action col-span-1 flex aspect-square h-auto min-h-0 w-full self-start flex-col items-center justify-center gap-5 rounded-2xl bg-primary-200 px-3 py-4 text-center shadow-[0_2px_12px_rgba(0,57,88,0.08)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-orange-300 bg-orange-100 shadow-sm"><Search className="h-8 w-8 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="w-full text-center text-lg font-black text-gray-900">جستجوی بار</span>
          
        </button>
        <button type="button" onClick={()=>animateHomeCard('nearby',()=>{setNearbyDestination('');setNearbyDestinationText('');setNearbyDestinationProvince('');setNearbyDestinationCounty('');requestNearbyLocation();go('nearby-destination-select')})} className="home-quick-action col-span-1 flex aspect-square h-auto min-h-0 w-full self-start flex-col items-center justify-center gap-5 rounded-2xl bg-primary-200 px-3 py-4 text-center shadow-[0_2px_12px_rgba(0,57,88,0.06)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-orange-300 bg-orange-100 shadow-sm"><Navigation className="h-8 w-8 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="w-full text-center text-lg font-black text-gray-900">اطراف من</span>
          
        </button>
        <button type="button" onClick={()=>notify('بخش فروشگاه به‌زودی فعال می‌شود.')} className="home-quick-action col-span-1 flex aspect-[3/2] w-full flex-col items-center justify-center gap-5 rounded-xl bg-primary-200 px-1 py-1 text-center shadow-[0_2px_12px_rgba(0,57,88,0.06)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-300 bg-orange-100 shadow-sm"><Store className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="text-sm font-black leading-5 text-gray-900">فروشگاه</span>
        </button>
        <button type="button" onClick={()=>notify('بخش بارهای مشاهده‌شده هنوز فعال نشده است.')} className="home-quick-action col-span-1 flex aspect-[3/2] w-full flex-col items-center justify-center gap-5 rounded-xl bg-primary-200 px-1 py-1 text-center shadow-[0_2px_12px_rgba(0,57,88,0.06)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-300 bg-orange-100 shadow-sm"><Eye className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="text-sm font-black leading-5 text-gray-900">بارهای مشاهده‌شده</span>
        </button>
        <button type="button" onClick={()=>window.open('https://smartcard.rmto.ir','_blank','noopener,noreferrer')} className="home-quick-action col-span-1 flex aspect-[3/2] w-full flex-col items-center justify-center gap-5 rounded-xl bg-primary-200 px-1 py-1 text-center shadow-[0_2px_12px_rgba(0,57,88,0.06)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-300 bg-orange-100 shadow-sm"><CreditCard className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="text-sm font-black leading-5 text-gray-900">کارت هوشمند</span>
        </button>
        <button type="button" onClick={()=>window.open('https://smartcard.rmto.ir','_blank','noopener,noreferrer')} className="home-quick-action col-span-1 flex aspect-[3/2] w-full flex-col items-center justify-center gap-5 rounded-xl bg-primary-200 px-1 py-1 text-center shadow-[0_2px_12px_rgba(0,57,88,0.06)] transition-colors hover:bg-primary-300 active:bg-primary-300">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-orange-300 bg-orange-100 shadow-sm"><HeartPulse className="h-5 w-5 shrink-0 text-accent-500" aria-hidden="true"/></span>
          <span className="text-sm font-black leading-5 text-gray-900">کارت سلامت</span>
        </button>
      </section>
    </div>;
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
        {nearbyFiltered.map(l=>{return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>;})}
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
          {filtered.map(l=>{return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>;})}
        </div>
      ) : (
        <Card><CardBody><Empty title="بار مرتبط پیدا نشد" text="برای این مسیر هنوز باری ثبت نشده است." action={clearAll}/></CardBody></Card>
      );
    }

    return <div className="space-y-4">
      <Card><CardBody className="p-4">
        <div className="flex items-center gap-2 px-1"><Search className="w-5 h-5 text-primary-700" aria-hidden="true"/><h2 className="font-black text-lg text-gray-900">جستجوی بار</h2></div>
        <button onClick={()=>{setOrigin('');setOriginText('');setOriginProvince('');setOriginCounty('');replacePage('origin-select');}} className="w-full mt-5 mb-3 rounded-lg border border-gray-200 bg-white p-4 text-right active:bg-gray-50">
          <span className="block text-xs font-bold text-gray-400 mb-1">مبدأ</span>
          <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-primary-600 shrink-0"/><span className={originText ? 'text-gray-900 font-bold' : 'text-gray-400'}>{originText || 'مبدأ را انتخاب کنید'}</span><ChevronLeft className="w-4 h-4 text-gray-300 mr-auto"/></div>
        </button>
        <div className="border-t border-gray-100 my-6"/>
        <button onClick={()=>{setDestination('');setDestinationText('');setDestinationProvince('');setDestinationCounty('');replacePage('destination-select');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 text-right active:bg-gray-50">
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
        {routeLoads.map(l=>{return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>;})}
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
          <input value={query} onChange={e=>{const value=e.target.value; setQuery(value); if(isNearby){ const q=normalizeSearch(value).replace(/^شهرستان/,''); if(q){ const exactProvince=iranLocations.find(p=>normalizeSearch(p.name)===q); if(exactProvince){ chooseProvince(String(exactProvince.id)); return; } const exactCity=allDestinationCities.find(x=>normalizeSearch(x.city)===q); if(exactCity){ chooseCity(exactCity.city, exactCity.countyId); return; } } }}} placeholder={isOrigin ? 'مثال تهران' : 'مثال یزد'} className="w-full rounded-lg border-2 border-gray-400 bg-white pr-11 pl-4 py-4 outline-none focus:border-primary-700"/>
        </div>
        {isOrigin && <button type="button" onClick={chooseNearby} className="w-full mt-3 rounded-lg bg-primary-100 text-primary-900 border border-primary-200 p-4 flex items-center justify-center gap-2 font-black active:scale-[0.99]">
          <Navigation className="w-5 h-5" />
          اطراف من
        </button>}
        {!isOrigin && <button type="button" onClick={openAllDestinationCities} className="w-full mt-3 rounded-lg bg-primary-100 text-primary-900 border border-primary-200 p-4 flex items-center justify-center gap-2 font-black active:scale-[0.99]">
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
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="جستجو در همه استان‌ها و شهرها" className="w-full rounded-lg border-2 border-gray-400 bg-white pr-11 pl-4 py-4 outline-none focus:border-primary-700"/>
        </div>
        <div className="mt-5 space-y-3 max-h-[68vh] overflow-auto">
          {iranLocations.map(province => {
            const provinceMatches = matches(province.name);
            const counties = province.counties.map(county => ({...county,cities:county.cities.filter(city => provinceMatches || matches(county.name) || matches(city))})).filter(county => provinceMatches || matches(county.name) || county.cities.length);
            if (normalized && !provinceMatches && !counties.length) return null;
            return <div key={province.id} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
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
        <span className={identityVerified ? 'text-sm font-black text-emerald-600' : identityRejected ? 'text-sm font-black text-red-600' : identityPending ? 'text-sm font-black text-orange-600' : 'text-sm font-black text-gray-500'}>{identityVerified ? '✓ تایید شده' : identityRejected ? 'عدم تایید' : identityPending ? 'در انتظار تایید' : 'ارسال مدارک'}</span>
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
          <button type="button" className="rounded-lg border border-gray-200 p-4 text-center font-black" onClick={() => chooseSource('gallery')}>از گالری</button>
          <button type="button" className="rounded-lg border border-gray-200 p-4 text-center font-black" onClick={() => chooseSource('camera')}>از دوربین</button>
        </div>
      </div>
    </div>;

    if (identityVerified) return <Card><CardBody className="p-5 text-center"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500"/><h3 className="font-black text-lg mt-3 text-emerald-700">احراز هویت تایید شده</h3><p className="text-sm text-gray-500 mt-2">مدارک هویتی شما تایید شده است.</p></CardBody></Card>;


    if (identityVerified) return <Card><CardBody className="p-5 text-center"><CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500"/><h3 className="font-black text-lg mt-3 text-emerald-700">احراز هویت تایید شده</h3><p className="text-sm text-gray-500 mt-2">مدارک هویتی شما تایید شده است.</p></CardBody></Card>;

    if (identityRejected) return <Card><CardBody className="p-5 text-center space-y-4"><div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center"><XCircle className="w-8 h-8 text-red-500"/></div><h3 className="font-black text-lg text-red-600">احراز هویت تأیید نشد</h3><p className="text-sm text-gray-500 leading-7">مدارک ارسالی شما نیاز به اصلاح دارد. پس از اصلاح می‌توانید دوباره مدارک را ارسال کنید.</p><div className="rounded-lg bg-red-50 border border-red-100 p-4 text-right space-y-2"><div className="text-sm font-black text-red-700">دلیل عدم تأیید</div><div className="text-sm text-gray-600 leading-7">تصویر مدارک واضح نیست یا نیاز به بررسی و اصلاح دارد.</div></div><Button size="full" onClick={() => { setIdentityRejected(false); setIdentityPending(false); setVerificationStep(1); window.localStorage.removeItem('bbberah_identity_rejected_v1'); window.localStorage.removeItem('bbberah_identity_pending_v1'); }} className="!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600">اصلاح و ارسال مجدد</Button></CardBody></Card>;

    if (identityPending) return <Card><CardBody className="p-5 text-center space-y-3"><Clock3 className="w-12 h-12 mx-auto text-orange-500"/><h3 className="font-black text-lg text-orange-600">در انتظار تایید احراز هویت</h3><p className="text-sm text-gray-500 leading-7">مدارک شما ارسال شده و تا زمان بررسی نهایی قابل ویرایش یا ارسال مجدد نیست.</p><div className="rounded-lg bg-orange-50 border border-orange-100 p-4 text-sm font-bold text-orange-700">لطفاً منتظر نتیجه بررسی بمانید.</div></CardBody></Card>;

    if (verificationStep === 1) return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">کد ملی خود را وارد کنید</h2><button type="button" onClick={()=>go("account")} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600" aria-label="بازگشت"><ArrowRight className="w-5 h-5"/></button></div>
        <div>
          <input value={nationalId} onChange={e => setNationalId(normalizeNationalId(e.target.value))} inputMode="numeric" maxLength={10} placeholder="کد ملی" className="w-full rounded-lg border border-gray-200 px-4 py-4 text-base font-black outline-none focus:border-primary-500" dir="ltr"/>
        </div>
        <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm font-bold text-primary-800 leading-7">
          مدارک شما محرمانه حفظ می‌شود و در هیچ جای اپلیکیشن نمایش داده نخواهد شد. این اطلاعات فقط برای افزایش اعتماد و اطمینان صاحب کالا دریافت می‌شود.
        </div>
        <Button size="full" onClick={submitNationalId} disabled={nationalId.length !== 10} className={nationalId.length === 10 ? '!bg-emerald-600 hover:!bg-emerald-700 !text-white !border-emerald-600' : '!bg-gray-300 !text-gray-500 !border-gray-300'}>ارسال</Button>
      </CardBody></Card>
    </div>;

    if (verificationStep === 2) return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">ارسال عکس گواهینامه</h2><button type="button" onClick={()=>setVerificationStep(1)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600" aria-label="بازگشت"><ArrowRight className="w-5 h-5"/></button></div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm font-black text-gray-400">نمونه تصویر گواهینامه</div>
          <p className="text-xs font-bold text-gray-500 mt-3 text-center">نمونه را فقط برای راهنمایی نحوه قرارگیری تصویر ببینید.</p>
        </div>
        <button type="button" onClick={() => setPicker('license')} className="w-full rounded-lg border-2 border-primary-200 bg-primary-50 p-5 text-center font-black text-primary-700">
          {licensePhoto ? <img src={URL.createObjectURL(licensePhoto)} alt="تصویر گواهینامه" className="w-full h-48 object-contain rounded-xl" /> : <span>انتخاب تصویر</span>}
        </button>
        {sourceInputs('license')}
        {licensePhoto && <button type="button" onClick={() => setPicker('license')} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm font-black text-gray-700">تغییر تصویر</button>}
        <Button size="full" onClick={submitLicense}>بعدی</Button>
      </CardBody></Card>
      {pickerMenu}
    </div>;

    return <div className="space-y-4">
      <Card><CardBody className="p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black">عکس گواهینامه همراه با چهره</h2><button type="button" onClick={()=>setVerificationStep(2)} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600" aria-label="بازگشت"><ArrowRight className="w-5 h-5"/></button></div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm font-black text-gray-400">نمونه چهره با گواهینامه</div>
          <p className="text-xs font-bold text-gray-500 mt-3 text-center">چهره و گواهینامه را همزمان و واضح داخل کادر قرار دهید.</p>
        </div>
        <button type="button" onClick={() => setPicker('face')} className="w-full rounded-lg border-2 border-primary-200 bg-primary-50 p-5 text-center font-black text-primary-700">
          {licenseFacePhoto ? <img src={URL.createObjectURL(licenseFacePhoto)} alt="چهره همراه گواهینامه" className="w-full h-48 object-contain rounded-xl" /> : <span>انتخاب تصویر</span>}
        </button>
        {sourceInputs('face')}
        {licenseFacePhoto && <button type="button" onClick={() => setPicker('face')} className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm font-black text-gray-700">تغییر تصویر</button>}
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
    <Card><CardBody className="p-5"><div className="flex items-center gap-3"><PhoneCall className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true"/><div className="min-w-0 flex-1"><span className="block text-sm font-bold text-gray-500">شماره تماس بار</span><a href={`tel:${selected.phone}`} dir="ltr" className="mt-1 inline-block text-lg font-black text-primary-700">{selected.phone}</a></div></div></CardBody></Card>
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
            return <button key={option} type="button" onClick={()=>setSelectedReports(prev=>checked ? prev.filter(item=>item!==option) : [...prev, option])} className={`w-full rounded-lg border p-3 text-right flex items-center gap-3 transition ${checked ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700'}`}>
              <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${checked ? 'border-red-600 bg-red-600 text-white' : 'border-gray-300 bg-white'}`}>{checked ? '✓' : ''}</span>
              <span className="text-sm font-bold">{option}</span>
            </button>;
          })}
        </div>
        <textarea value={reportText} onChange={e=>setReportText(e.target.value)} placeholder="توضیحات بیشتر (اختیاری)..." className="mt-4 w-full min-h-32 rounded-lg border border-gray-200 p-4 text-sm font-bold outline-none focus:border-primary-500 resize-none" />
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
        {selected && <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-4"><b className="block">{selected.title}</b><span className="text-sm text-gray-500 mt-1 block">{selected.from} ← {selected.to}</span></div>}
      </CardBody></Card>
      <Card><CardBody className="p-4">
        <div className="space-y-2">
          {options.map(([value,title,cls])=>{
            const blocked = value==='declined' && declinedBlocked;
            return <button key={value} type="button" disabled={blocked} onClick={()=>setContactReport(value)} className={`w-full text-right rounded-lg border-2 p-4 transition ${contactReport===value?'border-primary-600 ring-2 ring-primary-100':'border-transparent'} ${cls} ${blocked?'opacity-45 cursor-not-allowed':''}`}>
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
    if (page==='nearby') return <div className="space-y-4">{loads.filter(l=>!l.id.startsWith('s') && l.status==='open' && l.distance<=50).sort((a,b)=>a.distance-b.distance).map(l=>{return <LoadCard key={l.id} load={l} onOpen={()=>{setSelected(l);go('cargo-detail')}} onOffer={()=>requestOffer(l)}/>;})}</div>;
    if (page==='calls') return <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base font-black">وضعیت تماس‌ها</h2><span className="rounded-full bg-sky-100 text-sky-800 px-2.5 py-1 text-[11px] font-black">تماس</span></div>
        {contactHistory.length===0 ? <Card><CardBody className="p-4"><Empty title="هنوز تماسی ثبت نشده" text="بعد از تماس با صاحب بار، نتیجه تماس را مشخص کنید تا اینجا ثبت شود."/></CardBody></Card> : [...contactHistory].sort((a,b)=>b.at-a.at).map((item,idx)=>{
          const load=loads.find(l=>l.id===item.loadId);
          if(!load) return null;
          const shipmentResult=shipmentHistory.find(h=>h.loadId===load.id);
          const status=item.status==='carried' ? 'بارگیری کردم' : shipmentResult?.outcome==='carried' ? 'بارگیری کردم' : shipmentResult?.outcome==='withdrawn' ? 'انصراف از حمل' : item.status==='agreed' ? 'توافق کردیم' : item.status==='declined' ? 'عدم توافق' : 'هنوز مشخص نیست';
          const statusClass=shipmentResult?.outcome==='withdrawn'||item.status==='declined' ? 'bg-red-50 text-red-700 border-red-200' : item.status==='agreed'||item.status==='carried'||shipmentResult?.outcome==='carried' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200';
          const cardKey=item.loadId+'-'+item.at+'-'+idx;
          const expanded=expandedCallId===cardKey;
          const needsStatus=item.status==='uncertain'||item.status==='declined';
          return <div key={cardKey} className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50/50 shadow-sm">
            <button type="button" aria-expanded={expanded} onClick={()=>setExpandedCallId(expanded?null:cardKey)} className="block w-full p-3 text-right">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-gray-500">{compactDateTime(item.at)}</span>
                <span className={'shrink-0 rounded-lg border px-2 py-1 text-[11px] font-black '+statusClass}>{status}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm font-black text-gray-900"><MapPin className="h-4 w-4 shrink-0 text-sky-700"/><span>{load.from}</span><span className="text-gray-400">&gt;</span><span>{load.to}</span></div>
              <div className="mt-1 text-xs font-bold text-gray-600">📦 {load.type}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-sky-800"><span>تماس</span><span>{expanded?'بستن منو':'لمس برای عملیات'}</span></div>
            </button>
            {expanded && <div className={"grid "+(needsStatus ? "grid-cols-3" : "grid-cols-2")+" gap-2 border-t border-sky-200 bg-white p-3"}>
              <a href={'tel:'+load.phone} onClick={()=>{setSelected(load);contactCallStartedAt.current=Date.now();setPendingContactReturn(true);}} className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2.5 text-sm font-black text-emerald-800"><Phone className="h-4 w-4"/>تماس</a>
              {needsStatus && <button type="button" onClick={()=>{setSelected(load);setContactReport(null);go('contact-report');}} className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-2.5 text-sm font-black text-amber-800">تعیین وضعیت</button>}
              <button type="button" onClick={()=>{setSelected(load);go('cargo-detail');}} className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2.5 text-sm font-black text-gray-800"><FileText className="h-4 w-4"/>جزئیات</button>
            </div>}
          </div>;
        })}
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2"><h2 className="text-base font-black">پیشنهادهای قیمت</h2><span className="rounded-full bg-violet-100 text-violet-800 px-2.5 py-1 text-[11px] font-black">پیشنهاد</span></div>
        {myOffers.length===0 ? <Card><CardBody className="p-4"><Empty title="هنوز پیشنهادی ارسال نشده" text="پیشنهادهای قیمت شما پس از ارسال در همین صفحه نمایش داده می‌شوند."/></CardBody></Card> :
          [...myOffers].sort((a,b)=>b.at-a.at).map(offer=>{
            const load=loads.find(l=>l.id===offer.loadId); if(!load) return null;
            const statusText=offer.status==='accepted'?'پذیرفته شد':offer.status==='rejected'?'رد شد':'در انتظار';
            const statusClass=offer.status==='accepted'?'bg-emerald-50 text-emerald-700 border-emerald-200':offer.status==='rejected'?'bg-red-50 text-red-700 border-red-200':'bg-gray-100 text-gray-700 border-gray-200';
            return <button key={offer.loadId} type="button" onClick={()=>openOfferDetail(offer.loadId)} className="block w-full rounded-xl border border-violet-200 bg-violet-50/50 p-3 text-right shadow-sm">
              <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-gray-500">{compactDateTime(offer.at)}</span><span className={'shrink-0 rounded-lg border px-2 py-1 text-[11px] font-black '+statusClass}>{statusText}</span></div>
              <div className="mt-2 flex items-center gap-1 text-sm font-black text-gray-900"><MapPin className="h-4 w-4 shrink-0 text-violet-700"/><span>{load.from}</span><span className="text-gray-400">&gt;</span><span>{load.to}</span></div>
              <div className="mt-1 text-xs font-bold text-gray-600">📦 {load.type}</div>
              <div className="mt-2 text-[10px] font-bold text-violet-800">پیشنهاد قیمت · لمس برای جزئیات</div>
            </button>;
          })}
      </section>
    </div>;
    if (page==='notifications') return <div className="space-y-4">
      <Card><CardBody className="px-3 py-2.5 flex items-center justify-between gap-3">
        <b className="text-sm">دریافت پیامک</b>
        <button type="button" role="switch" aria-checked={smsNotificationsEnabled} onClick={()=>setSmsNotificationsEnabled(v=>!v)} className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${smsNotificationsEnabled?'bg-emerald-600':'bg-gray-300'}`} aria-label="فعال یا غیرفعال‌کردن دریافت پیامک">
          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${smsNotificationsEnabled?'right-1':'right-6'}`}/>
        </button>
      </CardBody></Card>
      <div className="space-y-3">{notificationItems.map(item=>{
        const isRead = readNotificationIds.includes(item.id);
        return <Card key={item.id}><CardBody className={`p-0 overflow-hidden border rounded-lg ${isRead?'border-gray-100 bg-white':'border-orange-200 bg-orange-50'}`}>
          <button type="button" onClick={()=>setReadNotificationIds(current=>current.includes(item.id)?current:[...current,item.id])} className={`w-full p-4 flex gap-3 text-right transition-colors ${isRead?'bg-white':'bg-orange-50'}`}>
            <Bell className={`w-5 h-5 shrink-0 mt-0.5 ${isRead?'text-gray-400':'text-orange-600'}`}/>
            <span className="min-w-0 flex-1"><b className="block text-sm">{item.message}</b><span className="block text-[11px] text-gray-400 mt-1">{item.date}</span><span className={`block text-[10px] font-bold mt-1 ${isRead?'text-gray-500':'text-orange-700'}`}>{isRead?'خوانده‌شده':'خوانده‌نشده'}</span></span>
          </button>
        </CardBody></Card>;
      })}</div>
    </div>;
    if (page==='offers') return <div className="space-y-3">
      {myOffers.length===0 ? <Card><CardBody className="p-4"><Empty title="هنوز پیشنهادی ارسال نشده" text="پیشنهادهای شما برای هر بار بعد از ارسال، جداگانه اینجا نمایش داده می‌شود."/></CardBody></Card> :
        [...myOffers].sort((a,b)=>b.at-a.at).map(offer=>{
          const load=loads.find(l=>l.id===offer.loadId); if(!load) return null;
          const statusText=offer.status==='accepted'?'پذیرفته شد':offer.status==='rejected'?'رد شد':'در انتظار';
          const statusClass=offer.status==='accepted'?'bg-emerald-50 text-emerald-700 border-emerald-200':offer.status==='rejected'?'bg-red-50 text-red-700 border-red-200':'bg-gray-100 text-gray-700 border-gray-200';
          return <button key={offer.loadId} type="button" onClick={()=>openOfferDetail(offer.loadId)} className="block w-full rounded-xl border border-violet-200 bg-violet-50/50 p-3 text-right shadow-sm">
            <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-gray-500">{compactDateTime(offer.at)}</span><span className={'shrink-0 rounded-lg border px-2 py-1 text-[11px] font-black '+statusClass}>{statusText}</span></div>
            <div className="mt-2 flex items-center gap-1 text-sm font-black text-gray-900"><MapPin className="h-4 w-4 shrink-0 text-violet-700"/><span>{load.from}</span><span className="text-gray-400">&gt;</span><span>{load.to}</span></div>
            <div className="mt-1 text-xs font-bold text-gray-600">📦 {load.type}</div>
            <div className="mt-2 text-[10px] font-bold text-violet-800">پیشنهاد قیمت · لمس برای جزئیات</div>
          </button>;
        })}
    </div>;
    if (page==='shipment') return <div className="space-y-4">
      {agreedFollowupLoadId ? (() => {
        const followupLoad = loads.find(l=>l.id===agreedFollowupLoadId);
        if (!followupLoad) return null;
        const commission = Math.round(followupLoad.price * 0.05);
        const scoreChange = Math.max(1, Math.round(commission / 50000));
        return <Card><CardBody className="p-5">
          <div className="flex items-center gap-3"><CheckCircle2 className="w-7 h-7 text-emerald-600"/><div><b>تعیین تکلیف حمل</b><p className="text-xs text-gray-400 mt-1">{followupLoad.from} به {followupLoad.to}</p></div></div>
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm font-bold leading-7">برای این بار توافق ثبت شده است. پس از تعیین نتیجه، امتیاز و کمیسیون مطابق عملکرد شما ثبت می‌شود.</div>
          <div className="grid grid-cols-1 gap-3 mt-4">
            <Button size="full" className="h-14 text-base font-black" onClick={()=>settleShipment(followupLoad,'carried')}>۱. بار را حمل کردم</Button>
            <Button size="full" variant="outline" className="h-14 text-base font-black" onClick={()=>settleShipment(followupLoad,'withdrawn')}>۲. از حمل بار منصرف شدم</Button>
          </div>
        </CardBody></Card>;
      })() : <Card><CardBody className="p-5"><div className="flex items-center gap-3"><Truck className="w-7 h-7 text-primary-600"/><div><b>سفر جاری</b><p className="text-xs text-gray-400 mt-1">در حال حاضر حمل توافق‌شده‌ای برای تعیین تکلیف ندارید.</p></div></div></CardBody></Card>}
    </div>;
    if (page==='wallet') return <div className="space-y-4"><Card><CardBody className="p-6 text-center"><CircleDollarSign className="w-8 h-8 mx-auto text-primary-600"/><p className="text-sm text-gray-400 mt-3">موجودی کیف پول</p><b className={`text-3xl block mt-2 ${walletBalance < 0 ? 'text-red-600' : 'text-gray-900'}`}>{money(walletBalance)} تومان</b><Button className="w-full mt-5" onClick={()=>notify('درگاه پرداخت در فاز دوم متصل می‌شود.')}>افزایش موجودی</Button></CardBody></Card></div>;
    if (page==='transactions') {
      const walletItems = [
        ...walletTransactions.map(item => ({id:item.id, type:item.type, amount:item.amount, at:item.at, title:item.title, description:item.description || (item.source === 'gift' ? 'هدیه افزایش موجودی از طرف اپلیکیشن' : ''), gift:item.source === 'gift'})),
        ...shipmentHistory.filter(item => item.outcome === 'carried' && item.commission > 0).map(item => {
          const load = loads.find(l=>l.id===item.loadId);
          return {id:'commission-'+item.loadId+'-'+item.at, type:'decrease' as const, amount:item.commission, at:item.at, title:'کسر کمیسیون حمل', description:load ? load.from+' ← '+load.to : 'کمیسیون بار', gift:false};
        })
      ].sort((a,b)=>b.at-a.at);
      return <div className="space-y-2">
        {walletItems.length===0 ? <Card><CardBody className="p-4"><Empty title="تراکنشی ثبت نشده" text="سوابق افزایش و کاهش موجودی کیف پول در این بخش نمایش داده می‌شود."/></CardBody></Card> : walletItems.map(item => {
          const incoming = item.type === 'increase';
          const color = incoming ? 'text-emerald-600' : 'text-red-600';
          return <Card key={item.id}><CardBody className="px-3 py-3">
            <div className="flex items-center gap-3">
              <WalletMovementIcon type={item.gift ? 'gift' : incoming ? 'increase' : 'decrease'}/>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm font-black text-gray-900">{item.title}</b>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500"><Clock3 className="h-3.5 w-3.5 shrink-0"/><span>{new Date(item.at).toLocaleDateString('fa-IR')}</span></div>
                {item.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{item.description}</p>}
              </div>
              <b className={`shrink-0 text-sm font-black ${color}`} dir="rtl"><span>{money(item.amount)}</span><span>{incoming?'+':'−'}</span><span className="text-[10px]">تومان</span></b>
            </div>
          </CardBody></Card>;
        })}
      </div>;
    }
    if (page==='vehicle-select') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع خودروی خود را انتخاب کنید</h2></div>
      <div className="space-y-3">
        {(['تریلی','جفت','تک','کامیونت','نیسان و وانت']).map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:label,usage:label==='تریلی'?v.usage:'',feature:''}));if(label==='تریلی'){go('trailer-select');}else if(label==='جفت'){go('jooft-usage');}else if(label==='تک'){go('tak-usage');}else if(label==='کامیونت'){go('komionet-usage');}else if(label==='نیسان و وانت'){go('van-usage');}else{go('vehicle-loader');}}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center"><VehicleIcon type={label}/></span><span className="font-black">{label}</span></span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='jooft-usage') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع کاربری خودرو خود را انتخاب کنید</h2></div>
      <div className="space-y-3">
        {(['روباز','مسقف','کمپرسی','یخچالی']).map(label=><button key={label} type="button" onClick={()=>{
          if(label==='روباز'||label==='مسقف'){
            setVehicleForm(v=>({...v,type:'جفت',usage:label,feature:''}));
            go('jooft-feature');
          }else{
            setVehicleForm(v=>({...v,type:'جفت',usage:'',feature:label}));
            go('vehicle');
          }
        }} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='van-usage') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع کاربری خود را انتخاب کنید</h2></div>
      <div className="space-y-3">
        {(['وانت','نیسان']).map(label=><button key={label} type="button" onClick={()=>{
          setVehicleForm(v=>({...v,type:label,usage:'',feature:''}));
          go('van-feature');
        }} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='van-feature') {
      const featureOptions = ['روباز','مسقف','یخچالدار'];
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">ویژگی بارگیر خود را انتخاب کنید</h2></div>
        <div className="space-y-3">
          {featureOptions.map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,feature:label}));go('vehicle');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
        </div>
      </div>;
    }
    if (page==='komionet-usage') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع بارگیر خود را انتخاب کنید</h2></div>
      <div className="space-y-3">
        {(['روباز','مسقف','کمپرسی','یخچالی']).map(label=><button key={label} type="button" onClick={()=>{
          if(label==='روباز'||label==='مسقف'||label==='یخچالی'){
            setVehicleForm(v=>({...v,type:'کامیونت',usage:label,feature:''}));
            go('komionet-feature');
          }else{
            setVehicleForm(v=>({...v,type:'کامیونت',usage:'کمپرسی',feature:'کمپرسی'}));
            go('vehicle');
          }
        }} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='komionet-feature') {
      const featureOptions = vehicleForm.usage==='روباز'
        ? ['۲ تا ۳ تن','۳ تا ۵ تن','۵ تن به بالا','بغل بازشو']
        : vehicleForm.usage==='مسقف'
          ? ['۲ تا ۳ تن','۳ تا ۵ تن','۵ تن به بالا','اتاق بزرگ']
          : ['۲ تا ۳ تن','۳ تا ۵ تن'];
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">ویژگی بارگیر خود را انتخاب کنید</h2></div>
        <div className="space-y-3">
          {featureOptions.map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:'کامیونت',feature:label}));go('vehicle');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
        </div>
      </div>;
    }
    if (page==='tak-usage') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع کاربری خودرو خود را انتخاب کنید</h2></div>
      <div className="space-y-3">
        {(['روباز','مسقف','کمپرسی','یخچالی']).map(label=><button key={label} type="button" onClick={()=>{
          if(label==='روباز'||label==='مسقف'){
            setVehicleForm(v=>({...v,type:'تک',usage:label,feature:''}));
            go('tak-feature');
          }else{
            setVehicleForm(v=>({...v,type:'تک',usage:'',feature:label}));
            go('vehicle');
          }
        }} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='tak-feature') {
      const featureOptions = vehicleForm.usage==='مسقف' ? ['چادری','فلزی'] : ['معمولی','بغل بازشو'];
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">ویژگی کاربری</h2><p className="text-xs text-gray-400 mt-1">ویژگی {vehicleForm.usage || 'خودرو'} را انتخاب کنید.</p></div>
        <div className="space-y-3">
          {featureOptions.map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:'تک',feature:label}));go('vehicle');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
        </div>
      </div>;
    }
    if (page==='jooft-feature') {
      const featureOptions = vehicleForm.usage==='مسقف' ? ['چادری','فلزی'] : ['معمولی','بغل بازشو'];
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">ویژگی کاربری</h2><p className="text-xs text-gray-400 mt-1">ویژگی {vehicleForm.usage || 'خودرو'} را انتخاب کنید.</p></div>
        <div className="space-y-3">
          {featureOptions.map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,type:'جفت',feature:label}));go('vehicle');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
        </div>
      </div>;
    }
    if (page==='vehicle-dashboard') {
      const vehicleSummary = [vehicleForm.type, vehicleForm.usage, vehicleForm.feature]
        .filter(Boolean)
        .map((value, index) => index > 0 ? value.replace(/^طول\s+/, '') : value)
        .join(' ');
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">خودروی من</h2></div>

        <button type="button" onClick={()=>go('vehicle-select')} className="w-full rounded-lg border border-gray-200 bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">خودروی من</span>
          <span className="mt-1 flex items-center justify-between gap-3">
            <span className="text-lg font-black">{vehicleSummary || 'خودرو ثبت نشده'}</span>
            <ChevronLeft className="w-5 h-5 text-gray-500 shrink-0"/>
          </span>
        </button>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
          <span className="block text-xs font-bold text-gray-400 mb-3">شماره پلاک</span>
          <div className="mx-auto flex h-16 max-w-[330px] items-stretch overflow-hidden rounded-lg border-2 border-gray-800 bg-white" dir="ltr">
            <div className="flex w-12 items-center justify-center bg-primary-700 text-white">
              <span className="text-[9px] font-black leading-3 text-center">IR<br/>IRAN</span>
            </div>
            <input aria-label="دو رقم پلاک" value={plateParts[0]} onChange={e=>updatePlatePart(0,e.target.value.replace(/\\D/g,'').slice(0,2))} inputMode="numeric" pattern="[0-9]*" maxLength={2} placeholder="۷۹" className="w-12 border-0 border-r border-gray-300 bg-transparent text-center text-xl font-black outline-none"/>
            <button type="button" aria-label="انتخاب حرف پلاک" className="w-12 border-0 border-r border-gray-300 bg-transparent text-center text-xl font-black outline-none" onClick={()=>document.getElementById('plate-letters')?.scrollIntoView({behavior:'smooth',block:'nearest'})}>{plateParts[2] || 'ع'}</button>
            <input aria-label="سه رقم پلاک" value={plateParts[1]} onChange={e=>updatePlatePart(1,e.target.value.replace(/\\D/g,'').slice(0,3))} inputMode="numeric" pattern="[0-9]*" maxLength={3} placeholder="۲۳۴" className="w-[72px] border-0 border-r border-gray-300 bg-transparent text-center text-xl font-black outline-none"/>
            <div className="flex w-16 flex-col items-center justify-center border-r border-gray-300 bg-white leading-none">
              <span className="text-[9px] font-black">ایران</span>
              <input aria-label="کد شهر" value={plateParts[3]} onChange={e=>updatePlatePart(3,e.target.value.replace(/\\D/g,'').slice(0,2))} inputMode="numeric" pattern="[0-9]*" maxLength={2} placeholder="۵۶" className="w-10 border-0 bg-transparent text-center text-lg font-black outline-none"/>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] font-bold text-gray-400">عددها با کیبورد عددی وارد می‌شوند؛ حرف از فهرست زیر انتخاب می‌شود.</p>

          <div id="plate-letters" className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <span className="block text-xs font-black text-gray-500 mb-2">انتخاب حرف پلاک</span>
            <div className="grid grid-cols-4 gap-2">
              {plateLetters.map(letter=><button key={letter} type="button" onClick={()=>updatePlatePart(2,letter)} className={`rounded-xl border-2 px-2 py-2.5 text-base font-black transition-colors ${plateParts[2]===letter?'border-primary-600 bg-primary-50 text-primary-700':'border-gray-200 bg-white text-gray-800'}`}>{letter}</button>)}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-bold text-gray-400">شماره هوشمند ناوگان</span>
              <b className="block mt-1 text-base font-black">ثبت نشده</b>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 border border-gray-200">
              <CarFront className="w-5 h-5 text-primary-600"/>
            </span>
          </div>
        </div>
      </div>;
    }
    if (page==='vehicle') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">خودروی من</h2><p className="text-xs text-gray-400 mt-1">مشخصات خودرو را بررسی یا ویرایش کنید.</p></div>
      <div className="space-y-3">
        <button type="button" onClick={()=>go('vehicle-select')} className="w-full rounded-lg border border-gray-200 bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">نوع خودرو</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.type}</span>
        </button>
        {vehicleForm.usage && <button type="button" onClick={()=>go('trailer-select')} className="w-full rounded-lg border border-gray-200 bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">نوع کاربری</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.usage}</span>
        </button>}
        {vehicleForm.feature && <button type="button" onClick={()=>go(vehicleForm.type==='جفت' ? 'jooft-feature' : vehicleForm.type==='تک' ? 'tak-feature' : vehicleForm.usage==='کفی'||vehicleForm.usage==='بغلدار'||vehicleForm.usage==='چادری' ? 'flatbed-size' : 'trailer-select')} className="w-full rounded-lg border border-gray-200 bg-white p-4 text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="block text-xs font-bold text-gray-400">ویژگی کاربری</span>
          <span className="block mt-1 text-lg font-black">{vehicleForm.feature}</span>
        </button>}
      </div>
      <Button size="full" className="h-14 text-base font-black mt-2" disabled={!vehicleForm.type || !vehicleForm.feature} onClick={()=>{window.localStorage.setItem('bbberah_vehicle_v1',JSON.stringify(vehicleForm));notify('خودرو با موفقیت ثبت و ذخیره شد.');goHome();}}>ثبت خودرو</Button>
    </div>;
    if (page==='trailer-select') return <div className="space-y-4">
      <div className="px-1"><h2 className="font-black text-lg">نوع کاربری</h2><p className="text-xs text-gray-400 mt-1">نوع کاربری تریلی را انتخاب کنید.</p></div>
      <div className="space-y-3">
        {(['تیغه','کمپرسی','تانکر','یخچالی','کفی','بغلدار','چادری']).map(label=><button key={label} type="button" onClick={()=>{
          if(label==='کفی'||label==='بغلدار'||label==='چادری'){
            setVehicleForm(v=>({...v,type:'تریلی',usage:label,feature:''}));
            go('flatbed-size');
          }else{
            setVehicleForm(v=>({...v,type:'تریلی',usage:'',feature:label}));
            go('vehicle');
          }
        }} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform">
          <span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/>
        </button>)}
      </div>
    </div>;
    if (page==='flatbed-size') {
      const featureOptions = vehicleForm.usage==='بغلدار'
        ? ['طول ۹','طول ۱۱','طول ۱۲.۲۰','طول ۱۲.۶۰','طول ۱۳.۶۰']
        : vehicleForm.usage==='چادری'
          ? ['ارتفاع ۲.۷۰','ارتفاع ۲۹۰','ارتفاع ۳']
          : ['طول ۹','طول ۱۱','طول ۱۲.۲۰','طول ۱۲.۶۰','طول ۱۳.۶۰','کفی کشویی'];
      return <div className="space-y-4">
        <div className="px-1"><h2 className="font-black text-lg">ویژگی کاربری</h2><p className="text-xs text-gray-400 mt-1">ویژگی {vehicleForm.usage || 'بارگیر'} را انتخاب کنید.</p></div>
        <div className="space-y-3">
          {featureOptions.map(label=><button key={label} type="button" onClick={()=>{setVehicleForm(v=>({...v,feature:label}));go('vehicle');}} className="w-full rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between text-right shadow-[0_4px_14px_rgba(0,0,0,0.10)] active:scale-[0.99] transition-transform"><span className="font-black">{label}</span><ChevronLeft className="w-5 h-5 text-gray-500"/></button>)}
        </div>
      </div>;
    }
    
    if (page==='account') return <Card><CardBody className="p-5 space-y-1">
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">نام و نام خانوادگی</span><b className="text-sm">{profile?.full_name || accountName || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">کد ملی</span><b className="text-sm">{(profile as any)?.national_id || 'ثبت نشده'}</b></div>
      <div className="flex items-center justify-between py-4 border-b border-gray-100"><span className="text-sm font-bold text-gray-500">موبایل</span><b className="text-sm" dir="ltr">{profile?.phone || 'ثبت نشده'}</b></div>
      <button type="button" onClick={()=>go('verification')} className="w-full flex items-center justify-between py-4 border-b border-gray-100 text-right"><span className="text-sm font-bold text-gray-500">احراز هویت</span><span className={identityVerified ? 'text-sm font-black text-emerald-600' : identityPending ? 'text-sm font-black text-orange-500' : 'text-sm font-black text-gray-500'}>{identityVerified ? '✓ تایید شده' : identityPending ? 'در انتظار تایید' : 'ارسال مدارک'}</span></button>
      <div className="flex items-center justify-between py-4"><span className="text-sm font-bold text-gray-500">شماره هوشمند راننده</span><b className="text-sm">{(profile as any)?.driver_smart_number || 'ثبت نشده'}</b></div>
    </CardBody></Card>;
    if (page==='support') return <div className="space-y-3"><Card><CardBody className="p-5"><Headset className="w-7 h-7 text-primary-600"/><h3 className="font-black mt-3">مرکز پشتیبانی</h3><p className="text-sm text-gray-500 leading-7 mt-2">برای مشکلات حساب، بار یا سفر، موضوع خود را از مسیرهای زیر پیگیری کنید.</p><div className="grid grid-cols-2 gap-2 mt-4"><Button size="sm" variant="outline" onClick={()=>notify('چت پشتیبانی در نسخه نهایی فعال می‌شود.')}>گفتگوی آنلاین</Button><a href="tel:02100000000" className="min-h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center gap-2 text-sm font-bold"><Phone className="w-4 h-4"/> تماس</a></div></CardBody></Card><Card><CardBody><b>وضعیت سرویس</b><div className="mt-3 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle2 className="w-4 h-4"/> همه بخش‌های آزمایشی فعال هستند</div></CardBody></Card></div>;
    if (page==='display') return <Card><CardBody className="p-5 space-y-4">
      <div><h3 className="font-black text-lg">تنظیمات برنامه</h3><p className="text-sm text-gray-500 mt-1">برای تغییر سریع، از آیکون بالای صفحه استفاده کنید. لمس کوتاه روز/شب را عوض می‌کند و نگه‌داشتن، حالت خودکار را فعال می‌کند.</p></div>
      {([['day','حالت روز',Sun],['night','حالت شب',Moon],['auto','حالت خودکار',Monitor]] as const).map(([mode,label,Icon])=><button type="button" key={mode} onClick={()=>setDisplayMode(mode)} className={`w-full flex items-center gap-3 rounded-xl border p-4 text-right ${displayMode===mode?'border-primary-500 bg-primary-50':'border-gray-100 bg-gray-50'}`}><Icon className="w-5 h-5 text-primary-600"/><span className="flex-1 font-bold text-sm">{label}</span><span className={`text-xs font-black ${displayMode===mode?'text-primary-700':'text-gray-400'}`}>{displayMode===mode?'فعال':'انتخاب'}</span></button>)}
    </CardBody></Card>;
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
        <div className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900 leading-7"><b>توجه حقوقی:</b> این متن برای استفاده در اپلیکیشن براه تنظیم شده و پیش از انتشار عمومی باید توسط مشاور حقوقی براه با اطلاعات ثبتی، قوانین حمل‌ونقل و سیاست حریم خصوصی نهایی تطبیق داده شود.</div>
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

  const currentPageTitle = title[page] || 'براه';
  const pageHelpText:Partial<Record<Page,string>> = {
    calls:'در این صفحه سوابق تماس‌ها و پیشنهادهای قیمت خود را یکجا می‌بینید.',
    profile:'از این بخش می‌توانید به اطلاعات حساب و امکانات کاربری دسترسی داشته باشید.',
    account:'در این بخش اطلاعات شخصی و وضعیت احراز هویت نمایش داده می‌شود.',
    notifications:'اعلان‌های برنامه را ببینید و وضعیت خوانده‌شدن هر پیام را مشخص کنید.',
    display:'از این بخش می‌توانید حالت نمایش روز، شب یا خودکار را انتخاب کنید.',
    offers:'پیشنهادهای قیمت ثبت‌شده و وضعیت آن‌ها در این بخش نمایش داده می‌شود.',
    support:'از این بخش می‌توانید برای پیگیری مشکلات حساب، بار یا سفر اقدام کنید.'
  };
  const OfferDetailModal = () => {
    const detailOffer = myOffers.find(o=>o.loadId===offerDetailLoadId);
    const detailLoad = loads.find(l=>l.id===offerDetailLoadId);
    if (!offerDetailLoadId || !detailOffer || !detailLoad) return null;
    return <div className="fixed inset-0 z-[80] bg-black/40 flex items-end justify-center p-0" onClick={closeOfferDetail}>
      <div className="w-full max-w-lg rounded-t-[28px] bg-white p-5 pb-7 shadow-2xl" onClick={e=>e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black text-gray-900">جزئیات پیشنهاد قیمت</h3><button type="button" onClick={closeOfferDetail} aria-label="بستن" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><X className="w-5 h-5"/></button></div>
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <div className="text-center text-lg font-black text-gray-900"><span>⚫️{detailLoad.from}</span><span className="mx-2 text-gray-400">---&gt;</span><span className="text-primary-600">🔵{detailLoad.to}</span></div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><WeightIcon className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">وزن بار</span><b className="block mt-1 text-sm font-black text-gray-900">{fa(detailLoad.weight)} کیلو</b></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><Package className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">نوع بار</span><b className="block mt-1 text-sm font-black text-gray-900">{detailLoad.type}</b></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><CircleDollarSign className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">کرایه اعلامی</span><b className="block mt-1 text-sm font-black text-gray-900">{money(detailLoad.price)} تومان</b></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3 text-center"><Route className="mx-auto w-5 h-5 text-gray-500"/><span className="block mt-1 text-xs font-bold text-gray-400">قیمت پیشنهادی</span><b className="block mt-1 text-sm font-black text-gray-900">{money(detailOffer.price)} تومان</b></div>
          </div>
          <p className="mt-4 text-sm font-bold leading-7 text-gray-700">{detailLoad.description}</p>
          <div className="mt-3 rounded-xl bg-white p-3 text-sm"><span className="text-gray-500">وضعیت پیشنهاد: </span><b className="text-gray-900">{detailOffer.status==='accepted'?'پذیرفته شد':detailOffer.status==='rejected'?'رد شد':'در انتظار'}</b></div>
        </div>
      </div>
    </div>;
  };

  return <div dir="rtl" data-theme={effectiveDark ? "dark" : "light"} className={`${page === 'home' ? 'min-h-[100dvh] overflow-x-hidden overscroll-y-auto' : 'min-h-screen'} ${effectiveDark ? "bg-gray-950 text-gray-100" : "bg-[#f8faff] text-gray-900"}`}>
    {page==='home' ? <Header/> : <div className="max-w-lg mx-auto px-4 pt-4">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <button type="button" onClick={()=>{if(page==='search'){goHome();}else if(page==='profile'){goHome();}else if(window.history.state?.bbberahPage){window.history.back();}else{goHome();}}} className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-gray-600 bg-white border border-gray-200" aria-label="بازگشت" title="بازگشت"><ArrowRight className="w-5 h-5"/></button>
        <h1 className="flex-1 text-center text-lg font-black">{currentPageTitle}</h1>
        <button type="button" onClick={()=>setShowPageHelp(true)} className="w-10 h-10 shrink-0 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary-600" aria-label="توضیحات این صفحه" title="توضیحات این صفحه"><Info className="w-5 h-5"/></button>
      </div>
    </div>}
    <main key={page} style={{ viewTransitionName: "app-page" }} className={`max-w-lg mx-auto px-4 pt-3 ${page === 'home' ? 'pb-2 h-[calc(100dvh-8rem)] min-h-0 overflow-hidden flex flex-col' : 'pb-24'}`}>
      {pendingContactLoadId && page!=='contact-report' && <button type="button" onClick={()=>{const load=loads.find(l=>l.id===pendingContactLoadId); if(load){setSelected(load);go('contact-report');}}} className="w-full mb-4 rounded-lg border-2 border-amber-200 bg-amber-50 p-4 text-right text-amber-900 shadow-sm"><b className="block">⚠️ این بار هنوز تعیین تکلیف نشده است</b><span className="block text-xs font-bold mt-1">نتیجه تماس را ثبت کنید تا این یادآوری بسته شود.</span></button>}
      {page==='home' ? <HomePage/> : page==='search' ? <SearchPage/> : page==='profile' ? <AccountHome/> : page==='cargo-detail' ? <DetailPage/> : page==='verification' ? <VerificationPage/> : page==='vehicle-dashboard' ? <SimplePage/> : page==='vehicle-select' ? <SimplePage/> : page==='vehicle' ? <SimplePage/> : page==='vehicle-loader' ? <SimplePage/> : page==='trailer-select' ? <SimplePage/> : page==='jooft-usage' ? <SimplePage/> : page==='jooft-feature' ? <SimplePage/> : page==='tak-usage' ? <SimplePage/> : page==='tak-feature' ? <SimplePage/> : page==='komionet-usage' ? <SimplePage/> : page==='komionet-feature' ? <SimplePage/> : page==='van-usage' ? <SimplePage/> : page==='van-feature' ? <SimplePage/> : page==='flatbed-size' ? <SimplePage/> : page==='report' ? <ViolationReportPage/> : page==='origin-select' ? <LocationSelectPage mode="origin"/> : page==='destination-select' ? <LocationSelectPage mode="destination"/> : page==='nearby-destination-select' ? <LocationSelectPage mode="nearby-destination"/> : page==='nearby-results' ? <NearbyResultsPage/> : page==='destination-all' ? <AllDestinationCitiesPage/> : page==='frequent-route' ? <FrequentRoutePage/> : page==='contact-report' ? <ContactReportPage/> : <SimplePage/>}
    </main>
    <BottomNav />
    <Toast message={toast} onClose={()=>setToast('')} />
    {showPageHelp && <div className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-5" onClick={()=>setShowPageHelp(false)}><div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl text-gray-900" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between gap-3"><h3 className="font-black text-lg">درباره {currentPageTitle}</h3><button type="button" onClick={()=>setShowPageHelp(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center" aria-label="بستن"><X className="w-4 h-4"/></button></div><p className="mt-3 text-sm leading-7 text-gray-600">{pageHelpText[page] || `این بخش برای مشاهده و مدیریت «${currentPageTitle}» در برنامه براه استفاده می‌شود.`}</p><Button className="w-full mt-4" onClick={()=>setShowPageHelp(false)}>متوجه شدم</Button></div></div>}
    <OfferDetailModal/>
    {shipmentRewardSummary && <div className="fixed inset-0 z-[75] bg-black/40 flex items-center justify-center p-5">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 flex items-center justify-center"><Star className="w-6 h-6 text-emerald-600"/></div>
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
    {page==='shipment' && shipmentStage==='delivered' && <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-lg px-4"><div className="rounded-lg bg-white border shadow-xl p-4"><b>سفر با موفقیت تحویل شد</b><p className="text-xs text-gray-500 mt-1">صاحب کالا امتیاز راننده را ثبت می‌کند.</p><div className="flex gap-2 mt-3" dir="ltr">{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setOwnerDriverRating(n)} className={`text-3xl ${n<=ownerDriverRating?'text-amber-400':'text-gray-300'}`}>★</button>)}</div><Button className="w-full mt-3" onClick={()=>notify(ownerDriverRating?'امتیاز صاحب کالا ثبت شد.':'لطفاً امتیاز را انتخاب کنید.')}>ثبت امتیاز راننده</Button></div></div>}
    {offerOpen && selected && <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center overscroll-none" style={{touchAction:"none"}} onTouchMove={e=>e.preventDefault()} onWheel={e=>e.preventDefault()}><div className="w-full max-w-lg bg-white rounded-t-[28px] p-5 pb-7 select-none overscroll-none" onTouchStart={e=>{const target=e.target as HTMLElement;if(target.closest('button,a,[role="slider"]'))return;offerTouchStartY.current=e.touches[0].clientY;}} onTouchMove={e=>{const start=offerTouchStartY.current;if(start===null)return;e.preventDefault();setOfferDragY(Math.max(0,e.touches[0].clientY-start));}} onTouchEnd={e=>{const start=offerTouchStartY.current;offerTouchStartY.current=null;if(start!==null){const delta=e.changedTouches[0].clientY-start;if(delta>70){setOfferOpen(false);setOfferDragY(0);}else setOfferDragY(0);}}} style={{transform:`translateY(${offerDragY}px)`,transition:offerTouchStartY.current===null?'transform 180ms ease-out':'none',touchAction:"none"}}> <div className="w-12 h-1.5 rounded-full bg-gray-300 mx-auto mb-3 touch-none" aria-hidden="true"/><div className="flex items-center justify-between"><h3 className="font-black text-lg">ثبت پیشنهاد</h3><button onClick={()=>setOfferOpen(false)} className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><X className="w-5 h-5"/></button></div><p className="text-sm text-gray-500 mt-2">{selected.title}</p><div className="mt-4 rounded-lg bg-gray-50 p-4"><div className="flex items-center justify-between"><span className="text-base font-bold text-gray-500">قیمت اعلامی</span><b className="text-xl font-black">{money(selected.price)} تومان</b></div></div><div className="mt-4"><label className="block text-base font-bold text-gray-700">قیمت پیشنهادی</label><div className="mt-2 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-center text-xl font-black text-gray-900" dir="ltr">{money(Number(offerPrice)||0)} تومان</div><div className="mt-4 px-1" dir="ltr">
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
  
</div></div>{!termsAccepted && <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold"><label className="flex items-center gap-3"><input type="checkbox" checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} className="w-5 h-5 accent-primary-600"/><span>قوانین و مقررات را مطالعه کردم و می‌پذیرم.</span></label><button type="button" className="mt-2 text-primary-600 font-black underline underline-offset-2" onClick={()=>{setOfferOpen(false);setOfferDragY(0);go('rules');}}>مشاهده قوانین و مقررات</button></div>}<Button size="full" className="mt-4 h-14 text-base font-black" disabled={actionBusy} onClick={submitOffer}>{actionBusy?'در حال ثبت...':'ارسال پیشنهاد'}</Button></div></div>}
  </div>;
}