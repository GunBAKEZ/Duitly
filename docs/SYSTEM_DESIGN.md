# Duitly — System Design

Aplikasi personal finance untuk: tracker pemasukan/pengeluaran, tracker utang, indikator boros, wishlist, dan perencanaan nabung (harian / bulanan / tahunan).

UI mengikuti referensi (ACRU & Fundcy): sidebar kiri, kartu ringkasan, chart, progress bar, tabel transaksi. Dibangun dengan **shadcn/ui** supaya bersih dan konsisten.

---

## 1. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Server Components + Server Actions, tanpa backend terpisah |
| UI | shadcn/ui + Tailwind CSS v4 | Sesuai permintaan, mudah dikustom |
| Chart | shadcn `chart` (Recharts) | Bar, donut, radial gauge seperti referensi |
| Icon | lucide-react | Bawaan shadcn |
| Database | PostgreSQL (Neon/Supabase) | Relasional, cocok untuk data keuangan |
| ORM | Drizzle ORM | Ringan, type-safe |
| Auth | Auth.js (atau Supabase Auth) | Login Google/email |
| Validasi | Zod + react-hook-form (shadcn `form`) | Satu skema untuk client & server |
| Data fetching | Server Components + TanStack Query (untuk interaksi) | |
| Tanggal | date-fns | Hitung hari/bulan/tahun |
| Deploy | Vercel | |

Komponen shadcn yang dipakai: `sidebar`, `card`, `button`, `input`, `select`, `dialog`, `sheet`, `form`, `table`, `data-table` (TanStack Table), `tabs`, `badge`, `progress`, `chart`, `calendar`, `date-picker`, `popover`, `command` (quick search), `dropdown-menu`, `tooltip`, `sonner` (toast), `skeleton`, `avatar`, `alert`, `toggle-group`.

---

## 2. Arsitektur

```
Browser
  │
  ▼
Next.js (App Router)
  ├── app/(auth)/login
  └── app/(app)/            ← layout dengan Sidebar
        ├── dashboard
        ├── transactions
        ├── debts
        ├── spending        (analisis boros)
        ├── wishlist
        ├── savings
        ├── budgets
        └── settings
  │
  ├── Server Actions / Route Handlers   (mutasi: create/update/delete)
  ├── lib/services/*                    (logika bisnis: boros score, plan nabung)
  └── Drizzle ORM ──► PostgreSQL
```

Prinsip:
- **Uang disimpan sebagai integer** (satuan rupiah, tanpa desimal) → tidak ada error floating point. Format tampilan lewat `Intl.NumberFormat('id-ID')`.
- **Semua query di-scope `user_id`** (siap multi-user walau awalnya personal).
- **Logika bisnis di `lib/services`**, bukan di komponen UI → mudah dites.
- Angka turunan (saldo, skor boros, progress) **dihitung dari data**, tidak disimpan, agar selalu konsisten.

---

## 3. Data Model

```
users
  id, email, name, avatar_url, currency (default 'IDR'), created_at

accounts                      -- dompet / rekening / e-wallet / kartu
  id, user_id, name, type (cash|bank|ewallet|credit_card),
  opening_balance, color, archived

categories
  id, user_id, name, icon, color,
  kind (income|expense),
  nature (need|want|saving)   -- dasar analisis boros (50/30/20)

transactions
  id, user_id, account_id, category_id,
  type (income|expense|transfer),
  amount (int > 0), date, note,
  transfer_account_id (nullable, untuk transfer),
  debt_payment_id (nullable), savings_contribution_id (nullable),
  created_at

budgets                       -- batas pengeluaran
  id, user_id, category_id (nullable = total keseluruhan),
  period (monthly), amount, month (YYYY-MM)

debts                         -- utang & piutang
  id, user_id, direction (owe|owed_to_me),
  counterparty (nama orang/lembaga), principal, interest_note,
  start_date, due_date, status (active|paid|overdue),
  installment_amount (nullable), installment_every (nullable), note

debt_payments
  id, debt_id, amount, paid_at, account_id, note

wishlist_items
  id, user_id, name, price, url, image_url,
  priority (low|medium|high), status (wanted|saving|bought|dropped),
  target_date (nullable), savings_goal_id (nullable), note

savings_goals
  id, user_id, name, target_amount, start_date, target_date,
  cadence (daily|weekly|monthly|yearly),
  wishlist_item_id (nullable), status (active|done|paused)

savings_contributions
  id, goal_id, amount, date, account_id, note
```

Relasi inti:
- `transactions` adalah sumber kebenaran arus kas. Bayar utang & setor tabungan membuat transaksi otomatis (lewat `debt_payment_id` / `savings_contribution_id`) sehingga saldo selalu cocok.
- Wishlist bisa "dipromosikan" jadi `savings_goal` dengan 1 klik.

