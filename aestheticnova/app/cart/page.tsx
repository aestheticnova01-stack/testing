'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Trash2, ChevronLeft, ArrowRight } from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('an_cart');
    setCart(stored ? JSON.parse(stored) : []);
  }, []);

  const save = (next: CartItem[]) => {
    setCart(next);
    localStorage.setItem('an_cart', JSON.stringify(next));
  };

  const remove = (id: string) => save(cart.filter((i) => i.productId !== id));
  const changeQty = (id: string, delta: number) => {
    const next = cart.map((i) =>
      i.productId === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
    );
    save(next);
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-border px-4 py-3">
        <Link
          href="/products"
          className="flex items-center gap-2 text-indigo-600 text-sm font-medium"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
        >
          <ChevronLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-6">Your cart is empty.</p>
            <Link
              href="/products"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 bg-white p-4 rounded-xl border border-border"
              >
                <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg border border-border">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-indigo-600 font-medium mt-1">
                    {formatInr(item.price)} × {item.qty}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => changeQty(item.productId, -1)}
                      className="w-8 h-8 rounded border border-border hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.productId, 1)}
                      className="w-8 h-8 rounded border border-border hover:bg-gray-50 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="mt-10 flex justify-end">
            <div className="w-full max-w-md bg-white p-6 rounded-xl border border-border shadow-sm">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatInr(total)}</span>
              </div>
              <Button
                className="w-full py-3"
                onClick={() => {
                  localStorage.setItem('an_checkout_cart', JSON.stringify(cart));
                  window.location.href = '/checkout';
                }}
              >
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
