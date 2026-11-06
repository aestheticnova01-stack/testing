'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';
import { Toast } from '@/components/ui/toast';
import { Save, Sparkles, Image, Megaphone } from 'lucide-react';

type Block = { key: string; value: string | null; image_url: string | null };

const FIELDS: { key: string; label: string; icon: any; type: 'text' | 'textarea' | 'image' }[] = [
  { key: 'hero_heading', label: 'Hero heading', icon: Sparkles, type: 'text' },
  { key: 'hero_subtitle', label: 'Hero subtitle', icon: Sparkles, type: 'text' },
  { key: 'hero_background_image', label: 'Hero background image', icon: Image, type: 'image' },
  { key: 'announcement_text', label: 'Homepage announcement banner', icon: Megaphone, type: 'text' },
];

export default function HomepageEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [form, setForm] = useState({ value: '', image_url: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    const { data } = await supabase.from('homepage_content').select('*');
    setBlocks((data ?? []) as Block[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('homepage').upload(`homepage/${fileName}`, file);
    if (error) { showToast('Upload failed', error.message, 'error'); return null; }
    const { data } = supabase.storage.from('homepage').getPublicUrl(`homepage/${fileName}`);
    return data.publicUrl;
  };

  const startEdit = (b: Block) => {
    setEditingKey(b.key);
    setForm({ value: b.value ?? '', image_url: b.image_url ?? '' });
    setImagePreview(b.image_url ?? null);
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

    const field = FIELDS.find((f) => f.key === editingKey)!;
    const payload: any = { value: field.type === 'image' ? null : form.value };
    if (field.type === 'image') payload.image_url = finalImageUrl;
    else payload.value = form.value;

    const { error } = await supabase.from('homepage_content').upsert(payload, { onConflict: 'key' });

    setLoading(false);
    setEditingKey(null);
    setImageFile(null);
    setImagePreview(null);
    if (error) { showToast('Save failed', error.message, 'error'); return; }
    showToast('Homepage updated');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homepage Editor</h1>
        <p className="text-gray-600">Change what customers see on the homepage. No code required.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {FIELDS.map((field) => {
          const block = blocks.find((b) => b.key === field.key);
          const isEditing = editingKey === field.key;
          return (
            <div key={field.key} className="bg-white rounded-xl border border-border shadow-sm p-5 flex flex-col gap-3 h-full">
              <div className="flex items-center gap-2">
                <field.icon className="h-5 w-5 text-indigo-600" />
                <span className="font-semibold text-gray-900 text-sm">{field.label}</span>
              </div>
              {isEditing ? (
                <form onSubmit={save} className="space-y-3 flex-1">
                  {field.type === 'image' ? (
                    <>
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Image</label>
                      <FileUpload value={imagePreview} onChange={(v) => setImagePreview(v)} accept="image/*" label="Choose image" />
                    </>
                  ) : (
                    <>
                      <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Text</label>
                      <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-sm" disabled={loading}>
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingKey(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {field.type === 'image' ? (
                    <div className="flex-1 h-32 overflow-hidden rounded-lg border border-border bg-gray-50 relative flex items-center justify-center">
                      {block?.image_url ? (
                        <img src={block.image_url} alt={field.label} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400">No image set</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-[100px] overflow-hidden rounded-lg border border-border bg-gray-50 p-3 text-sm text-gray-600 leading-relaxed">
                      {block?.value ? block.value : <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  )}
                  <Button size="sm" onClick={() => startEdit(block!)} className="w-full text-left text-indigo-600 hover:bg-indigo-50">
                    Edit
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Toast open={toast.open} onClose={() => setToast({ ...toast, open: false })} title={toast.title} description={toast.description} type={toast.type} />
    </div>
  );
}
