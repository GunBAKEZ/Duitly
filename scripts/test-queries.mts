import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { schema } from "../src/db/schema-export";
import * as q from "../src/lib/queries";

const assert = (c: unknown, m: string) => {
  if (!c) throw new Error("FAIL: " + m);
  console.log("ok  -", m);
};

const client = new PGlite();
const sqlText = readFileSync("supabase/migrations/0000_init.sql", "utf8");
for (const stmt of sqlText.split("--> statement-breakpoint")) if (stmt.trim()) await client.exec(stmt);
const db = drizzle(client, { schema });

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";
const ref = new Date("2026-10-13T00:00:00Z");

await q.ensureDefaults(db as never, A);
await q.ensureDefaults(db as never, A); // idempotent
await q.ensureDefaults(db as never, B);
const accA = await q.listAccounts(db as never, A);
const catA = await q.listCategories(db as never, A);
assert(accA.length === 3 && catA.length === 10, "defaults seeded once per user");

const cash = accA[0].id;
const salary = catA.find((c) => c.name === "Gaji")!.id;
const food = catA.find((c) => c.name === "Makan")!.id;
const shop = catA.find((c) => c.name === "Belanja")!.id;
const mk = (type: "income" | "expense", name: string, amount: number, date: string, categoryId: string) =>
  q.createTransaction(db as never, A, { type, name, amount, date, accountId: cash, categoryId });

await mk("income", "Gaji", 5_000_000, "2026-10-01", salary);
await mk("expense", "Makan siang", 100_000, "2026-10-12", food);
await mk("expense", "Sepatu", 300_000, "2026-10-12", shop);
await mk("income", "Gaji Sep", 4_000_000, "2026-09-01", salary);
await mk("expense", "Makan Sep", 200_000, "2026-09-10", food);

const s = await q.getMonthSummary(db as never, A, ref);
assert(s.income === 5_000_000 && s.expense === 400_000, "month summary totals");
assert(s.incomeDelta === 25 && s.expenseDelta === 100, "month-over-month deltas");
assert(s.balance === 5_000_000 + 4_000_000 - 100_000 - 300_000 - 200_000, "total balance across accounts");

const daily = await q.getDailyCashflow(db as never, A, ref, 90);
assert(daily.length === 90 && daily.at(-1)!.date === "2026-10-13", "daily cashflow is zero-filled 90 days");
assert(daily.find((d) => d.date === "2026-10-12")!.expense === 400_000, "daily aggregation");

const cats = await q.getExpenseByCategory(db as never, A, ref);
assert(cats[0].key === "Belanja" && cats[0].value === 75 && cats[1].value === 25, "expense by category %");

const list = await q.listTransactions(db as never, A, 3);
assert(list.length === 3 && list[0].date >= list[1].date, "list ordered by date desc");

// isolasi antar user
assert((await q.listTransactions(db as never, B)).length === 0, "user B sees nothing");
const victim = list[0].id;
await q.deleteTransaction(db as never, B, victim);
assert((await q.listTransactions(db as never, A, 50)).some((t) => t.id === victim), "user B cannot delete A's tx");
let rejected = false;
await q.createTransaction(db as never, B, { type: "expense", name: "x", amount: 1, date: "2026-10-01", accountId: cash, categoryId: null }).catch(() => (rejected = true));
assert(rejected, "cannot write to another user's account");
await q.deleteTransaction(db as never, A, victim);
assert(!(await q.listTransactions(db as never, A, 50)).some((t) => t.id === victim), "owner can delete");

// ----- utang -----
await q.createDebt(db as never, A, { direction: "owe", counterparty: "Dimas", principal: 1_000_000, dueDate: "2026-10-25", installmentAmount: 500_000 });
await q.createDebt(db as never, A, { direction: "owed_to_me", counterparty: "Rafi", principal: 800_000, dueDate: null, installmentAmount: null });
let debts = await q.listDebts(db as never, A);
assert(debts.length === 2 && debts[0].counterparty === "Dimas" && debts[1].dueDate === null, "debts listed, null due date last");
const dimas = debts[0].id;
const rafi = debts[1].id;
const balBefore = (await q.getMonthSummary(db as never, A, ref)).balance;
await q.payDebt(db as never, A, { debtId: dimas, amount: 400_000, date: "2026-10-13", accountId: cash });
debts = await q.listDebts(db as never, A);
assert(debts.find((d) => d.id === dimas)!.paid === 400_000, "payment recorded");
assert((await q.getMonthSummary(db as never, A, ref)).balance === balBefore - 400_000, "paying debt creates expense tx (balance drops)");
await q.payDebt(db as never, A, { debtId: rafi, amount: 300_000, date: "2026-10-13", accountId: cash });
assert((await q.getMonthSummary(db as never, A, ref)).balance === balBefore - 400_000 + 300_000, "receiving receivable creates income tx");
let over = false;
await q.payDebt(db as never, A, { debtId: dimas, amount: 700_000, date: "2026-10-13", accountId: cash }).catch(() => (over = true));
assert(over, "cannot overpay a debt");
await q.payDebt(db as never, A, { debtId: dimas, amount: 600_000, date: "2026-10-14", accountId: cash });
assert((await q.listDebts(db as never, A)).find((d) => d.id === dimas)!.status === "paid", "debt marked paid when fully paid");
let foreign = false;
await q.payDebt(db as never, B, { debtId: rafi, amount: 1, date: "2026-10-13", accountId: cash }).catch(() => (foreign = true));
assert(foreign, "user B cannot pay A's debt");
assert((await q.listDebts(db as never, B)).length === 0, "debts isolated per user");

// ----- tabungan & wishlist -----
const goalId = await q.createGoal(db as never, A, { name: "Liburan", targetAmount: 4_000_000, targetDate: "2027-01-31" });
await q.addContribution(db as never, A, { goalId, amount: 500_000, date: "2026-10-13" });
await q.addContribution(db as never, A, { goalId, amount: 250_000, date: "2026-10-14" });
const goals = await q.listGoals(db as never, A);
assert(goals.length === 1 && goals[0].saved === 750_000 && goals[0].target === 4_000_000, "goal with contributions summed");
let badGoal = false;
await q.addContribution(db as never, B, { goalId, amount: 1, date: "2026-10-13" }).catch(() => (badGoal = true));
assert(badGoal, "user B cannot contribute to A's goal");

await q.createWish(db as never, A, { name: "Headphone", price: 4_200_000, priority: "high" });
await q.createWish(db as never, A, { name: "Sepatu", price: 1_500_000, priority: "low" });
await q.createWish(db as never, A, { name: "Kursi", price: 3_200_000, priority: "medium" });
let wishes = await q.listWishlist(db as never, A);
assert(wishes.map((w) => w.name).join() === "Headphone,Kursi,Sepatu", "wishlist sorted by priority");
await q.startSavingFromWish(db as never, A, { id: wishes[0].id, months: 6 });
wishes = await q.listWishlist(db as never, A);
assert(wishes.find((w) => w.name === "Headphone")!.status === "saving", "wish moved to saving");
assert((await q.listGoals(db as never, A)).length === 2, "goal created from wish");
let dupe = false;
await q.startSavingFromWish(db as never, A, { id: wishes[0].id, months: 6 }).catch(() => (dupe = true));
assert(dupe, "wish cannot start saving twice");
await q.deleteWish(db as never, B, wishes[0].id);
assert((await q.listWishlist(db as never, A)).length === 3, "user B cannot delete A's wish");
await q.deleteGoal(db as never, A, goalId);
assert((await q.listGoals(db as never, A)).length === 1, "goal deleted (contributions cascade)");
console.log("ALL PASSED");
