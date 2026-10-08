import type { Load } from '../types';

export const seedLoads: Load[] = [
  { id:'l1', title:'بار خشک تهران به مشهد', from:'تهران', to:'مشهد', type:'بار خشک', vehicle:'تریلی', weight:18000, price:24500000, pickup:'امروز، ۱۴:۳۰', delivery:'فردا، ۱۰:۰۰', status:'open', distance:18, routeDistance:897, description:'بار خشک بسته‌بندی‌شده؛ بارگیری در محل اعلام‌شده و تحویل طبق زمان‌بندی.', phone:'09120000001' },
  { id:'l2', title:'مواد غذایی کرج به اصفهان', from:'کرج', to:'اصفهان', type:'مواد غذایی', vehicle:'کامیون', weight:9000, price:12800000, pickup:'فردا، ۰۸:۰۰', delivery:'فردا، ۲۰:۰۰', status:'open', distance:42, routeDistance:435, description:'مواد غذایی بسته‌بندی‌شده؛ نیازمند حمل مناسب و تحویل در بازه تعیین‌شده.', phone:'09120000002' },
  { id:'l3', title:'کالای تجاری تبریز به تهران', from:'تبریز', to:'تهران', type:'کالای تجاری', vehicle:'خاور', weight:4500, price:8600000, pickup:'فردا، ۱۱:۳۰', delivery:'پس‌فردا، ۰۹:۰۰', status:'open', distance:76, routeDistance:630, description:'کالای تجاری بسته‌بندی‌شده؛ جزئیات محموله هنگام هماهنگی حمل اعلام می‌شود.', phone:'09120000003' },
  { id:'l4', title:'مصالح ساختمانی قم به تهران', from:'قم', to:'تهران', type:'ساختمانی', vehicle:'تریلی', weight:22000, price:16400000, pickup:'شنبه، ۰۷:۰۰', delivery:'شنبه، ۱۳:۰۰', status:'reserved', distance:96, routeDistance:140, description:'مصالح ساختمانی بسته‌بندی‌شده؛ هماهنگی بارگیری و تحویل طبق برنامه حمل.', phone:'09120000004' },
  { id:'l5', title:'بار کشاورزی رشت به قزوین', from:'رشت', to:'قزوین', type:'کشاورزی', vehicle:'کامیون', weight:7500, price:9700000, pickup:'شنبه، ۰۹:۰۰', delivery:'شنبه، ۱۶:۰۰', status:'open', distance:118, routeDistance:178, description:'بار کشاورزی بسته‌بندی‌شده؛ شرایط حمل و زمان تحویل هنگام هماهنگی اعلام می‌شود.', phone:'09120000005' },
];

export const frequentRoutes = [
  { from:'تهران', to:'مشهد' },
  { from:'کرج', to:'اصفهان' },
  { from:'تبریز', to:'تهران' },
];