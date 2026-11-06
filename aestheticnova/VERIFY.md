# AESTHETICNOVA — Code Verification Checklist

Hand this file to any coding AI model (Claude, GPT, Gemini, Grok, etc.) along with the project files to cross-verify the codebase.

---

## 1. Project Overview

**Stack:** Next.js 16 (App Router) + Tailwind CSS + Supabase (PostgreSQL, Storage, Auth)  
**Purpose:** Customer-facing e-commerce store + password-protected visual admin dashboard  
**Location:** `/home/user/aestheticnova/`

### Key directories
```
/app/                          Customer-facing pages (home, products, cart, checkout)
/app/admin/                    Password-protected admin dashboard
/components/ui/                Reusable UI components (button, input, file-upload, toast, card)
/lib/                          Supabase clients (browser + server)
/supabase/schema.sql           Database tables, RLS policies, storage buckets, seed data
.env.local                     Supabase credentials (never commit to git)
middleware.ts                  Route protection for /admin/*
```

---

## 2. What to Verify (Priority Order)

### Phase A: Security (Critical)
Check these before anything else:

1. **No secret keys in frontend**
   - `lib/supabase.ts` uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.
   - `lib/supabase-server.ts` uses `SUPABASE_SERVICE_ROLE_KEY` and must NEVER be imported in client components (`'use client'` files).
   - `.env.local` is NOT committed to git.

2. **Admin route protection**
   - `middleware.ts` redirects unauthenticated users from `/admin/*` to `/admin/login`.
   - `middleware.ts` does NOT create a redirect loop on `/admin/login` itself.
   - `app/admin/layout.tsx` checks for a signed-in user and renders null/sign-out if missing.

3. **Row Level Security (RLS)**
   - `supabase/schema.sql` enables RLS on all tables: `profiles`, `categories`, `products`, `orders`, `settings`, `homepage_content`.
   - Public can `SELECT` products, categories, settings, homepage_content.
   - Only `profiles.role = 'admin'` can INSERT/UPDATE/DELETE products, categories, settings, homepage_content.
   - Anyone can INSERT orders (customers checkout), but only admins can read/update all orders.

4. **No IDOR (Insecure Direct Object Reference)**
   - Admin product edit/delete checks ownership via RLS (admin role), not just URL params.
   - Customers cannot access `/admin/*` at all.

### Phase B: Feature Completeness
Verify every requirement from the original spec is implemented:

| Requirement | Where to check |
|-------------|---------------|
| Add products via form | `app/admin/products/page.tsx` |
| Upload product photos | `components/ui/file-upload.tsx` + Supabase Storage bucket `products` |
| Edit product names/prices/descriptions | `app/admin/products/page.tsx` form |
| Select product categories | `app/admin/products/page.tsx` category_id field |
| Update sizes (comma-separated) | `app/admin/products/page.tsx` sizes field |
| Update stock quantities | `app/admin/products/page.tsx` stock field |
| Delete products | `app/admin/products/page.tsx` trash button + confirmation dialog |
| Mark Best Sellers / New Arrivals | Checkbox fields in product form |
| Hero heading/subtitle/background image | `app/admin/homepage/page.tsx` |
| Promotional banners / announcement text | `app/admin/homepage/page.tsx` announcement_text |
| Featured products / collections | `app/page.tsx` filters `is_best_seller` / `is_new_arrival` |
| Add / rename / change image / remove categories | `app/admin/categories/page.tsx` |
| Edit brand name, tagline, logo | `app/admin/settings/page.tsx` |
| Edit contact info | `app/admin/settings/page.tsx` contact_email/phone/address |
| Add Instagram link | `app/admin/settings/page.tsx` instagram_link |
| Edit shipping info | `app/admin/settings/page.tsx` shipping_info |
| Edit return & refund policy | `app/admin/settings/page.tsx` return_policy |
| Order Management: ID, customer, products, total, payment status, shipping status | `app/admin/orders/page.tsx` |
| Update order statuses | Dropdowns in `app/admin/orders/page.tsx` |
| Sidebar + clear navigation + large buttons | `app/admin/layout.tsx` |
| Save and Cancel buttons | All admin forms |
| Image upload previews | `components/ui/file-upload.tsx` |
| Confirmation before deleting | Delete modals in products and categories pages |

### Phase C: Data Persistence (Critical)
The requirement explicitly forbids storing store data only in React state or `localStorage`.

Check:
1. **Products** are read from Supabase `products` table, not hardcoded or localStorage-only.
   - `app/page.tsx` fetches from `supabase.from('products')`.
   - `app/admin/products/page.tsx` writes to Supabase.

2. **Orders** are inserted into Supabase `orders` table on checkout.
   - `app/checkout/page.tsx` calls `supabase.from('orders').insert(...)`.

3. **Images** are stored in Supabase Storage buckets (`products`, `logos`, `homepage`, `categories`), not as base64 in the database or local files only.

