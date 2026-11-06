'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import Link from 'next/link';
import { formatInr } from '@/lib/utils';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string | null;
};

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string; type?: 'success' | 'error' }>({
    open: false, title: '', description: '', type: 'success',
  });

  useEffect(() => {
    const stored = localStorage.getItem('an_checkout_cart');
    setCart(stored ? JSON.parse(stored) : []);
  }, []);

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <Link href="/products" className="text-indigo-600 hover:underline">
          Start shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const items = cart.map((i) => ({
      product_id: i.productId,
      product_name: i.name,
      quantity: i.qty,
      unit_price: i.price,
      image: i.image,
    }));

    const { error } = await supabase.from('orders').insert({
      order_number: 'AN-' + Date.now().toString().slice(-6),
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      customer_address: form.address,
      items,
      total,
      payment_status: 'pending',
      shipping_status: 'processing',
    });

    setLoading(false);
    if (error) {
      setToast({ open: true, title: 'Order failed', description: error.message, type: 'error' });
      return;
    }

    localStorage.removeItem('an_cart');
    localStorage.removeItem('an_checkout_cart');
    setToast({ open: true, title: 'Order placed!', description: 'We have received your order. Thank you for shopping with AESTHETICNOVA.', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-border px-4 py-3">
        <Link
          href="/cart"
          className="flex items-center gap-2 text-indigo-600 text-sm font-medium"
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
        >
          ← Back to cart
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Place Your Order</h1>

            <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl border border-border shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Full name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Riya Sharma"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="riya@example.com"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Delivery address</label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Flat 4B, Marine Drive, Mumbai, Maharashtra 400020"
                  required
                />
              </div>
              <Button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={loading}>
                {loading ? 'Placing order...' : 'Place Order'}
              </Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 text-sm">
                  <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded border border-border">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">—</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-gray-500">{item.qty} × {formatInr(item.price)}</div>
                  </div>
                  <div className="font-medium text-gray-900">{formatInr(item.price * item.qty)}</div>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between text-base font-bold text-gray-900">
                <span>Total</span>
                <span>{formatInr(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast
        open={toast.open}
        onClose={() => setToast({ ...toast, open: false })}
        title={toast.title}
        description={toast.description}
        type={toast.type}
      />
    </div>
  );
}
