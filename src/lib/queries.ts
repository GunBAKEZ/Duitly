import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import { schema } from "@/db/schema-export";

type Db = PgDatabase<any, typeof schema>; // eslint-disable-line @typescript-eslint/no-explicit-any
const { accounts, categories, transactions, debts, debtPayments, wishlistItems, savingsGoals, savingsContributions } = schema;

// ---------- tanggal (UTC, format YYYY-MM-DD) ----------
const iso = (d: Date) => d.toISOString().slice(0, 10);
export const monthStart = (ref: Date, offset = 0) =>
  iso(new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() + offset, 1)));

// ---------- default data untuk user baru ----------
const DEFAULT_ACCOUNTS = [
  { name: "Dompet", type: "cash" as const },
  { name: "Rekening Bank", type: "bank" as const },
  { name: "E-wallet", type: "ewallet" as const },
];
const DEFAULT_CATEGORIES = [
  { name: "Gaji", kind: "income" as const, nature: "saving" as const },
  { name: "Freelance", kind: "income" as const, nature: "saving" as const },
  { name: "Lainnya (masuk)", kind: "income" as const, nature: "saving" as const },
  { name: "Makan", kind: "expense" as const, nature: "need" as const },
  { name: "Transport", kind: "expense" as const, nature: "need" as const },
  { name: "Tagihan & Kos", kind: "expense" as const, nature: "need" as const },
  { name: "Kesehatan", kind: "expense" as const, nature: "need" as const },
  { name: "Belanja", kind: "expense" as const, nature: "want" as const },
  { name: "Hiburan", kind: "expense" as const, nature: "want" as const },
  { name: "Lainnya (keluar)", kind: "expense" as const, nature: "want" as const },
];

export async function ensureDefaults(db: Db, userId: string) {
  const existing = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.userId, userId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(accounts).values(DEFAULT_ACCOUNTS.map((a) => ({ ...a, userId })));
  await db.insert(categories).values(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })));
}

// ---------- master data ----------
export async function listAccounts(db: Db, userId: string) {
  const rows = await db
    .select({
      id: accounts.id,
      name: accounts.name,
      type: accounts.type,
      balance: sql<string>`${accounts.openingBalance} + coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} when ${transactions.type} = 'expense' then -${transactions.amount} else 0 end), 0)`,
    })
    .from(accounts)
    .leftJoin(transactions, eq(transactions.accountId, accounts.id))
    .where(eq(accounts.userId, userId))
    .groupBy(accounts.id)
    .orderBy(asc(accounts.createdAt));
  return rows.map((r) => ({ ...r, balance: Number(r.balance) }));
}

export async function listCategories(db: Db, userId: string) {
  return db
    .select({ id: categories.id, name: categories.name, kind: categories.kind, nature: categories.nature })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.name));
}

// ---------- transaksi ----------
export type TransactionInput = {
  type: "income" | "expense";
  name: string;
  amount: number;
  date: string;
  accountId: string;
  categoryId: string | null;
  note?: string | null;
};

export async function createTransaction(db: Db, userId: string, input: TransactionInput) {
  // pastikan akun & kategori milik user ini
  const [acc] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)));
  if (!acc) throw new Error("Akun tidak ditemukan");
  if (input.categoryId) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, input.categoryId), eq(categories.userId, userId)));
    if (!cat) throw new Error("Kategori tidak ditemukan");
  }
  await db.insert(transactions).values({
    userId,
    accountId: input.accountId,
    categoryId: input.categoryId,
    type: input.type,
    name: input.name,
    amount: input.amount,
    date: input.date,
    note: input.note ?? null,
  });
}

