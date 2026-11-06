'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { Toast } from '@/components/ui/toast';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { formatInr } from '@/lib/utils';

type Product = {
  id: string;
  name: string;
  description: string;
  price_inr: number;
  category_id: string | null;
  sizes: string[];
  stock: number;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  image_url: string | null;
  created_at: string;
};

type Category = { id: string; name: string; slug: string };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    sizes: '',
    stock: '',
    is_best_seller: false,
    is_new_arrival: false,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
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
    const [pRes, cRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setProducts((pRes.data ?? []) as Product[]);
    setCategories((cRes.data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('products').upload(`products/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      showToast('Upload failed', error.message, 'error');
      return null;
    }
    const { data } = supabase.storage.from('products').getPublicUrl(`products/${fileName}`);
    return data.publicUrl;
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', description: '', price: '', category_id: '', sizes: '', stock: '', is_best_seller: false, is_new_arrival: false, image_url: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price_inr),
      category_id: p.category_id ?? '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
      stock: String(p.stock ?? 0),
      is_best_seller: p.is_best_seller,
      is_new_arrival: p.is_new_arrival,
      image_url: p.image_url ?? '',
    });
    setImagePreview(p.image_url ?? null);
    setImageFile(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = form.image_url;
    if (imageFile) {
      const url = await handleUpload(imageFile);
      if (url) finalImageUrl = url;
      else { setLoading(false); return; }
    }

    const payload = {
      name: form.name,
      description: form.description,
      price_inr: parseFloat(form.price) || 0,
      category_id: form.category_id || null,
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      stock: parseInt(form.stock) || 0,
      is_best_seller: form.is_best_seller,
      is_new_arrival: form.is_new_arrival,
      image_url: finalImageUrl,
    };

    let error;
    if (editing) {
      const res = await supabase.from('products').update(payload).eq('id', editing.id);
      error = res.error;
    } else {
      const res = await supabase.from('products').insert(payload);
      error = res.error;
    }

    setLoading(false);
    if (error) { showToast('Save failed', error.message, 'error'); return; }

    showToast(editing ? 'Product updated' : 'Product added');
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    setLoading(true);
    const { error } = await supabase.from('products').delete().eq('id', deleteId);
    setLoading(false);
    setDeleteId(null);
    if (error) { showToast('Delete failed', error.message, 'error'); return; }
    showToast('Product deleted');
    load();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your store catalog. Changes appear on the website immediately.</p>
        </div>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80"
        />
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-border">
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Price</th>
                <th className="p-4 font-medium text-center">Stock</th>
                <th className="p-4 font-medium text-center">Badges</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No products found.</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 group">
                    <td className="p-4">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded border border-border bg-gray-50">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-[10px] text-gray-400">No image</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">ID: {p.id.slice(0, 8)}…</div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs border border-gray-200 rounded px-2 py-0.5 text-gray-600 bg-gray-50">
                        {categories.find((c) => c.id === p.category_id)?.name ?? 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-gray-900">{formatInr(p.price_inr)}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (p.stock ?? 0) <= 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex gap-1 justify-center">
                        {p.is_best_seller && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded">⭐ Best</span>}
                        {p.is_new_arrival && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">New</span>}
                        {!p.is_best_seller && !p.is_new_arrival && <span className="text-[10px] text-gray-400">—</span>}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(p)} className="mr-2">
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteId(p.id)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing || !editing && form.name !== '' ? null : null}

      {/* Add / Edit form */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit product' : 'Add new product'}</h2>
          <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
        </div>
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <Input
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              placeholder="Category ID (leave empty for uncategorized)"
            />
            <p className="text-[10px] text-gray-500 mt-1">Find category IDs in the Categories section.</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Price (INR)</label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sizes (comma separated)</label>
            <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Stock quantity</label>
            <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Product photograph</label>
            <FileUpload value={imagePreview} onChange={(v) => setImagePreview(v)} accept="image/*" label="Replace product image" />
            {imageFile && <p className="text-[10px] text-gray-500 mt-1">New image selected — will upload on save.</p>}
            {!imageFile && !editing && <p className="text-[10px] text-gray-500 mt-1">Optional: upload a product photo.</p>}
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_best_seller}
              onChange={(e) => setForm({ ...form, is_best_seller: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Mark as Best Seller</label>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_new_arrival}
              onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Mark as New Arrival</label>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {editing ? 'Update product' : 'Create product'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 relative">
            <h3 className="font-bold text-gray-900 mb-2">Delete product?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This cannot be undone. The product will be removed from your store.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={remove} disabled={loading}>
                {loading ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} title={toast.title} description={toast.description} type={toast.type} />
    </div>
  );
}
