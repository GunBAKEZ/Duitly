"use server";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { getDb } from "@/db";
import type { ActionResult } from "@/actions/transactions";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import * as q from "@/lib/queries";
import * as v from "@/lib/validators";

type Db = ReturnType<typeof getDb>;

async function run<S extends z.ZodType>(
  schema: S,
  input: unknown,
  fn: (db: Db, userId: string, data: z.infer<S>) => Promise<unknown>,
): Promise<ActionResult> {
  if (!isConfigured) return { ok: false, error: "demo" };
  const user = await getUser();
  if (!user) return { ok: false, error: "failed" };
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await fn(getDb(), user.id, parsed.data);
  } catch {
    return { ok: false, error: "failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function createDebtAction(input: unknown) {
  return run(v.debtSchema, input, (db, u, d) => q.createDebt(db, u, d));
}
export async function payDebtAction(input: unknown) {
  return run(v.payDebtSchema, input, (db, u, d) => q.payDebt(db, u, d));
}
export async function deleteDebtAction(id: string) {
  return run(v.idSchema, id, (db, u, d) => q.deleteDebt(db, u, d));
}

export async function createGoalAction(input: unknown) {
  return run(v.goalSchema, input, (db, u, d) => q.createGoal(db, u, d));
}
export async function addContributionAction(input: unknown) {
  return run(v.contributionSchema, input, (db, u, d) => q.addContribution(db, u, d));
}
export async function deleteGoalAction(id: string) {
  return run(v.idSchema, id, (db, u, d) => q.deleteGoal(db, u, d));
}

export async function createWishAction(input: unknown) {
  return run(v.wishSchema, input, (db, u, d) => q.createWish(db, u, d));
}
export async function startSavingAction(input: unknown) {
  return run(v.startSavingSchema, input, (db, u, d) => q.startSavingFromWish(db, u, d));
}
export async function deleteWishAction(id: string) {
  return run(v.idSchema, id, (db, u, d) => q.deleteWish(db, u, d));
}
