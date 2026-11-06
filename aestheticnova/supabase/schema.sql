-- ============================================================================
-- AESTHETICNOVA — Supabase Database Schema
-- Run this entire script in the SQL Editor of your Supabase project.
-- ============================================================================

-- 1) Profiles: tracks admin users (role = 'admin')
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text default 'admin',
  created_at timestamptz default now()
);

-- 2) Categories
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  created_at timestamptz default now()
);

-- 3) Products
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price_inr numeric(12,2) not null default 0,
  category_id uuid references categories(id) on delete set null,
  sizes text[] default '{}',
  stock integer default 0,
  is_best_seller boolean default false,
  is_new_arrival boolean default false,
  image_url text,
  created_at timestamptz default now()
);

-- 4) Orders (placed by customers)
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  customer_address text,
  items jsonb not null default '[]',
  total numeric(12,2) not null default 0,
  payment_status text default 'pending',
  shipping_status text default 'processing',
  created_at timestamptz default now()
);

-- 5) Site settings (brand name, tagline, logo, contact, policies)
create table if not exists settings (
  key text primary key,
  value text,
  image_url text,
  updated_at timestamptz default now()
);

-- 6) Homepage editable content
create table if not exists homepage_content (
  key text primary key,
  value text,
  image_url text,
  updated_at timestamptz default now()
);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;
alter table homepage_content enable row level security;

-- Profiles: admins manage, public can read own profile
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);
create policy "Admins manage profiles" on profiles
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Categories: public read, admin write
create policy "Categories are viewable by everyone" on categories
  for select using (true);
create policy "Admins manage categories" on categories
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Products: public read, admin write
create policy "Products are viewable by everyone" on products
  for select using (true);
create policy "Admins manage products" on products
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Orders: customers can insert, only admins can read/update
create policy "Anyone can place an order" on orders
  for insert with check (true);
create policy "Admins manage orders" on orders
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Settings: public read, admin write
create policy "Settings are viewable by everyone" on settings
  for select using (true);
create policy "Admins manage settings" on settings
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Homepage content: public read, admin write
create policy "Homepage content is viewable by everyone" on homepage_content
  for select using (true);
create policy "Admins manage homepage content" on homepage_content
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- Storage buckets (public read, admin write via object policies)
-- Buckets: products, logos, homepage, categories
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true),
       ('logos', 'logos', true),
       ('homepage', 'homepage', true),
       ('categories', 'categories', true)
on conflict (id) do nothing;

create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'products');
create policy "Admins manage product images" on storage.objects
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
    and bucket_id = 'products'
  );

create policy "Public can view logos" on storage.objects
  for select using (bucket_id = 'logos');
create policy "Admins manage logos" on storage.objects
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
    and bucket_id = 'logos'
  );

create policy "Public can view homepage images" on storage.objects
  for select using (bucket_id = 'homepage');
create policy "Admins manage homepage images" on storage.objects
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
    and bucket_id = 'homepage'
  );

create policy "Public can view category images" on storage.objects
  for select using (bucket_id = 'categories');
create policy "Admins manage category images" on storage.objects
  for all using (
    auth.uid() is not null and
    (select role from profiles where id = auth.uid()) = 'admin'
    and bucket_id = 'categories'
  );

-- ============================================================================
-- Seed default settings
-- ============================================================================
insert into settings (key, value, image_url, updated_at) values
  ('brand_name', 'AESTHETICNOVA', null, now()),
  ('tagline', 'Curated aesthetic essentials for every moment.', null, now()),
  ('contact_email', 'hello@aestheticnova.in', null, now()),
  ('contact_phone', '+91 98765 43210', null, now()),
  ('contact_address', 'Mumbai, Maharashtra, India', null, now()),
  ('instagram_link', 'https://instagram.com/aestheticnova', null, now()),
  ('shipping_info', 'Free shipping on orders above ₹999. Delivery in 3–5 business days across India.', null, now()),
  ('return_policy', '30-day easy returns. Items must be unused with original packaging.', null, now())
on conflict (key) do nothing;

insert into homepage_content (key, value, image_url, updated_at) values
  ('hero_heading', 'Discover Your Aesthetic', null, now()),
  ('hero_subtitle', 'Handcrafted essentials for a beautiful life.', null, now()),
  ('announcement_text', 'Festive Sale — Up to 30% off on all collections!', null, now())
on conflict (key) do nothing;

-- ============================================================================
-- IMPORTANT: Create your admin account
-- ============================================================================
-- 1. Go to Authentication > Users in your Supabase dashboard.
-- 2. Add a user: enter your email, set a password, and confirm email manually.
-- 3. Then run:  insert into profiles (id, email, role) values ('<USER-ID>', '<YOUR-EMAIL>', 'admin');
--    (Get <USER-ID> from the Auth users list.)
-- ============================================================================
