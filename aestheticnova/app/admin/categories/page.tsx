'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { Toast } from '@/components/ui/toast';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

type Category = { id: string; name: string; slug: string; image_url: string | null };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image_url: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('categories').upload(`categories/${fileName}`, file);
    if (error) { showToast('Upload failed', error.message, 'error'); return null; }
    const { data } = supabase.storage.from('categories').getPublicUrl(`categories/${fileName}`);
    return data.publicUrl;
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', image_url: '' });
    setImageFile(null);
    setImagePreview(null);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, image_url: c.image_url ?? '' });
    setImagePreview(c.image_url ?? null);
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

    const slug = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { name: form.name, slug, image_url: finalImageUrl };

    let error;
    if (editing) {
      const res = await supabase.from('categories').update(payload).eq('id', editing.id);
      error = res.error;
    } else {
      const res = await supabase.from('categories').insert(payload);
      error = res.error;
    }

    setLoading(false);
    if (error) { showToast('Save failed', error.message, 'error'); return; }
    showToast(editing ? 'Category updated' : 'Category added');
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    setLoading(true);
    const { error } = await supabase.from('categories').delete().eq('id', deleteId);
    setLoading(false);
    setDeleteId(null);
    if (error) { showToast('Delete failed', error.message, 'error'); return; }
    showToast('Category deleted');
    load();
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your products into categories.</p>
        </div>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add category
        </Button>
      </div>

      <Input
        placeholder="Search categories…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-80"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-gray-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">No categories found.</div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="bg-white border border-border rounded-xl p-5 shadow-sm flex flex-col gap-3 group">
              <div className="h-32 w-full overflow-hidden rounded-lg border border-border bg-gray-50 relative">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-[10px] text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-500">/{c.slug}</p>
              <div className="flex gap-2 mt-auto">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Edit2 className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteId(c.id)} className="h-8 px-2">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit category' : 'Add new category'}</h2>
          <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
        </div>
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Category name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Slug (URL-friendly)</label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. summer-collection" />
            <p className="text-[10px] text-gray-500 mt-1">Auto-generated from name if left empty.</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Category image</label>
            <FileUpload value={imagePreview} onChange={(v) => setImagePreview(v)} accept="image/*" label="Upload category image" />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
              <Save className="h-4 w-4 mr-2" /> {editing ? 'Update category' : 'Create category'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="bg-white p-6 rounded-xl shadow-xl w-96">
            <h3 className="font-bold text-gray-900 mb-2">Delete category?</h3>
            <p className="text-sm text-gray-600 mb-6">Products in this category will become uncategorized.</p>
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
