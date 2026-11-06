'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatInr } from '@/lib/utils';

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [homepage, setHomepage] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [sRes, hRes, pRes] = await Promise.all([
        supabase.from('settings').select('*'),
        supabase.from('homepage_content').select('*'),
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      ]);
      if (!mounted) return;
      const sm: Record<string, any> = {};
      (sRes.data ?? []).forEach((s: any) => { sm[s.key] = s; });
      const hm: Record<string, any> = {};
      (hRes.data ?? []).forEach((s: any) => { hm[s.key] = s; });
      setSettings(sm);
      setHomepage(hm);
      setProducts(pRes.data ?? []);
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const brand = settings.brand_name?.value ?? 'AESTHETICNOVA';
  const tagline = settings.tagline?.value ?? '';
  const logo = settings.logo?.image_url;
  const heroHeading = homepage.hero_heading?.value ?? 'Discover Your Aesthetic';
  const heroSubtitle = homepage.hero_subtitle?.value ?? '';
  const heroImage = homepage.hero_background_image?.image_url;
  const announcement = homepage.announcement_text?.value;

  const featured = products.filter(
    (p: any) => p.is_best_seller || p.is_new_arrival
  ).slice(0, 8);
  const latest = products.slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <p className="text-gray-600">Loading your store…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar brandName={brand.split(' ').pop() ?? brand} />

      {announcement && (
        <div
          className="bg-amber-500/90 text-white text-center text-sm font-medium px-4 py-2 animate-pulse"
        >
          {announcement}
        </div>
      )}

      <section className="relative overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Hero"
            className="w-full h-[600px] object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-[600px] bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-lg">Add a hero background image from the admin dashboard.</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="max-w-4xl text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow">
              {heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow max-w-2xl mx-auto">
              {tagline || heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
              >
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-indigo-600">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
            </div>
            <p className="text-gray-500 text-sm">
              Best sellers and new arrivals
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border bg-white aspect-square">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    {(p.is_best_seller || p.is_new_arrival) && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        {p.is_best_seller && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
                            ⭐ Best Seller
                          </span>
                        )}
                        {p.is_new_arrival && (
                          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                            New Arrival
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {p.name}
                  </h3>
                  <p className="text-indigo-600 font-medium">{formatInr(p.price_inr)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No featured products yet. Add some from the admin dashboard.
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Latest Arrivals</h2>
          </div>
          {latest.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latest.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border bg-white aspect-square">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                    {p.name}
                  </h3>
                  <p className="text-indigo-600 font-medium">{formatInr(p.price_inr)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              No products yet. Add some from the admin dashboard.
            </div>
          )}
        </div>
      </section>

      <Footer contact={settings} />
    </div>
  );
}