Index penting: `transactions(user_id, date)`, `transactions(user_id, category_id, date)`, `debts(user_id, status, due_date)`.

---

## 4. Fitur & Logika

### 4.1 Tracker Pemasukan / Pengeluaran
- Tambah cepat lewat dialog (nominal, kategori, akun, tanggal, catatan). Tombol global **"+ Transaksi"**.
- Tabel transaksi (shadcn data-table): filter tanggal, kategori, akun, tipe; search; sort; pagination.
- Transfer antar akun tidak dihitung sebagai pemasukan/pengeluaran.
- Saldo akun = `opening_balance + Σ income − Σ expense ± transfer`.

### 4.2 Tracker Utang
- Dua tab: **Utang saya** (`owe`) dan **Piutang** (`owed_to_me`).
- Tiap utang: sisa = `principal − Σ debt_payments`. Progress bar pelunasan.
- Status otomatis: `overdue` jika `due_date < today` dan sisa > 0.
- **Pengingat jatuh tempo**: kartu "Harus dibayar 7 hari ke depan" di dashboard + badge di sidebar.
- Bayar utang → dialog nominal + akun → otomatis membuat `debt_payment` + `transaction` (expense).
- Ringkasan: total utang aktif, total piutang, cicilan bulan ini.

### 4.3 Seberapa Boros (Spending Insight)
Skor boros 0–100 (makin tinggi = makin boros), gabungan:

| Sinyal | Rumus | Bobot |
|---|---|---|
| Rasio pengeluaran | `expense / income` bulan ini | 40% |
| Porsi "want" | `Σ expense nature=want / income` vs target 30% | 25% |
| Budget terpakai | `expense / budget` (jika ada) | 20% |
| Tren | `expense bulan ini` vs rata-rata 3 bulan terakhir | 15% |

Label: **Hemat** (<40) · **Seimbang** (40–70) · **Boros** (>70).

Tampilan:
- Gauge setengah lingkaran (seperti "Financial health" di referensi).
- Cost analysis: bar bertingkat per kategori + persentase.
- Aturan **50/30/20** (Need / Want / Saving) dibanding aktual.
- Insight otomatis, mis. *"Pengeluaran Makan naik 32% dibanding bulan lalu"*, *"Rata-rata harian Rp85.000, proyeksi akhir bulan Rp2,6 jt di atas budget"*.
- Heatmap/bar per hari dalam seminggu untuk lihat hari paling boros.

### 4.4 Wishlist
- Kartu grid: gambar, nama, harga, prioritas, status.
- Filter status/prioritas; total nilai wishlist.
- Tombol **"Mulai nabung"** → membuat `savings_goal` dengan target harga & tanggal.
- Indikator **"Bisa dibeli?"**: bandingkan harga dengan sisa budget "want" bulan ini dan total tabungan.
- Saran anti-impulsif: item berstatus `wanted` lebih dari 30 hari ditandai "masih mau?".

### 4.5 Atur Nabung Harian / Bulanan / Tahunan
Input: target, tanggal target, cadence. Sistem menghitung setoran yang dibutuhkan:

```
sisa      = target_amount − Σ contributions
periode   = jumlah hari/minggu/bulan/tahun dari hari ini ke target_date (min 1)
per_cadence = ceil(sisa / periode)
```

Contoh: target Rp12.000.000 dalam 6 bulan → Rp2.000.000/bulan ≈ Rp66.700/hari.
- Tampilkan ketiga konversi (harian, mingguan, bulanan, tahunan) sekaligus dan cadence pilihan user dijadikan utama.
- Status **on track / tertinggal**: bandingkan tabungan aktual dengan garis ideal sampai hari ini.
- Estimasi tanggal tercapai berdasarkan rata-rata setoran 30 hari terakhir.
- Goal tracker di dashboard: progress bar + "Sisa X bulan".
- Opsi **tantangan nabung** (mis. 52 minggu) sebagai fase lanjutan.

---

## 5. Halaman & Layout

Layout global (dari referensi): **Sidebar kiri** (shadcn `sidebar`, collapsible) + **header** (quick search `command`, notifikasi, tema, profil, tombol "+ Transaksi") + konten.

Sidebar menu:
- Dashboard
- Transaksi
- Utang
- Analisis Boros
- Wishlist
- Tabungan
- Budget
- Pengaturan