4. **localStorage** is used ONLY for:
   - Shopping cart during a session (`an_cart`, `an_checkout_cart`).
   - Never for product catalog, orders, or settings.

### Phase D: Build & TypeScript
1. `npm run build` completes with zero errors.
2. No missing `'use client'` directives in components using `useState`, `useEffect`, `localStorage`, etc.
3. All `lucide-react` icon names exist in the installed version (e.g., `Instagram` and `Shop` do NOT exist in older versions — use `Camera` and `Store` instead).
4. No duplicate JSX attributes (e.g., two `placeholder` props on one element).
5. No `>` characters unescaped in JSX text (use `{'>'}`).

### Phase E: UX for Non-Technical Users
1. Admin has a sidebar with clear navigation.
2. Forms have Save and Cancel buttons.
3. Image uploads show a preview before saving.
4. Delete actions show a confirmation dialog.
5. Error toasts appear on save/upload failure.
6. Success toasts appear on successful save.

---

## 3. File-by-File Mapping

Give these specific files to the AI model for review:

| File | Purpose | What AI should check |
|------|---------|---------------------|
| `supabase/schema.sql` | Database schema, RLS, storage, seed data | RLS policies, table structure, bucket creation |
| `.env.example` | Environment variable template | No secrets exposed, correct variable names |
| `lib/supabase.ts` | Browser Supabase client | Uses anon key only |
| `lib/supabase-server.ts` | Server-only Supabase client | Uses service role key, not imported in client |
| `middleware.ts` | Route protection | Protects `/admin/*`, no login loop |
| `app/layout.tsx` | Root layout | Metadata, fonts |
| `app/page.tsx` | Customer homepage | Fetches from Supabase, client-side |
| `app/products/[id]/page.tsx` | Product detail | Client-side fetch, add to cart |
| `app/cart/page.tsx` | Shopping cart | localStorage cart, checkout flow |
| `app/checkout/page.tsx` | Checkout | Inserts order into Supabase |
| `app/order-success/page.tsx` | Order confirmation | Simple success page |
| `app/admin/layout.tsx` | Admin shell | Sidebar, auth check, sign-out |
| `app/admin/login/page.tsx` | Admin login | Sign in with password, redirect on success |
| `app/admin/dashboard/page.tsx` | Dashboard overview | Stats from Supabase, client-side |
| `app/admin/products/page.tsx` | Product CRUD | Add/edit/delete, image upload, validation |
| `app/admin/categories/page.tsx` | Category CRUD | Add/edit/delete, image upload |
| `app/admin/homepage/page.tsx` | Homepage editor | Edit hero, announcement, upsert logic |
| `app/admin/settings/page.tsx` | Store settings | Brand, logo, contact, policies |
| `app/admin/orders/page.tsx` | Order management | List orders, update statuses |
| `components/ui/button.tsx` | Button component | Variants, sizes, disabled states |
| `components/ui/input.tsx` | Input/Textarea | Standard form controls |
| `components/ui/file-upload.tsx` | Image upload with preview | Blob URLs, cleanup, storage upload |
| `components/ui/toast.tsx` | Success/error toasts | Auto-dismiss or manual close |
| `components/ui/card.tsx` | Card layout | Header, content, footer sub-components |
| `components/Navbar.tsx` | Customer navigation | Cart count from localStorage |
| `components/Footer.tsx` | Customer footer | Settings values |
| `types.ts` | TypeScript interfaces | Product, Category, Order, Setting types |
| `lib/utils.ts` | Helpers | `cn()`, `formatInr()` |
| `SETUP.md` | Deployment guide | Steps for Supabase, admin user, env vars |

---

## 4. Copy-Paste Prompts for AI Models

Send these prompts to the other AI model, attaching the corresponding files.

### Prompt 1 — Security Audit
> "I am reviewing a Next.js + Supabase e-commerce admin dashboard. Please audit these files for security vulnerabilities:
> 1. Are any secret API keys (service_role) exposed to the frontend?
> 2. Does middleware correctly protect `/admin/*` routes without creating redirect loops?
> 3. Are Supabase RLS policies sufficient to prevent non-admins from modifying products, orders, settings, or homepage content?
> 4. Can customers access admin functions by guessing URLs?
> 5. Is there any IDOR risk where one customer could view another customer's order?
>
> Files to review: middleware.ts, lib/supabase.ts, lib/supabase-server.ts, supabase/schema.sql, app/admin/layout.tsx, app/admin/login/page.tsx"

### Prompt 2 — Feature Completeness
> "Here is the original requirement list: [paste your original admin requirements]. Review these Next.js files and tell me:
> 1. Which required features are completely missing?
> 2. Which features are partially implemented?
> 3. Are there bugs in the CRUD forms (add, edit, delete)?
> 4. Is image upload handled correctly with previews?
>
> Files to review: app/admin/products/page.tsx, app/admin/categories/page.tsx, app/admin/homepage/page.tsx, app/admin/settings/page.tsx, app/admin/orders/page.tsx, components/ui/file-upload.tsx"

