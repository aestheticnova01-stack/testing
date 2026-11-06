'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { formatInr } from '@/lib/utils';
import { ShoppingCart, Mail, Phone } from 'lucide-react';

export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        if (mounted) {
          setProduct(data);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [params.id]);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('an_cart') || '[]');
    cart.push({
      productId: product.id,
      name: product.name,
      price: product.price_inr,
      qty,
      image: product.image_url,
    });
    localStorage.setItem('an_cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <p className="text-gray-600">Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
        <Link href="/" className="text-indigo-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const sizes: string[] = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar brandName="NOVA" />

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <nav className="mb-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-1">{'>'}</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="relative rounded-xl border border-border overflow-hidden bg-gray-50 aspect-[4/5] md:aspect-auto md:h-[560px]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-gray-400 text-lg">No product image</span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                {product.categories?.name && (
                  <span className="text-xs font-semibold text-indigo-600 tracking-wider uppercase">
                    {product.categories.name}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold text-indigo-600">
                  {formatInr(product.price_inr)}
                </p>
                {product.stock > 0 ? (
                  <p className="text-emerald-600 font-medium">In stock ({product.stock} available)</p>
                ) : (
                  <p className="text-red-600 font-medium">Out of stock</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-3">Description</p>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {sizes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">Select Size</p>
                  <div className="flex gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="border border-border rounded-lg px-4 py-2 text-sm bg-white hover:bg-indigo-50 hover:text-indigo-600 transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-3 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-4 text-lg font-mono font-bold">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    className="p-3 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition shadow"
                >
                  {added ? (
                    <>
                      Added! <ShoppingCart className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Add to Cart <ShoppingCart className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Need help?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">hello@aestheticnova.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-600">+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer contact={{}} />
    </div>
  );
}
