import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  name: z.string().trim().min(1).max(120),
  amount: z.coerce.number().int().positive().max(1_000_000_000_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  note: z.string().trim().max(500).nullable().optional(),
});

const money = z.coerce.number().int().positive().max(1_000_000_000_000);
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDay = z.preprocess((v) => (v === "" || v == null ? null : v), day.nullable());
const optionalMoney = z.preprocess((v) => (v === "" || v == null ? null : v), money.nullable());

export const debtSchema = z.object({
  direction: z.enum(["owe", "owed_to_me"]),
  counterparty: z.string().trim().min(1).max(120),
  principal: money,
  dueDate: optionalDay,
  installmentAmount: optionalMoney,
});
export const payDebtSchema = z.object({ debtId: z.string().uuid(), amount: money, date: day, accountId: z.string().uuid() });
export const goalSchema = z.object({ name: z.string().trim().min(1).max(120), targetAmount: money, targetDate: day });
export const contributionSchema = z.object({ goalId: z.string().uuid(), amount: money, date: day });
export const wishSchema = z.object({
  name: z.string().trim().min(1).max(120),
  price: money,
  priority: z.enum(["low", "medium", "high"]),
});
export const startSavingSchema = z.object({ id: z.string().uuid(), months: z.coerce.number().int().min(1).max(600) });
export const idSchema = z.string().uuid();
