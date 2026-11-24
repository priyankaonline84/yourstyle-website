# YourStyle catalogue website

A responsive product-catalogue starter for YourStyle, built with React, Vite and Supabase.

## Before running
1. Copy `.env.example` to `.env`.
2. Add your Supabase project URL and publishable/anon key.
3. Add the common WhatsApp Business number in international format, digits only (India: `91` + 10-digit number).
4. Never put a Supabase `service_role` key in this project or in GitHub.

## Run locally
```bash
npm install
npm run dev
```

## Deploy with Netlify
- Build command: `npm run build`
- Publish directory: `dist`
- Add the three environment variables from `.env` in Netlify site settings.
- Connect the `yourstyle-website` GitHub repository after the first code commit.

## Included
- Public catalogue, category filters, product cards and WhatsApp enquiry links.
- Supabase-backed published products, categories and product images.
- Admin login and product add/edit/delete interface.
- Admin image uploads to the `yourstyle-images` bucket.
- Admin access is based on the UID policy configured in Supabase.

The first version intentionally has no online checkout or payment processing.
