import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function StatCard({ icon, label, value, color = 'text-primary-600 bg-primary-50', className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-4 shadow-sm', className)}>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400 truncate">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

interface RatingStarsProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function RatingStars({ value, size = 'md', showValue = true, className }: RatingStarsProps) {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            sizeClass,
            i <= Math.round(value)
              ? 'fill-accent-400 text-accent-400'
              : 'fill-gray-200 text-gray-200'
          )}
        />
      ))}
      {showValue && (
        <span className="text-sm font-medium text-gray-600 mr-1">
          {value > 0 ? value.toFixed(1) : 'بدون امتیاز'}
        </span>
      )}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({ title, subtitle, action, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function InfoRow({ label, value, className }: InfoRowProps) {
  return (
    <div className={cn('flex items-center justify-between py-2', className)}>
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
