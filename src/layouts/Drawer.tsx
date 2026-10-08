import {
  X,
  User,
  CarFront,
  WalletCards,
  ReceiptText,
  Truck,
  Headphones,
  FileText,
  Settings,
  ChevronLeft,
  LogOut,
} from 'lucide-react';
import type { Page } from '@/types';

type DrawerProps = {
  isOpen: boolean;
  profile: { full_name?: string; phone?: string } | null;
  onClose: () => void;
  onGo: (p: Page) => void;
  onSignOut: () => void;
};

const Drawer = ({
  isOpen,
  profile,
  onClose,
  onGo,
  onSignOut,
}: DrawerProps) =>
  isOpen ? (
    <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}>
      <aside
        className="absolute right-0 top-0 bottom-0 w-[82%] max-w-sm bg-white p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <b className="text-xl">{profile?.full_name || 'کاربر براه'}</b>
            <span className="block text-xs text-gray-400 mt-1">
              {profile?.phone}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onGo('profile')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <User className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">حساب کاربری</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('vehicle')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <CarFront className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">خودروی من</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('wallet')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <WalletCards className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">کیف پول</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('offers')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <ReceiptText className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">پیشنهادهای من</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('shipment')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <Truck className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">سفر جاری</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('support')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <Headphones className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">پشتیبانی</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('rules')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <FileText className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">قوانین و مقررات</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={() => onGo('display')}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-primary-50"
          >
            <Settings className="w-5 h-5 text-primary-600" />
            <span className="flex-1 font-bold text-sm">تنظیمات ظاهری</span>
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>

          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-right text-red-600 mt-3"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold text-sm">خروج از حساب</span>
          </button>
        </div>
      </aside>
    </div>
  ) : null;

export default Drawer;
