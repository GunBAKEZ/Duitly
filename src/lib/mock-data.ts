// Data contoh untuk tampilan awal. Akan diganti query Supabase.
export const kpis = {
  balance: 12450000,
  income: 15000000,
  incomeDelta: 5.1,
  expense: 6700000,
  expenseDelta: -15.5,
  debt: 4300000,
};

// 90 hari terakhir sampai 2026-10-13 (deterministik supaya tidak berubah antar render).
export const REFERENCE_DATE = "2026-10-13";
export const dailyCashflow = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(REFERENCE_DATE);
  d.setDate(d.getDate() - (89 - i));
  const wave = (i * 37) % 11;
  const payday = d.getDate() === 1 ? 2500000 : d.getDate() === 15 ? 1200000 : 0;
  return {
    date: d.toISOString().slice(0, 10),
    income: payday + (wave % 4 === 0 ? 150000 + wave * 20000 : 0),
    expense: 90000 + wave * 45000 + (d.getDay() === 6 ? 250000 : 0),
  };
});

export const budget = { used: 8600000, limit: 10000000 };

export const costCategories = [
  { key: "Housing", value: 18, nature: "need" },
  { key: "Debt", value: 7, nature: "need" },
  { key: "Food", value: 6, nature: "need" },
  { key: "Transport", value: 9, nature: "need" },
  { key: "Health", value: 10, nature: "need" },
  { key: "Fun", value: 17, nature: "want" },
  { key: "Other", value: 33, nature: "want" },
];

export const goals = [
  { name: "Liburan Bali", saved: 2500000, target: 4000000, monthsLeft: 3 },
  { name: "Dana Darurat", saved: 7000000, target: 10000000, monthsLeft: 4 },
  { name: "Motor baru", saved: 1600000, target: 20000000, monthsLeft: 30 },
];

export const debts = [
  { id: 1, direction: "owe", who: "Bank ABC (KPR)", principal: 12000000, paid: 8000000, due: "2026-10-20", installment: 1000000 },
  { id: 2, direction: "owe", who: "Dimas", principal: 1500000, paid: 500000, due: "2026-10-25", installment: 500000 },
  { id: 3, direction: "owe", who: "Paylater", principal: 2800000, paid: 0, due: "2026-10-08", installment: 700000 },
  { id: 4, direction: "owed", who: "Rafi", principal: 800000, paid: 300000, due: "2026-11-01", installment: 0 },
  { id: 5, direction: "owed", who: "Kantor (reimburse)", principal: 1250000, paid: 0, due: "2026-10-30", installment: 0 },
] as const;

export const wishlist = [
  { id: 1, name: "Headphone Sony WH-1000XM5", price: 4200000, priority: "high", daysWaiting: 12 },
  { id: 2, name: "Sepatu lari", price: 1500000, priority: "medium", daysWaiting: 40 },
  { id: 3, name: "Kursi ergonomis", price: 3200000, priority: "high", daysWaiting: 5 },
  { id: 4, name: "Kamera mirrorless", price: 11500000, priority: "low", daysWaiting: 90 },
  { id: 5, name: "Mechanical keyboard", price: 1800000, priority: "medium", daysWaiting: 21 },
] as const;

export const transactions = [
  { id: 1, name: "Gaji Oktober", category: "Salary", type: "income", amount: 15000000, date: "2026-10-01", status: "completed" },
  { id: 2, name: "Sewa kos", category: "Housing", type: "expense", amount: 2500000, date: "2026-10-02", status: "completed" },
  { id: 3, name: "Makan siang tim", category: "Food", type: "expense", amount: 185000, date: "2026-10-09", status: "completed" },
  { id: 4, name: "Langganan Spotify", category: "Fun", type: "expense", amount: 55000, date: "2026-10-10", status: "pending" },
  { id: 5, name: "Bensin", category: "Transport", type: "expense", amount: 120000, date: "2026-10-11", status: "completed" },
  { id: 6, name: "Freelance desain", category: "Side income", type: "income", amount: 1200000, date: "2026-10-12", status: "completed" },
  { id: 7, name: "Belanja bulanan", category: "Food", type: "expense", amount: 940000, date: "2026-10-12", status: "completed" },
] as const;

export const needWantSaving = { need: 48, want: 41, saving: 11 };
