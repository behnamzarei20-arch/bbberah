import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps { children: ReactNode; className?: string; onClick?: () => void; hoverable?: boolean; }

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return <div onClick={onClick} className={cn('bg-white rounded-[18px] border border-[#e7ecea] shadow-[0_5px_18px_rgba(20,45,40,.045)]', hoverable && 'transition-all duration-200 hover:shadow-[0_8px_24px_rgba(20,45,40,.08)] hover:border-[#d8e2df] cursor-pointer', onClick && 'cursor-pointer', className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-4 pt-4 pb-2', className)}>{children}</div>; }
export function CardBody({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-4 py-3.5', className)}>{children}</div>; }
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-4 pb-4 pt-2', className)}>{children}</div>; }
