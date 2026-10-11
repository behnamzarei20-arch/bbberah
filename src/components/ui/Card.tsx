import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps { children: ReactNode; className?: string; onClick?: () => void; hoverable?: boolean; }

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return <div onClick={onClick} className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', hoverable && 'transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer', onClick && 'cursor-pointer', className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 pt-5 pb-3', className)}>{children}</div>; }
export function CardBody({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 py-4', className)}>{children}</div>; }
export function CardFooter({ children, className }: { children: ReactNode; className?: string }) { return <div className={cn('px-5 pb-5 pt-3', className)}>{children}</div>; }
