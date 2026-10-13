# Duitly

Personal finance tracker: pengeluaran, utang, analisis boros, wishlist, dan tabungan.
Next.js 15 · shadcn/ui · Tailwind v4 · next-intl (ID/EN) · Supabase (Postgres + Auth) · Drizzle · PWA.

Desain lengkap: [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md)

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
```

Saat ini halaman memakai **data contoh** (`src/lib/mock-data.ts`). Belum ada login atau koneksi database.

## Menyambungkan Supabase (langkah berikutnya)

1. Buat project di supabase.com (free plan cukup).
2. Salin `.env.example` ke `.env.local` dan isi nilainya.
3. `npx drizzle-kit generate && npx drizzle-kit migrate`
4. Jalankan `supabase/rls.sql` di SQL editor agar tiap user hanya bisa melihat datanya sendiri.

## Struktur

- `src/app/(app)/` halaman: dashboard, transactions, debts, spending, wishlist, savings, settings
- `src/lib/services/` logika bisnis (skor boros, rencana nabung)
- `src/db/schema.ts` skema Drizzle · `supabase/rls.sql` Row Level Security
- `messages/{id,en}.json` terjemahan; bahasa disimpan di cookie `locale`
- `public/manifest.webmanifest` + `public/sw.js` untuk PWA (install lewat "Add to Home Screen")
