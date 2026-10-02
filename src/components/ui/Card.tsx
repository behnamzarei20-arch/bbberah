import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps { children: ReactNode; className?: string; onClick?: () => void; hoverable?: boolean; }

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return <div onClick={onClick} className={cn('bg-white rounded-[22px] border-2 border-black shadow-[0_4px_14px_rgba(0,0,0,0.10)] [&_.border-gray-50]:border-gray-800 [&_.border-gray-100]:border-gray-800 [&_.border-gray-200]:border-gray-800 [&_.border-gray-300]:border-gray-800', hoverable && 'transition-all duration-200 hover:shadow-[0_12px_28px_rgba(37,99,235,0.24),0_3px_8px_rgba(0,0,0,0.10)] hover:border-black cursor-pointer', onClick && 'cursor-pointer', className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>; }
export function CardBody({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 py-4', className)}>{children}</div>; }
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 pb-5 pt-3', className)}>{children}</div>; }
