# Duitly

Personal finance tracker: pengeluaran, utang, analisis boros, wishlist, dan tabungan.
Next.js 15 · shadcn/ui · Tailwind v4 · next-intl (ID/EN) · Supabase (Postgres + Auth) · Drizzle · PWA.

Desain lengkap: [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Tanpa konfigurasi Supabase, aplikasi berjalan dalam **mode demo** (data contoh, tanpa login).
Panduan menyambungkan database dan login: [docs/SETUP_SUPABASE.md](docs/SETUP_SUPABASE.md).

```bash
npm test           # uji query (Postgres in-memory via PGlite) dan validator
```

## Struktur

- `src/app/(app)/` halaman: dashboard, transactions, debts, spending, wishlist, savings, settings
- `src/lib/queries.ts` semua query database (diuji di `scripts/`)
- `src/lib/services/` logika bisnis (skor boros, rencana nabung)
- `src/actions/` server action (auth, transaksi, utang, tabungan, wishlist)
- `src/db/schema.ts` skema Drizzle · `supabase/rls.sql` Row Level Security
- `messages/{id,en}.json` terjemahan; bahasa disimpan di cookie `locale`
- `public/manifest.webmanifest` + `public/sw.js` untuk PWA (install lewat "Add to Home Screen")
