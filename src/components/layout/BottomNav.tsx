import { cn } from '@/lib/utils';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import type { ReactNode } from 'react';

export type TabKey = 'home' | 'discover' | 'create' | 'notifications' | 'profile';

interface BottomNavProps {
  active: TabKey;
  onChange: (key: TabKey) => void;
  showCreate?: boolean;
  createLabel?: string;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

export function BottomNav({ active, onChange, showCreate = false }: BottomNavProps) {
  const items: NavItem[] = [
    { key: 'home', label: 'خانه', icon: <Home className="w-5 h-5" /> },
    { key: 'discover', label: 'بارها', icon: <Search className="w-5 h-5" /> },
    ...(showCreate ? [{ key: 'create' as TabKey, label: 'ثبت بار', icon: <Plus className="w-5 h-5" /> }] : []),
    { key: 'notifications', label: 'اعلان‌ها', icon: <Bell className="w-5 h-5" /> },
    { key: 'profile', label: 'پروفایل', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto flex items-stretch justify-around px-2 py-1">
        {items.map((item) => {
          const isActive = active === item.key;
          const isCreate = item.key === 'create';
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]',
                isCreate && isActive
                  ? 'text-primary-600'
                  : isCreate
                  ? 'text-primary-500'
                  : isActive
                  ? 'text-primary-600'
                  : 'text-gray-400'
              )}
            >
              {isCreate ? (
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  isActive ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-600'
                )}>
                  {item.icon}
                </div>
              ) : (
                <>
                  <div className={cn('transition-transform', isActive && 'scale-110')}>
                    {item.icon}
                  </div>
                  <span className={cn('text-[11px] font-medium', isActive && 'font-semibold')}>
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
