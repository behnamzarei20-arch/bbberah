import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'full';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md shadow-orange-200',
  secondary: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200',
  outline: 'border-2 border-orange-200 text-primary-700 hover:bg-orange-50 active:bg-orange-100',
  ghost: 'text-gray-600 hover:bg-orange-50 active:bg-orange-100',
  danger: 'bg-error-600 text-white hover:bg-error-700 active:bg-error-800 shadow-sm',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 shadow-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-11 px-4 py-2.5 text-sm rounded-xl gap-2',
  md: 'min-h-14 px-5 py-3.5 text-base rounded-2xl gap-2.5',
  lg: 'min-h-16 px-6 py-4 text-lg rounded-2xl gap-3 font-semibold',
  full: 'w-full min-h-16 px-5 py-4 text-lg rounded-2xl gap-3 font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 select-none active:scale-[.98]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
