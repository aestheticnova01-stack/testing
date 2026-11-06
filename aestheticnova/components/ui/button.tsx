import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'primary';
  size?: 'default' | 'sm' | 'lg';
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled = false,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-medium font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive:
      'bg-red-600 text-white shadow hover:bg-red-700 focus:ring-red-500',
    outline:
      'border border-input bg-background shadow hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    primary:
      'bg-indigo-600 text-white shadow hover:bg-indigo-700 focus:ring-indigo-500',
  };
  const sizes: Record<string, string> = {
    default: 'h-11 px-4 py-2',
    sm: 'h-9 px-3 text-sm',
    lg: 'h-12 px-8 text-lg',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
