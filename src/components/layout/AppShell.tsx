import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
  className?: string;
}

export function AppShell({ children, header, bottomNav, className }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {header}
      <main className={cn('flex-1 w-full max-w-lg mx-auto px-4 py-4', bottomNav && 'pb-24', className)}>
        {children}
      </main>
      {bottomNav}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, onBack, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 mb-4', className)}>
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 -mr-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 truncate">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
