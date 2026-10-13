export type SavingsPlanInput = {
  targetAmount: number;
  saved: number;
  months: number;
};

export type SavingsPlan = {
  remaining: number;
  perDay: number;
  perWeek: number;
  perMonth: number;
  perYear: number;
};

const DAYS_PER_MONTH = 30;
const WEEKS_PER_MONTH = 30 / 7;

/** Setoran yang dibutuhkan per hari/minggu/bulan/tahun agar target tercapai. */
export function computeSavingsPlan({ targetAmount, saved, months }: SavingsPlanInput): SavingsPlan {
  const remaining = Math.max(0, targetAmount - saved);
  const m = Math.max(1, months);
  return {
    remaining,
    perDay: Math.ceil(remaining / (m * DAYS_PER_MONTH)),
    perWeek: Math.ceil(remaining / (m * WEEKS_PER_MONTH)),
    perMonth: Math.ceil(remaining / m),
    perYear: Math.ceil((remaining / m) * 12),
  };
}

/** Bandingkan tabungan aktual dengan garis ideal (linear). */
export function isOnTrack(saved: number, targetAmount: number, monthsElapsed: number, totalMonths: number) {
  if (totalMonths <= 0) return saved >= targetAmount;
  const ideal = (targetAmount * Math.min(monthsElapsed, totalMonths)) / totalMonths;
  return saved >= ideal;
}
