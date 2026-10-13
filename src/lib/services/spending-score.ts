export type SpendingInput = {
  income: number;
  expense: number;
  wantExpense: number;
  budget?: number;
  avgExpenseLast3Months?: number;
};

export type SpendingLevel = "frugal" | "balanced" | "wasteful";

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Skor boros 0-100 (makin tinggi makin boros). Bobot: 40/25/20/15. */
export function computeSpendingScore(i: SpendingInput) {
  const ratio = i.income > 0 ? clamp(i.expense / i.income) : 1;
  const wantShare = i.income > 0 ? clamp(i.wantExpense / i.income / 0.6) : 1; // 30% = setengah skala
  const budgetUse = i.budget ? clamp(i.expense / i.budget) : ratio;
  const trend = i.avgExpenseLast3Months ? clamp((i.expense / i.avgExpenseLast3Months - 0.8) / 0.6) : 0.5;

  const score = Math.round((ratio * 0.4 + wantShare * 0.25 + budgetUse * 0.2 + trend * 0.15) * 100);
  const level: SpendingLevel = score < 40 ? "frugal" : score <= 70 ? "balanced" : "wasteful";
  return { score, level };
}