### Dashboard (halaman utama)
```
┌────────────┬───────────────────────────────────────────────┐
│            │ Header: search · notif · tema · [+ Transaksi] │
│  Sidebar   ├───────────────────────────────────────────────┤
│            │ [Saldo] [Pemasukan] [Pengeluaran] [Utang aktif]│
│            ├───────────────────────────┬───────────────────┤
│            │ Arus kas (bar chart,      │ Skor Boros (gauge)│
│            │ toggle 7d/30d/12m)        │ + insight         │
│            ├──────────────┬────────────┼───────────────────┤
│            │ Budget bulan │ Cost       │ Goal tracker      │
│            │ ini (progress)│ analysis  │ (tabungan+wishlist)│
│            ├──────────────┴────────────┴───────────────────┤
│            │ Jatuh tempo utang │ Transaksi terbaru          │
└────────────┴───────────────────────────────────────────────┘
```

| Widget | Komponen shadcn |
|---|---|
| KPI card | `Card` + `Badge` (tren ▲▼) |
| Arus kas | `ChartContainer` + `BarChart`, `ToggleGroup` periode |
| Skor boros | `RadialBarChart` (gauge) |
| Budget limit | `Progress` |
| Cost analysis | Stacked bar + daftar kategori |
| Goal tracker | `Progress` + `Badge` status |
| Transaksi terbaru | `Table` + `Badge` status |

### Halaman lain
- **Transaksi**: data-table lengkap + filter + export CSV.
- **Utang**: tab Utang/Piutang, kartu per utang, riwayat pembayaran di `Sheet`.
- **Analisis Boros**: skor, 50/30/20, tren 6 bulan, top kategori, insight.
- **Wishlist**: grid kartu + dialog tambah.
- **Tabungan**: daftar goal, detail goal dengan chart garis (aktual vs ideal) dan kalkulator harian/bulanan/tahunan.
- **Budget**: set batas per kategori per bulan.

### Design tokens
- Aksen utama **hijau lime** (seperti referensi): `--primary` ≈ `oklch(0.85 0.2 125)`, teks di atas primary gelap.
- Hijau tua untuk income, lime untuk saving, oranye untuk expense, merah untuk overdue.
- Radius besar (`--radius: 0.75rem`), card putih dengan border tipis & shadow halus, latar `neutral-100`.
- Font: Inter / Plus Jakarta Sans.
- Dark mode via `next-themes`.
- Responsif: sidebar jadi `Sheet` di mobile; grid 1 kolom.

---

## 6. Struktur Folder

```
duitly/
├─ docs/SYSTEM_DESIGN.md
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/
│  │  └─ (app)/
│  │     ├─ layout.tsx          # sidebar + header
│  │     ├─ dashboard/
│  │     ├─ transactions/
│  │     ├─ debts/
│  │     ├─ spending/
│  │     ├─ wishlist/
│  │     ├─ savings/
│  │     └─ budgets/
│  ├─ components/
│  │  ├─ ui/                    # shadcn
│  │  ├─ layout/                # app-sidebar, header
│  │  └─ features/              # transaction-form, debt-card, goal-card, ...
│  ├─ db/
│  │  ├─ schema.ts              # Drizzle
│  │  └─ migrations/
│  ├─ lib/
│  │  ├─ services/              # spending-score, savings-plan, debts
│  │  ├─ validators/            # Zod
│  │  ├─ format.ts              # rupiah, tanggal
│  │  └─ auth.ts
│  └─ actions/                  # server actions
└─ drizzle.config.ts
```

---

## 7. Keamanan & Kualitas
- Auth wajib di semua route `(app)`; semua query difilter `user_id`.
- Validasi Zod di server action (jangan percaya client).
- Env var untuk `DATABASE_URL` dan secret auth; tidak di-commit.
- Unit test untuk `lib/services` (skor boros, rencana nabung, status utang) dengan Vitest.
- Seed data demo agar dashboard bisa dilihat langsung.

---

## 8. Roadmap

| Fase | Isi |
|---|---|
| **1 — Fondasi** | Setup Next.js + shadcn + Drizzle + auth, layout sidebar, akun & kategori |
| **2 — Tracker** | CRUD transaksi, data-table, dashboard KPI + arus kas |
| **3 — Utang** | Utang/piutang, pembayaran, pengingat jatuh tempo |
| **4 — Budget & Boros** | Budget, skor boros, cost analysis, insight |
| **5 — Nabung & Wishlist** | Goal, kalkulator harian/bulanan/tahunan, wishlist → goal |
| **6 — Polish** | Dark mode, export CSV, PWA, notifikasi, import dari CSV/bank |

Pengembangan lanjutan (opsional): transaksi berulang (langganan), multi-currency, scan struk, laporan PDF bulanan, shared wallet.

---

## 9. Keputusan Terbuka
1. Hanya untuk satu orang, atau nanti multi-user?
2. Bahasa UI: Indonesia saja atau dwibahasa?
3. Database: Postgres hosted (Neon/Supabase) atau SQLite lokal yang lebih sederhana?
4. Perlu input transaksi cepat via mobile (PWA)?
