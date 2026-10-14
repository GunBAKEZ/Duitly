import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import * as mock from "@/lib/mock-data";
import { getDailyCashflow, getExpenseByCategory, getMonthSummary, listDebts, listGoals, listTransactions } from "@/lib/queries";

export type TxRow = { id: string | number; name: string; type: "income" | "expense"; amount: number; date: string };

export type DashboardData = {
  demo: boolean;
  referenceDate: string;
  kpis: { balance: number; income: number; expense: number; incomeDelta?: number; expenseDelta?: number; debt: number };
  daily: { date: string; income: number; expense: number }[];
  costs: { key: string; value: number }[];
  recent: TxRow[];
  budget: { used: number; limit: number } | null;
  goals: { name: string; saved: number; target: number }[];
  dueSoon: { id: number; who: string; due: string; installment: number }[];
};

export async function loadDashboard(): Promise<DashboardData> {
  if (!isConfigured) {
    return {
      demo: true,
      referenceDate: mock.REFERENCE_DATE,
      kpis: mock.kpis,
      daily: mock.dailyCashflow,
      costs: mock.costCategories,
      recent: mock.transactions.slice(0, 5).map((t) => ({ id: t.id, name: t.name, type: t.type, amount: t.amount, date: t.date })),
      budget: mock.budget,
      goals: mock.goals,
      dueSoon: mock.debts
        .filter((d) => d.direction === "owe" && d.principal > d.paid)
        .slice(0, 3)
        .map((d) => ({ id: d.id, who: d.who, due: d.due, installment: d.installment })),
    };
  }

  const user = await getUser();
  if (!user) redirect("/login");
  const db = getDb();
  const now = new Date();
  const [summary, daily, costs, recent, debts, goals] = await Promise.all([
    getMonthSummary(db, user.id, now),
    getDailyCashflow(db, user.id, now, 90),
    getExpenseByCategory(db, user.id, now),
    listTransactions(db, user.id, 5),
    listDebts(db, user.id),
    listGoals(db, user.id),
  ]);
  const owe = debts.filter((d) => d.direction === "owe" && d.principal > d.paid);

  return {
    demo: false,
    referenceDate: now.toISOString().slice(0, 10),
    kpis: { ...summary, debt: owe.reduce((a, d) => a + d.principal - d.paid, 0) },
    daily,
    costs,
    recent: recent.flatMap((t) => (t.type === "transfer" ? [] : [{ ...t, type: t.type }])),
    budget: null,
    goals: goals.filter((g) => g.status === "active").slice(0, 3).map((g) => ({ name: g.name, saved: g.saved, target: g.target })),
    dueSoon: owe.slice(0, 3).map((d, i) => ({
      id: i,
      who: d.counterparty,
      due: d.dueDate ?? "",
      installment: d.installmentAmount ?? d.principal - d.paid,
    })),
  };
}
