import * as v from "../src/lib/validators";

const assert = (c: unknown, m: string) => {
  if (!c) throw new Error("FAIL: " + m);
  console.log("ok  -", m);
};
const uuid = "11111111-1111-4111-8111-111111111111";

const debt = v.debtSchema.parse({ direction: "owe", counterparty: " Dimas ", principal: "1000000", dueDate: "", installmentAmount: "" });
assert(debt.principal === 1_000_000 && debt.dueDate === null && debt.installmentAmount === null && debt.counterparty === "Dimas", "debt form: empty optionals -> null, strings -> numbers");
assert(!v.debtSchema.safeParse({ direction: "owe", counterparty: "x", principal: "-5" }).success, "negative amount rejected");
assert(!v.debtSchema.safeParse({ direction: "hack", counterparty: "x", principal: "5" }).success, "unknown direction rejected");
assert(!v.debtSchema.safeParse({ direction: "owe", counterparty: "x", principal: "1.5" }).success, "fractional rupiah rejected");
assert(v.transactionSchema.safeParse({ type: "expense", name: "Makan", amount: "25000", date: "2026-10-13", accountId: uuid, categoryId: null, note: null }).success, "transaction form parses");
assert(!v.transactionSchema.safeParse({ type: "transfer", name: "x", amount: "1", date: "2026-10-13", accountId: uuid, categoryId: null }).success, "transfer type not allowed from quick-add");
assert(!v.transactionSchema.safeParse({ type: "income", name: "x", amount: "1", date: "13/10/2026", accountId: uuid, categoryId: null }).success, "bad date format rejected");
assert(v.startSavingSchema.parse({ id: uuid, months: "6" }).months === 6, "months coerced");
assert(!v.startSavingSchema.safeParse({ id: "not-a-uuid", months: "6" }).success, "bad id rejected");
assert(v.wishSchema.safeParse({ name: "Sepatu", price: "1500000", priority: "low" }).success, "wish parses");
console.log("ALL PASSED");
