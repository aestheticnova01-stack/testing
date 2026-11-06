'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'success' | 'error';
}

export function Toast({ open, onClose, title, description, type = 'success' }: ToastProps) {
  if (!open) return null;
  const bg =
    type === 'error'
      ? 'bg-red-600 border-red-500'
      : 'bg-emerald-600 border-emerald-500';
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none lg:top-0 lg:right-0 sm:top-4 sm:right-4 sm:p-4 md:w-80">
      <div
        className={cn(
          'relative flex items-center gap-4 rounded-xl border px-4 py-4 shadow-lg text-white',
          bg
        )}
      >
        <div className="flex flex-col gap-1">
          <h4 className="text-sm font-semibold">{title}</h4>
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto shrink-0 rounded-md p-1.5 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
