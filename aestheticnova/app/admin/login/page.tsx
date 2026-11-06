'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-900">Admin Login</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Sign in to manage your AESTHETICNOVA store.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email address
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aestheticnova.in"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <span className="relative">
                <input type="password" className="sr-only" />
              </span>
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-xs text-gray-500 text-center">
          Don't have admin access? Create an admin user in your Supabase
          dashboard (Authentication {'>'} Users) and add a row to the
          <code>profiles</code> table with role = 'admin'.
        </p>
      </div>
    </div>
  );
}
