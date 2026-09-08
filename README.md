# Fiyoore Gifts

React storefront and Supabase admin dashboard, using the existing plum, coral and gold branding.

## Restore your empty Supabase database

1. Open Supabase ? SQL Editor.
2. Paste and run all of `supabase/schema.sql`. This creates the application tables, indexes, row-level security, sign-up profile trigger, image bucket and eight starter categories.
3. Existing Auth accounts get replacement profiles. Deleted products/orders cannot be recovered by this setup.
4. At the bottom of the SQL file, replace `YOUR_EMAIL_HERE` in the commented administrator query, uncomment that query and run it separately. If you have no account, sign up first.
5. Sign out and sign in again, then visit `/admin`.

The SQL can be rerun against the schema it creates. It is intended for empty application tables, not migration from a different schema. Do not run the old README's separate profile trigger.

## Configure and run

Your `.env` needs:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY
```

Never use a service-role key in the frontend.

```sh
npm install
npm run dev
npm run build
npm run lint
```

On PowerShell systems that block npm.ps1, use `npm.cmd`.

## Add your catalog

- Inventory ? Categories: add, edit, reorder or delete categories. Categories containing products must be emptied by moving their products before deletion.
- Inventory ? Products: choose a required category and enter a name, current price and stock. Upload a PNG/JPEG/WebP/GIF up to 5 MB or paste an image URL.
- Set an optional original price above the current price to include the product in Deals of the day.
- Missing or broken images use `public/picture.png`, including products and categories.
- Categories and newest products appear automatically on the home page. Search, category links and sale filters lead to the shop.
- No demonstration products or sample business branding are inserted.

## Database

Tables: profiles, categories, products, followers, cart_items, orders, order_items.
Public visitors can read the catalog and public profiles. Only admins can manage the catalog, roles and image uploads. Customers can manage their own cart and follows, and read their own orders. Profile role changes are guarded at the database level.

Security references: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## Current limits

Cash checkout supports delivery and pickup. Online card payments are not implemented. Screenshot menus for accounting, HRM, invoices, units and collections are not implemented modules. The sidebar links to working inventory, orders and account administration pages.

## Category uploads and advertising banners

For an existing database, run `supabase/migrations/20260908_advertising_banners.sql` in Supabase SQL Editor. New installations can run the updated `supabase/schema.sql` instead.

- Admin > Inventory > Categories: choose Upload from PC, choose your image, then Save category.
- Admin > Advertisements (`/admin/advertisements`): upload an image, enter a title and display order, and save. Active banners appear on the homepage. Edit to replace an image or hide a banner; Delete removes it from the carousel.
- Use banners around 1680 x 700 pixels. Images are shown in full without cropping or text overlays.
- Multiple active banners slide horizontally every five seconds, with dots and a pause button. Hovering or focusing the carousel pauses rotation. One banner stays still; no banners uses picture.png.
- Category and banner images use the existing product-images bucket with admin-only uploads. Deleting a banner does not delete its storage file, so other references remain valid.

## User dropdown and profile editing

The user icon opens Shop, My profile, Edit profile, Dashboard (admins only), and Sign out. Cart remains visible beside it.

Signed-in users can edit their username, bio and profile photo at `/account/profile`. For existing installations, run `supabase/migrations/20260908_profile_avatars.sql` in Supabase SQL Editor to enable photo uploads. New installations use the updated full schema. Username and bio edits use the existing profile policies. Photos use a public avatars bucket, with writes restricted to each user's own ID folder. Replaced photos remain in storage to preserve existing references.

## Username or email sign-in

Users enter their username (matching the spelling and capitalization in their profile) or their email, plus their existing password. Email login works directly through Supabase Auth. Usernames are resolved server-side by the `username-login` Edge Function; account emails are never added to public profile rows. Values containing @ are treated as emails.

### One-time deployment

From the project folder:

```sh
npx supabase login
npx supabase functions deploy username-login --project-ref YOUR_PROJECT_REF --no-verify-jwt
```

Replace YOUR_PROJECT_REF with the project reference from Supabase Project Settings (also the subdomain in your project's Supabase URL). Both `index.ts` and `handler.mjs` are included automatically by the CLI.

The function must allow unauthenticated requests because it runs before login. It still verifies the password using Supabase Auth. The included `supabase/config.toml` sets this option for this function only. Hosted Supabase supplies SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY; never put the service-role key in frontend environment variables.

No SQL migration is needed for username sign-in. Existing users use their current profile username, including after editing it. Email login remains available if the function has not been deployed. Supabase Auth password verification, account confirmation and rate-limit responses remain in effect.

Validation: `node --test supabase/functions/username-login/handler.test.mjs` checks server-side lookup, token-only success responses, generic credential errors, invalid input, rate-limit responses and CORS. These tests mock Supabase; verify a real account after deployment.

References: [Supabase password sign-in](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [server-only account lookup](https://supabase.com/docs/reference/javascript/auth-admin-getuserbyid), [Edge Function authentication](https://supabase.com/docs/guides/functions/auth).

## Delivery / pickup cash checkout

Run `supabase/migrations/20260908_cash_checkout.sql` in Supabase SQL Editor for an existing database, or the updated full schema for a new installation. No Edge Function deployment is required for checkout.

Checkout opens delivery/pickup choices and cash payment. Customers enter a name and phone number, plus an address for delivery, and press Place order. Cash remains pending until staff collect it; creating an order does not mark it paid. The confirmation shows the reference and total. Admin > Orders shows contact details, delivery address, fulfillment choice and line items.

The checkout RPC uses the signed-in user, locks cart/product rows, calculates current prices, checks stock, creates the order and item snapshots, reduces stock, and clears the purchased cart rows in one transaction. Retries with the same checkout key return the same order. A changed price requires refreshing the cart before ordering. No additional delivery fee is added. Cancelling an order through the current status selector does not automatically restock products; staff must adjust stock as needed.
