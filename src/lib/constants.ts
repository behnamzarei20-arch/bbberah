import type {
  CargoType,
  LoadingType,
  OfferStatus,
  ShipmentStatus,
  VehicleType,
  VerificationStatus,
  CargoStatus,
} from '@/types';

export const APP_NAME = 'براه';
export const APP_TAGLINE = 'بازارگاه حمل و نقل هوشمند';

export const CITIES: string[] = [
  'تهران',
  'مشهد',
  'اصفهان',
  'کرج',
  'شیراز',
  'تبریز',
  'اهواز',
  'قم',
  'کرمان',
  'رشت',
  'یزد',
  'اراک',
  'بندرعباس',
  'ارومیه',
  'زاهدان',
  'گرگان',
  'همدان',
  'کرمانشاه',
  'سنندج',
  'خرم آباد',
  'ساری',
  'بجنورد',
  'بیرجند',
  'ایلام',
  'قزوین',
  'مرکزی (اراک)',
  'ساوه',
  'نجف آباد',
  'ورامین',
  'کاشان',
];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  truck_light: 'کامیون سبک',
  truck_medium: 'کامیون متوسط',
  truck_heavy: 'کامیون سنگین',
  trailer: 'تریلر',
  pickup: 'وانت',
  van: 'مینی بوس / ون',
};

export const VEHICLE_TYPES: VehicleType[] = [
  'pickup',
  'van',
  'truck_light',
  'truck_medium',
  'truck_heavy',
  'trailer',
];

export const CARGO_TYPE_LABELS: Record<CargoType, string> = {
  general: 'عمومی',
  construction: 'مصالح ساختمانی',
  food: 'مواد غذایی',
  industrial: 'صنعتی',
  agricultural: 'کشاورزی',
  hazardous: 'مواد خطرناک',
  refrigerated: 'سردخانه‌ای',
  vehicles: 'خودرو',
  other: 'سایر',
};

export const CARGO_TYPES: CargoType[] = [
  'general',
  'construction',
  'food',
  'industrial',
  'agricultural',
  'hazardous',
  'refrigerated',
  'vehicles',
  'other',
];

export const LOADING_TYPE_LABELS: Record<LoadingType, string> = {
  manual: 'دستی',
  forklift: 'لیفت تراک',
  crane: 'جرثقیل',
  ramp: 'رمپ',
};

export const LOADING_TYPES: LoadingType[] = ['manual', 'forklift', 'crane', 'ramp'];

export const CARGO_STATUS_LABELS: Record<CargoStatus, string> = {
  open: 'باز',
  assigned: 'اختصاص یافته',
  in_transit: 'در حال حمل',
  delivered: 'تحویل داده شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
  expired: 'منقضی شده',
};

export const CARGO_STATUS_COLORS: Record<CargoStatus, string> = {
  open: 'bg-primary-100 text-primary-700',
  assigned: 'bg-accent-100 text-accent-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-success-100 text-success-700',
  completed: 'bg-success-100 text-success-700',
  cancelled: 'bg-error-100 text-error-700',
  expired: 'bg-gray-200 text-gray-600',
};

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  pending: 'در انتظار',
  accepted: 'پذیرفته شده',
  rejected: 'رد شده',
  withdrawn: 'برداشته شده',
};

export const OFFER_STATUS_COLORS: Record<OfferStatus, string> = {
  pending: 'bg-accent-100 text-accent-700',
  accepted: 'bg-success-100 text-success-700',
  rejected: 'bg-error-100 text-error-700',
  withdrawn: 'bg-gray-200 text-gray-600',
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  created: 'ایجاد شده',
  accepted: 'پذیرفته شده',
  picked_up: 'بارگیری شده',
  in_transit: 'در حال حمل',
  delivered: 'تحویل داده شده',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  created: 'bg-gray-100 text-gray-700',
  accepted: 'bg-blue-100 text-blue-700',
  picked_up: 'bg-accent-100 text-accent-700',
  in_transit: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success-100 text-success-700',
  completed: 'bg-success-600 text-white',
  cancelled: 'bg-error-100 text-error-700',
};

export const SHIPMENT_STATUS_FLOW: ShipmentStatus[] = [
  'created',
  'accepted',
  'picked_up',
  'in_transit',
  'delivered',
  'completed',
];

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  unverified: 'تأیید نشده',
  pending: 'در حال بررسی',
  verified: 'تأیید شده',
  rejected: 'رد شده',
};

export const VERIFICATION_STATUS_COLORS: Record<VerificationStatus, string> = {
  unverified: 'bg-gray-100 text-gray-600',
  pending: 'bg-accent-100 text-accent-700',
  verified: 'bg-success-100 text-success-700',
  rejected: 'bg-error-100 text-error-700',
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  offer_received: 'پیشنهاد جدید',
  offer_accepted: 'پذیرش پیشنهاد',
  offer_rejected: 'رد پیشنهاد',
  offer_withdrawn: 'بازگشت پیشنهاد',
  shipment_created: 'حمل جدید',
  shipment_status_update: 'به‌روزرسانی حمل',
  shipment_pickup_confirmed: 'تأیید بارگیری',
  shipment_delivery_confirmed: 'تأیید تحویل',
  rating_received: 'امتیاز جدید',
  verification_update: 'به‌روزرسانی احراز',
  vehicle_approved: 'تأیید خودرو',
  admin_message: 'پیام مدیر',
  return_cargo_suggestion: 'پیشنهاد بار برگشت',
};

export const COMMISSION_RATE = 0;
export const COMMISSION_LABEL = `کمیسیون براه (۰٪)`;