### Prompt 3 — Data Persistence & localStorage
> "The requirement says store data (products, orders, settings) must NOT live only in React state or browser localStorage. They must use a proper database (Supabase). Review these files and confirm:
> 1. Are products fetched from and saved to Supabase?
> 2. Are orders inserted into Supabase on checkout?
> 3. Is any critical data stored only in localStorage?
> 4. Are images stored in Supabase Storage buckets?
>
> Files to review: app/page.tsx, app/checkout/page.tsx, app/admin/products/page.tsx, supabase/schema.sql, components/ui/file-upload.tsx"

### Prompt 4 — Build & TypeScript
> "Review this Next.js 16 App Router code for build-blocking issues:
> 1. Are all components using hooks (`useState`, `useEffect`) marked `'use client'`?
> 2. Are all `lucide-react` icon names valid for the installed version?
> 3. Are there duplicate JSX attributes on any element?
> 4. Is `localStorage` accessed during server-side rendering (which would break the build)?
> 5. Are `>` characters escaped properly in JSX text?
>
> Files to review: app/page.tsx, app/products/[id]/page.tsx, app/checkout/page.tsx, app/admin/*.tsx, components/ui/*.tsx, middleware.ts"

### Prompt 5 — UX Review
> "Review this admin dashboard for a non-technical store owner:
> 1. Is there a clear sidebar navigation?
> 2. Do all forms have Save and Cancel buttons?
> 3. Do image uploads show previews?
> 4. Do delete actions require confirmation?
> 5. Are there success/error toasts?
>
> Files to review: app/admin/layout.tsx, app/admin/products/page.tsx, app/admin/categories/page.tsx, components/ui/file-upload.tsx, components/ui/toast.tsx"

---

## 5. Expected Pass/Fail Criteria

| Check | PASS | FAIL |
|-------|------|------|
| `npm run build` | Zero errors, 15 pages generated | Any red error text |
| Admin login | Redirects to dashboard after sign-in | Loops back to login or shows 500 |
| Unauthenticated `/admin/dashboard` | Redirects to `/admin/login` | Renders admin content publicly |
| Add product | Appears in Supabase table + customer homepage | Only appears in browser memory, vanishes on refresh |
| Checkout order | Row exists in Supabase `orders` table | Order vanishes on page refresh |
| Image upload | Public URL generated, image displays | Broken image icon or 404 |
| Delete confirmation | Modal appears before deletion | Item deletes instantly without asking |
| RLS | Non-admin cannot UPDATE products via Supabase API | Public can modify data |

---

## 6. Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Build fails: "localStorage is not defined" | `localStorage` accessed at module level in a Server Component | Move `localStorage` access inside `useEffect` or a `'use client'` component |
| Build fails: "Export Instagram doesn't exist" | `lucide-react` version doesn't have `Instagram` icon | Replace with `Camera` or another available icon |
| Build fails: "dynamic is not compatible with cacheComponents" | `export const dynamic = 'force-dynamic'` conflicts with Next.js config | Remove `dynamic` config; use client-side `useEffect` instead |
| Admin login redirects to itself | `middleware.ts` lacks exception for `/admin/login` | Add `!pathname.startsWith('/admin/login')` condition |
| Images don't display | Supabase Storage bucket is private or missing | Run `schema.sql` to create public buckets; check RLS on storage.objects |
| Orders not saving | RLS blocks INSERT on `orders` | Ensure `schema.sql` has `create policy "Anyone can place an order" on orders for insert with check (true)` |
| TypeScript error: duplicate attribute | Two `placeholder` props on `<Input>` | Remove the duplicate |

---

## 7. How to Test Locally

```bash
cd /home/user/aestheticnova
cp .env.example .env.local
# Edit .env.local with your Supabase URL and anon key
npm install
npm run dev
# Open http://localhost:3000
# Open http://localhost:3000/admin/login
```

Then run through the Phase B feature table manually.

---

## 8. Deliverable Summary for the AI Reviewer

Tell the AI model:
- "This is a complete Next.js + Supabase e-commerce store with admin dashboard."
- "I need you to verify: security (no key leaks, RLS, middleware), feature completeness vs the original spec, data persistence (Supabase not localStorage), build correctness, and UX."
- "Use the file mapping table in VERIFY.md to know which files do what."
- "Report any PASS/FAIL per the criteria table."

---

## 9. Sign-Off

Once the other AI model confirms:
- [ ] Build passes
- [ ] No security vulnerabilities
- [ ] All required features present
- [ ] Data persisted in Supabase
- [ ] Admin routes protected

…the codebase is ready for deployment.
