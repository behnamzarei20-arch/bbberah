import { Menu, Bell } from 'lucide-react';
import { fa } from '@/lib/format';

type HeaderProps = {
  notifications: number;
  onOpenMenu: () => void;
  onGoHome: () => void;
  onOpenNotifications: () => void;
};

const Header = ({
  notifications,
  onOpenMenu,
  onGoHome,
  onOpenNotifications,
}: HeaderProps) => (
  <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
    <div className="max-w-lg mx-auto h-16 px-4 flex items-center justify-between">
      <button
        className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
        onClick={onOpenMenu}
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      <button
        onClick={onGoHome}
        className="font-black text-2xl tracking-tight text-primary-700"
      >
        براه
      </button>

      <button
        onClick={onOpenNotifications}
        className="relative w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"
        aria-label="اعلان‌ها"
      >
        <Bell className="w-5 h-5" />
        {notifications > 0 && (
          <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center">
            {fa(notifications)}
          </span>
        )}
      </button>
    </div>
  </header>
);

export default Header;