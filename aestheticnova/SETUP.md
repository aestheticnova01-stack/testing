# AESTHETICNOVA — Store + Admin Dashboard

A complete, code-free-manageable e-commerce store.

**Customer site:** homepage, product catalog, product details, cart, checkout.
**Admin dashboard:** `/admin` — password-protected, visual, no code editing required.

**Stack:** Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL database, file storage, authentication).

---

## 1. Set up Supabase (free tier is fine)

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase dashboard, go to **SQL Editor** and paste the entire contents of `supabase/schema.sql`, then click **Run**. This creates:
   - `products`, `categories`, `orders`, `settings`, `homepage_content` tables
   - Storage buckets: `products`, `logos`, `homepage`, `categories`
   - Row Level Security (RLS) policies so the public can read products/categories but only admins can write
   - Default settings and homepage content seeded
3. Go to **Project Settings > API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. Create your admin account

1. In Supabase, go to **Authentication > Users** > **Add user**.
2. Enter your email and a password, and mark the email as confirmed.
3. Copy the new user's **ID** (UUID).
4. In the **SQL Editor**, run:

   ```sql
   insert into profiles (id, email, role) values ('<PASTE-USER-ID-HERE>', 'your-email@example.com', 'admin');
   ```

   You only need to do this once. Additional staff accounts can be added the same way.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and replace the placeholder values with your real Supabase URL and anon key. The `SUPABASE_SERVICE_ROLE_KEY` line is optional and not used by the frontend code — never put it in any frontend file.

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 4. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the customer store.
Open `http://localhost:3000/admin/login` for the admin dashboard.

To deploy, connect this folder to Vercel (or any Next.js host) and add the same environment variables there.

---

## 5. Logging in to the admin dashboard

1. Go to `http://localhost:3000/admin/login` (or your domain + `/admin/login`).
2. Enter the email and password you created in Supabase.
3. You land on the **Dashboard** with quick-action cards.

**Access control:** `/admin/*` routes are protected by middleware. Visitors who are not signed in are redirected to `/admin/login`. Customers can never reach admin functions — there is no customer-facing link to `/admin`, and database RLS blocks writes from anyone without the admin role.

---

## 6. Managing your store without code (the visual admin)

Everything below is done through forms and buttons in the browser — you never open source code.

### Products (Add / Edit / Delete)
Go to **Admin → Products**.

- **Add a product:** Click "Add product", fill name, description, price (INR), category, sizes (comma-separated, e.g. `S, M, L`), stock quantity, upload a photograph (you'll see a preview), and tick "Best Seller" / "New Arrival" if desired. Click **Create product**.
- **Edit a product:** Click **Edit** on any product row, change any field, replace the image if you want, and click **Update product**.
- **Delete a product:** Click the trash icon — you'll be asked to confirm before anything is deleted.
- Changes appear on the customer website immediately.

### Categories
Go to **Admin → Categories**. Add, rename, change images, or remove categories. Products in a removed category become "Uncategorized" instead of breaking.

### Homepage Editor (no code)
Go to **Admin → Homepage**. Click **Edit** on any block to change:
- Hero heading
- Hero subtitle
- Hero background image
- Homepage announcement banner (shown at the top of the store)

### Store Settings
Go to **Admin → Store Settings**. Edit:
- Brand name, tagline
- Logo image (upload/change)
- Contact email, phone, address
- Instagram profile link
- Shipping information
- Return & refund policy

These show up on the homepage footer, product pages, and checkout automatically.

### Order Management
Go to **Admin → Orders**. You'll see every order with:
- Order ID, customer name/email/phone/address
- Ordered products and quantities
- Order total
- Payment status (pending / paid / failed / refunded)
- Shipping status (processing / shipped / delivered / cancelled)

Use the dropdowns to update **payment status** and **shipping status** as you process orders. Customers place orders through the cart/checkout flow on the website; they land here automatically.

---

## 7. How data is stored (no localStorage for store data)

- **Products, categories, settings, homepage content, orders** live in your Supabase PostgreSQL database — persistent and shared across all devices.
- **Product photos, logos, banner images** live in Supabase Storage (public buckets), not in the code.
- The only things kept in the browser are the shopping cart (during a visit) and your admin session cookie. If you clear browser data, your store data is safe in Supabase.

---

## 8. Security

- The `anon` key is used in browser code by design (Supabase is built for this). It cannot bypass Row Level Security.
- The `service_role` key (which bypasses RLS) exists only in `lib/supabase-server.ts` and is never sent to the browser.
- Admin routes are guarded by Next.js middleware (`/middleware.ts`) and by RLS policies that check the `profiles.role = 'admin'`.
- Customers can insert orders (checkout) but cannot read or modify other orders, products, or settings.

---

## 9. File overview

| Path | Purpose |
|------|---------|
| `supabase/schema.sql` | Database tables, RLS policies, storage buckets, seed data |
| `.env.example` / `.env.local` | Supabase credentials |
| `lib/supabase.ts` | Browser Supabase client |
| `middleware.ts` | Protects `/admin` routes |
| `app/` | Customer website (home, products, cart, checkout) |
| `app/admin/` | Password-protected visual dashboard |
| `components/` | Reusable UI (buttons, forms, image upload with preview, toasts) |

---

## 10. Going further

The dashboard has no artificial limits — you can add 50+ products, change prices any time, swap images, update inventory, and manage orders indefinitely without touching code. If you ever want to add features (customer login, email notifications, WhatsApp order alerts), the Supabase backend is ready to extend.
