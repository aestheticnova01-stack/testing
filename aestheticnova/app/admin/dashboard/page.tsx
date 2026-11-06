'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatInr } from '@/lib/utils';
import { ShoppingCart, Package, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [pRes, oRes, cRes] = await Promise.all([
        supabase.from('products').select('id, stock, price_inr'),
        supabase
          .from('orders')
          .select('order_number, customer_name, total, payment_status, shipping_status, created_at'),
        supabase.from('categories').select('id'),
      ]);
      if (!mounted) return;

      const productList = pRes.data ?? [];
      const orderList = oRes.data ?? [];
      const categoryList = cRes.data ?? [];

      const totalStock = productList.reduce((s: number, p: any) => s + (p.stock || 0), 0);
      const lowStock = productList.filter((p: any) => (p.stock || 0) <= 5).length;
      const totalRevenue = orderList
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      const pendingOrders = orderList.filter(
        (o: any) => o.shipping_status !== 'delivered' && o.shipping_status !== 'cancelled'
      ).length;

      setStats({
        totalProducts: productList.length,
        lowStock,
        totalStock,
        totalOrders: orderList.length,
        pendingOrders,
        totalRevenue,
      });
      setRecent(
        orderList.slice(0, 5).map((o: any) => ({
          id: o.order_number,
          customer: o.customer_name,
          total: formatInr(o.total),
          status: o.shipping_status,
        }))
      );
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Loading dashboard…</div>
    );
  }

  const s = stats!;
  const statCards = [
    { title: 'Total Products', value: s.totalProducts, icon: Package, subtitle: `${s.lowStock} low on stock` },
    { title: 'Total Inventory', value: s.totalStock, icon: ShoppingCart, subtitle: 'units in stock' },
    { title: 'Orders', value: s.totalOrders, icon: ShoppingCart, subtitle: `${s.pendingOrders} pending fulfillment` },
    { title: 'Revenue', value: formatInr(s.totalRevenue), icon: DollarSign, subtitle: 'paid orders only' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back. Here's how your store is doing.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                <p className="text-xs text-gray-500">{s.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="pb-2 font-medium">Order ID</th>
                      <th className="pb-2 font-medium">Customer</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length > 0 ? (
                      recent.map((o) => (
                        <tr key={o.id} className="border-b border-border last:border-0">
                          <td className="py-3 font-medium text-gray-900">{o.id}</td>
                          <td className="py-3 text-gray-600">{o.customer}</td>
                          <td className="py-3 font-medium text-indigo-600">{o.total}</td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                              o.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-700'
                                : o.status === 'shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="/admin/products" className="block w-full text-left px-4 py-3 bg-indigo-600 text-white rounded-xl text-center font-semibold hover:bg-indigo-700 transition">
                Add a new product
              </a>
              <a href="/admin/orders" className="block w-full text-left px-4 py-3 border border-border rounded-xl text-gray-700 text-center hover:bg-gray-50 transition">
                Manage orders
              </a>
              <a href="/admin/categories" className="block w-full text-left px-4 py-3 border border-border rounded-xl text-gray-700 text-center hover:bg-gray-50 transition">
                Manage categories
              </a>
              <a href="/admin/homepage" className="block w-full text-left px-4 py-3 border border-border rounded-xl text-gray-700 text-center hover:bg-gray-50 transition">
                Edit homepage
              </a>
              <a href="/admin/settings" className="block w-full text-left px-4 py-3 border border-border rounded-xl text-gray-700 text-center hover:bg-gray-50 transition">
                Store settings
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
