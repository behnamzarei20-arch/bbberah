import { Home, Search, PhoneCall, User } from 'lucide-react';
import type { Page } from '@/types';

type BottomNavProps = {
  page: Page;
  onGo: (p: Page) => void;
  onOpenSearch: () => void;
};

const BottomNav = ({ page, onGo, onOpenSearch }: BottomNavProps) => (
  <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-gray-100 bg-white/95 backdrop-blur">
    <div className="max-w-lg mx-auto grid grid-cols-4 h-[72px]">
      <button
        onClick={() => onGo('home')}
        className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
          page === 'home' ? 'text-primary-700 font-black' : 'text-gray-400'
        }`}
      >
        <Home className="w-5 h-5" />
        خانه
      </button>

      <button
        onClick={onOpenSearch}
        className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
          page === 'search' ? 'text-primary-700 font-black' : 'text-gray-400'
        }`}
      >
        <Search className="w-5 h-5" />
        جستجو
      </button>

      <button
        onClick={() => onGo('calls')}
        className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
          page === 'calls' ? 'text-primary-700 font-black' : 'text-gray-400'
        }`}
      >
        <PhoneCall className="w-5 h-5" />
        تماس‌ها
      </button>

      <button
        onClick={() => onGo('profile')}
        className={`flex flex-col items-center justify-center gap-1 text-[11px] ${
          page === 'profile' ? 'text-primary-700 font-black' : 'text-gray-400'
        }`}
      >
        <User className="w-5 h-5" />
        حساب
      </button>
    </div>
  </nav>
);

export default BottomNav;
