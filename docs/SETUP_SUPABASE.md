# Setup Supabase untuk Duitly

Selama langkah ini belum dilakukan, Duitly berjalan dalam **mode demo** (data contoh, tanpa login).
Mode demo otomatis mati begitu tiga environment variable di bawah terisi.

## 1. Buat project
1. Daftar/login di https://supabase.com, klik **New project** (free plan cukup).
2. Simpan password database yang kamu buat. Dipakai di langkah 3.

## 2. Ambil kunci API
Project Settings → **API Keys** (atau API):
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = kunci **anon / publishable** (bukan service_role / secret)

## 3. Ambil connection string database
Klik **Connect** (di bagian atas dashboard) → **Transaction pooler** (port 6543) → salin URI, ganti `[YOUR-PASSWORD]`:
- `DATABASE_URL` = `postgresql://postgres.xxxx:PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres`

## 4. Buat tabel
Buka **SQL Editor**, jalankan **berurutan**:
1. isi `supabase/migrations/0000_init.sql`
2. isi `supabase/rls.sql` (wajib: mengunci tabel supaya tidak bisa dibaca lewat API publik)

## 5. Pengaturan Auth
Authentication → **URL Configuration**:
- **Site URL**: URL Vercel-mu, mis. `https://duitly-beta.vercel.app`
- **Redirect URLs**: tambahkan `https://duitly-beta.vercel.app/auth/callback` dan `http://localhost:3000/auth/callback`

Authentication → **Providers**:
- **Email** aktif secara default. Untuk percobaan, kamu bisa mematikan "Confirm email" supaya daftar langsung masuk.
- **Google** (opsional): aktifkan, isi Client ID dan Secret dari Google Cloud Console, lalu tambahkan callback URL yang ditampilkan Supabase ke Google.

## 6. Isi environment variable
- **Vercel**: Project → Settings → Environment Variables, tambahkan tiga variabel di atas lalu **Redeploy**.
- **Lokal**: salin `.env.example` ke `.env.local` dan isi.

## 7. Selesai
Buka aplikasi → **Daftar** → akun pertama otomatis dibuatkan akun (Dompet, Rekening Bank, E-wallet) dan kategori bawaan.
Pasanganmu mendaftar dengan emailnya sendiri. Data kalian terpisah.

## Catatan keamanan
- Semua query di server selalu difilter `user_id` dari sesi login. Tidak ada data milik user lain yang bisa dibaca atau diubah (diuji di `scripts/test-queries.mts`).
- `DATABASE_URL` dan kunci rahasia hanya di environment variable, jangan di-commit.
- Project Supabase free akan di-pause setelah sekitar 1 minggu tanpa aktivitas.
