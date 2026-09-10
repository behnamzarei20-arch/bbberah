import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Search, Plus, Bell, User } from 'lucide-react';
import type { ReactNode } from 'react';

export type TabKey = 'home' | 'discover' | 'create' | 'notifications' | 'profile';

interface NavItem {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  active?: TabKey;
  onChange?: (key: TabKey) => void;
  showCreate?: boolean;
}

export function BottomNav({ active, onChange, showCreate = true }: BottomNavProps) {
  const [internalActive, setInternalActive] = useState<TabKey>('home');
  const current = active ?? internalActive;
  const handleChange = (key: TabKey) => {
    setInternalActive(key);
    onChange?.(key);
  };

  const items: NavItem[] = [
    { key: 'home', label: 'خانه', icon: <Home className="w-5 h-5" /> },
    { key: 'discover', label: 'بارها', icon: <Search className="w-5 h-5" /> },
    ...(showCreate ? [{ key: 'create' as TabKey, label: 'ثبت بار', icon: <Plus className="w-5 h-5" /> }] : []),
    { key: 'notifications', label: 'اعلان‌ها', icon: <Bell className="w-5 h-5" /> },
    { key: 'profile', label: 'پروفایل', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 shadow-lg">
      <div className="max-w-lg mx-auto flex items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const isActive = current === item.key;
          const isCreate = item.key === 'create';
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleChange(item.key)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {isCreate ? (
                <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center -mt-4 border-4 border-gray-50 shadow-md transition-transform', isActive ? 'bg-primary-600 text-white scale-105' : 'bg-white text-primary-600')}>
                  {item.icon}
                </div>
              ) : (
                <div className={cn('transition-transform', isActive && 'scale-110')}>{item.icon}</div>
              )}
              <span className={cn('text-[10px] font-medium', isActive && 'font-bold')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