export async function deleteTransaction(db: Db, userId: string, id: string) {
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function listTransactions(db: Db, userId: string, limit = 50) {
  return db
    .select({
      id: transactions.id,
      name: transactions.name,
      type: transactions.type,
      amount: transactions.amount,
      date: transactions.date,
      category: categories.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(limit);
}

// ---------- ringkasan ----------
async function sumByType(db: Db, userId: string, from: string, to: string) {
  const rows = await db
    .select({ type: transactions.type, total: sql<string>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gte(transactions.date, from), lt(transactions.date, to)))
    .groupBy(transactions.type);
  const get = (t: string) => Number(rows.find((r) => r.type === t)?.total ?? 0);
  return { income: get("income"), expense: get("expense") };
}

const pct = (cur: number, prev: number) => (prev === 0 ? undefined : Math.round(((cur - prev) / prev) * 1000) / 10);

export async function getMonthSummary(db: Db, userId: string, ref: Date) {
  const [cur, prev, accs] = await Promise.all([
    sumByType(db, userId, monthStart(ref), monthStart(ref, 1)),
    sumByType(db, userId, monthStart(ref, -1), monthStart(ref)),
    listAccounts(db, userId),
  ]);
  return {
    income: cur.income,
    expense: cur.expense,
    incomeDelta: pct(cur.income, prev.income),
    expenseDelta: pct(cur.expense, prev.expense),
    balance: accs.reduce((a, x) => a + x.balance, 0),
  };
}

export async function getDailyCashflow(db: Db, userId: string, ref: Date, days = 90) {
  const end = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  const next = new Date(end);
  next.setUTCDate(next.getUTCDate() + 1);

  const rows = await db
    .select({
      date: transactions.date,
      type: transactions.type,
      total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gte(transactions.date, iso(start)), lt(transactions.date, iso(next))))
    .groupBy(transactions.date, transactions.type);

  const byDay = new Map<string, { income: number; expense: number }>();
  for (const r of rows) {
    const e = byDay.get(r.date) ?? { income: 0, expense: 0 };
    if (r.type === "income") e.income = Number(r.total);
    if (r.type === "expense") e.expense = Number(r.total);
    byDay.set(r.date, e);
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    const key = iso(d);
    return { date: key, income: byDay.get(key)?.income ?? 0, expense: byDay.get(key)?.expense ?? 0 };
  });
}

export async function getExpenseByCategory(db: Db, userId: string, ref: Date) {
  const rows = await db
    .select({
      name: sql<string>`coalesce(${categories.name}, 'Lainnya')`,
      nature: sql<string>`coalesce(${categories.nature}, 'want')`,
      total: sql<string>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .leftJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "expense"),
        gte(transactions.date, monthStart(ref)),
        lt(transactions.date, monthStart(ref, 1)),
      ),
    )
    .groupBy(categories.name, categories.nature);
  const sum = rows.reduce((a, r) => a + Number(r.total), 0);
  return rows
    .map((r) => ({
      key: r.name,
      nature: r.nature as "need" | "want" | "saving",
      amount: Number(r.total),
      value: sum === 0 ? 0 : Math.round((Number(r.total) / sum) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ---------- utang & piutang ----------
export type DebtInput = {
  direction: "owe" | "owed_to_me";
  counterparty: string;
  principal: number;
  dueDate: string | null;
  installmentAmount: number | null;
};

export async function createDebt(db: Db, userId: string, input: DebtInput) {
  await db.insert(debts).values({ userId, ...input });
}

export async function listDebts(db: Db, userId: string) {
  const rows = await db
    .select({
      id: debts.id,
      direction: debts.direction,
      counterparty: debts.counterparty,
      principal: debts.principal,
      dueDate: debts.dueDate,
      installmentAmount: debts.installmentAmount,
      status: debts.status,
      paid: sql<string>`coalesce(sum(${debtPayments.amount}), 0)`,
    })
    .from(debts)
    .leftJoin(debtPayments, eq(debtPayments.debtId, debts.id))
    .where(eq(debts.userId, userId))
    .groupBy(debts.id)
    .orderBy(sql`${debts.dueDate} asc nulls last`, asc(debts.counterparty));
  return rows.map((r) => ({ ...r, paid: Number(r.paid) }));
}

export async function payDebt(
  db: Db,
  userId: string,
  input: { debtId: string; amount: number; date: string; accountId: string },
) {
  await db.transaction(async (tx) => {
    const [debt] = await tx.select().from(debts).where(and(eq(debts.id, input.debtId), eq(debts.userId, userId)));
    if (!debt) throw new Error("Utang tidak ditemukan");
    const [acc] = await tx
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.id, input.accountId), eq(accounts.userId, userId)));
    if (!acc) throw new Error("Akun tidak ditemukan");
    const [{ paid }] = await tx
      .select({ paid: sql<string>`coalesce(sum(${debtPayments.amount}), 0)` })
      .from(debtPayments)
      .where(eq(debtPayments.debtId, debt.id));
    const remaining = debt.principal - Number(paid);
    if (input.amount > remaining) throw new Error("Jumlah melebihi sisa");

    const [payment] = await tx
      .insert(debtPayments)
      .values({ userId, debtId: debt.id, accountId: input.accountId, amount: input.amount, paidAt: input.date })
      .returning({ id: debtPayments.id });
    const owe = debt.direction === "owe";
    await tx.insert(transactions).values({
      userId,
      accountId: input.accountId,
      categoryId: null,
      type: owe ? "expense" : "income",
      name: `${owe ? "Bayar utang" : "Terima piutang"}: ${debt.counterparty}`,
      amount: input.amount,
      date: input.date,
      debtPaymentId: payment.id,
    });
    if (input.amount === remaining) await tx.update(debts).set({ status: "paid" }).where(eq(debts.id, debt.id));
  });
}

export async function deleteDebt(db: Db, userId: string, id: string) {
  await db.delete(debts).where(and(eq(debts.id, id), eq(debts.userId, userId)));
}

// ---------- tabungan ----------
export async function createGoal(
  db: Db,
  userId: string,
  input: { name: string; targetAmount: number; targetDate: string },
) {
  const [row] = await db
    .insert(savingsGoals)
    .values({ userId, ...input, startDate: iso(new Date()) })
    .returning({ id: savingsGoals.id });
  return row.id;
}

export async function listGoals(db: Db, userId: string) {
  const rows = await db
    .select({
      id: savingsGoals.id,
      name: savingsGoals.name,
      target: savingsGoals.targetAmount,
      startDate: savingsGoals.startDate,
      targetDate: savingsGoals.targetDate,
      status: savingsGoals.status,
      saved: sql<string>`coalesce(sum(${savingsContributions.amount}), 0)`,
    })
    .from(savingsGoals)
    .leftJoin(savingsContributions, eq(savingsContributions.goalId, savingsGoals.id))
    .where(eq(savingsGoals.userId, userId))
    .groupBy(savingsGoals.id)
    .orderBy(asc(savingsGoals.targetDate));
  return rows.map((r) => ({ ...r, saved: Number(r.saved) }));
}

export async function addContribution(db: Db, userId: string, input: { goalId: string; amount: number; date: string }) {
  const [goal] = await db
    .select({ id: savingsGoals.id })
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, input.goalId), eq(savingsGoals.userId, userId)));
  if (!goal) throw new Error("Target tidak ditemukan");
  await db.insert(savingsContributions).values({ userId, ...input });
}

