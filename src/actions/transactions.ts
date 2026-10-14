"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { createTransaction, deleteTransaction } from "@/lib/queries";
import { transactionSchema } from "@/lib/validators";

export type ActionResult = { ok: true } | { ok: false; error: "demo" | "invalid" | "failed" };

export async function createTransactionAction(input: unknown): Promise<ActionResult> {
  if (!isConfigured) return { ok: false, error: "demo" };
  const user = await getUser();
  if (!user) return { ok: false, error: "failed" };
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  try {
    await createTransaction(getDb(), user.id, { ...parsed.data, note: parsed.data.note ?? null });
  } catch {
    return { ok: false, error: "failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  if (!isConfigured) return { ok: false, error: "demo" };
  const user = await getUser();
  if (!user) return { ok: false, error: "failed" };
  try {
    await deleteTransaction(getDb(), user.id, id);
  } catch {
    return { ok: false, error: "failed" };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
