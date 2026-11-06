'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toast } from '@/components/ui/toast';
import { Package, Truck, RotateCcw, ArrowRight } from 'lucide-react';
import { formatInr } from '@/lib/utils';

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  total: number;
  payment_status: string;
  shipping_status: string;
  created_at: string;
};

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const SHIPPING_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    description?: string;
    type?: 'success' | 'error';
  }>({ open: false, title: '', description: '', type: 'success' });

  const showToast = (title: string, description = '', type: 'success' | 'error' = 'success') => {
    setToast({ open: true, title, description, type });
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, field: 'payment_status' | 'shipping_status', value: string) => {
    setSaving({ ...saving, [id]: true });
    const { error } = await supabase.from('orders').update({ [field]: value }).eq('id', id);
    setSaving({ ...saving, [id]: false });
    if (error) { showToast('Update failed', error.message, 'error'); return; }
    showToast('Order updated');
    load();
  };

  const filtered = orders.filter((o) =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">View and manage customer orders.</p>
        </div>
      </div>

      <Input
        placeholder="Search by order ID or customer name…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-80"
      />

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium text-right">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Shipping</th>
                <th className="p-4 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{o.order_number}</div>
                      <div className="text-[10px] text-gray-400">{o.id.slice(0, 8)}…</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{o.customer_name}</div>
                      <div className="text-[10px] text-gray-400">{o.customer_email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</div>
                      <div className="text-[10px] text-gray-400 max-w-[200px] truncate">
                        {(o.items as any[]).map((i) => i.product_name || i.name).join(', ')}
                      </div>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatInr(o.total)}</td>
                    <td className="p-4">
                      <select
                        value={o.payment_status}
                        onChange={(e) => updateStatus(o.id, 'payment_status', e.target.value)}
                        disabled={saving[o.id]}
                        className="w-full py-1.5 pr-8 pl-2 text-sm bg-gray-50 border border-gray-300 rounded appearance-none cursor-pointer"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.shipping_status}
                        onChange={(e) => updateStatus(o.id, 'shipping_status', e.target.value)}
                        disabled={saving[o.id]}
                        className="w-full py-1.5 pr-8 pl-2 text-sm bg-gray-50 border border-gray-300 rounded appearance-none cursor-pointer"
                      >
                        {SHIPPING_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-right text-gray-500 text-sm">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} title={toast.title} description={toast.description} type={toast.type} />
    </div>
  );
}
