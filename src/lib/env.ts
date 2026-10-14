export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Mode demo: Supabase belum dikonfigurasi, aplikasi memakai data contoh tanpa login. */
export const isConfigured = Boolean(supabaseUrl && supabaseKey && process.env.DATABASE_URL);