export async function deleteGoal(db: Db, userId: string, id: string) {
  await db.delete(savingsGoals).where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)));
}

// ---------- wishlist ----------
export async function createWish(
  db: Db,
  userId: string,
  input: { name: string; price: number; priority: "low" | "medium" | "high"; url?: string | null },
) {
  await db.insert(wishlistItems).values({ userId, ...input, url: input.url ?? null });
}

export async function listWishlist(db: Db, userId: string) {
  return db
    .select({
      id: wishlistItems.id,
      name: wishlistItems.name,
      price: wishlistItems.price,
      priority: wishlistItems.priority,
      status: wishlistItems.status,
      url: wishlistItems.url,
      createdAt: wishlistItems.createdAt,
    })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId))
    .orderBy(
      sql`case ${wishlistItems.priority} when 'high' then 0 when 'medium' then 1 else 2 end`,
      desc(wishlistItems.createdAt),
    );
}

export async function deleteWish(db: Db, userId: string, id: string) {
  await db.delete(wishlistItems).where(and(eq(wishlistItems.id, id), eq(wishlistItems.userId, userId)));
}

/** Jadikan wishlist sebagai target tabungan dengan tenggat N bulan dari sekarang. */
export async function startSavingFromWish(db: Db, userId: string, input: { id: string; months: number }) {
  await db.transaction(async (tx) => {
    const [wish] = await tx
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.id, input.id), eq(wishlistItems.userId, userId)));
    if (!wish) throw new Error("Wishlist tidak ditemukan");
    if (wish.savingsGoalId) throw new Error("Sudah punya target tabungan");
    const target = new Date();
    target.setUTCMonth(target.getUTCMonth() + input.months);
    const [goal] = await tx
      .insert(savingsGoals)
      .values({ userId, name: wish.name, targetAmount: wish.price, startDate: iso(new Date()), targetDate: iso(target) })
      .returning({ id: savingsGoals.id });
    await tx
      .update(wishlistItems)
      .set({ status: "saving", savingsGoalId: goal.id })
      .where(eq(wishlistItems.id, wish.id));
  });
}
