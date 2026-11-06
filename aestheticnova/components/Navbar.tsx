'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatInr } from '@/lib/utils';

export function Navbar({ brandName }: { brandName?: string }) {
  const [cartItems, setCartItems] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('an_cart');
    setCartItems(stored ? JSON.parse(stored).length : 0);
  }, []);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
        >
          <span className="text-indigo-600 font-extrabold">AESTHETIC</span>
          <span className="text-gray-900">{brandName || 'NOVA'}</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-indigo-600 transition">
            Home
          </Link>
          <Link href="/products" className="text-sm font-medium text-foreground hover:text-indigo-600 transition">
            Shop
          </Link>
          <a href="https://instagram.com/aestheticnova" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-indigo-600 transition">
            Instagram
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.setItem('an_checkout_step', 'cart');
              window.location.href = '/cart';
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Cart <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-xs text-white">{cartItems}</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-gray-900/90 flex flex-col"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <span className="font-bold text-white">Menu</span>
            <X className="h-5 w-5 text-white cursor-pointer" onClick={() => setOpen(false)} />
          </div>
          <div className="flex-1 px-6 space-y-4">
            <Link
              href="/"
              className="block text-lg text-indigo-100 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block text-lg text-indigo-100 hover:text-white"
              onClick={() => setOpen(false)}
            >
              Shop
            </Link>
            <a
              href="https://instagram.com/aestheticnova"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-lg text-indigo-100 hover:text-white"
            >
              Instagram
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
