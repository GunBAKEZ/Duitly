import { date, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// user_id = auth.users.id (Supabase Auth). Semua data dipisah per user lewat RLS.
// Uang disimpan sebagai integer rupiah.

export const accountType = pgEnum("account_type", ["cash", "bank", "ewallet", "credit_card"]);
export const txType = pgEnum("tx_type", ["income", "expense", "transfer"]);
export const nature = pgEnum("category_nature", ["need", "want", "saving"]);
export const debtDirection = pgEnum("debt_direction", ["owe", "owed_to_me"]);
export const debtStatus = pgEnum("debt_status", ["active", "paid"]);
export const priority = pgEnum("priority", ["low", "medium", "high"]);
export const wishStatus = pgEnum("wish_status", ["wanted", "saving", "bought", "dropped"]);
export const cadence = pgEnum("cadence", ["daily", "weekly", "monthly", "yearly"]);
export const goalStatus = pgEnum("goal_status", ["active", "done", "paused"]);

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  type: accountType("type").notNull().default("bank"),
  openingBalance: integer("opening_balance").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  kind: txType("kind").notNull().default("expense"),
  nature: nature("nature").notNull().default("need"),
  color: text("color"),
});

export const transactions = pgTable(
  "transactions",
  {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  accountId: uuid("account_id").notNull().references(() => accounts.id),
  categoryId: uuid("category_id").references(() => categories.id),
  type: txType("type").notNull(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  note: text("note"),
  transferAccountId: uuid("transfer_account_id").references(() => accounts.id),
  debtPaymentId: uuid("debt_payment_id"),
  savingsContributionId: uuid("savings_contribution_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("transactions_user_date_idx").on(t.userId, t.date)],
);

export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  categoryId: uuid("category_id").references(() => categories.id), // null = total
  month: text("month").notNull(), // YYYY-MM
  amount: integer("amount").notNull(),
});

export const debts = pgTable("debts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  direction: debtDirection("direction").notNull(),
  counterparty: text("counterparty").notNull(),
  principal: integer("principal").notNull(),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  installmentAmount: integer("installment_amount"),
  status: debtStatus("status").notNull().default("active"),
  note: text("note"),
});

export const debtPayments = pgTable("debt_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  debtId: uuid("debt_id").notNull().references(() => debts.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: integer("amount").notNull(),
  paidAt: date("paid_at").notNull(),
  note: text("note"),
});

export const savingsGoals = pgTable("savings_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: integer("target_amount").notNull(),
  startDate: date("start_date").notNull(),
  targetDate: date("target_date").notNull(),
  cadence: cadence("cadence").notNull().default("monthly"),
  status: goalStatus("status").notNull().default("active"),
});

export const savingsContributions = pgTable("savings_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  goalId: uuid("goal_id").notNull().references(() => savingsGoals.id, { onDelete: "cascade" }),
  accountId: uuid("account_id").references(() => accounts.id),
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  url: text("url"),
  priority: priority("priority").notNull().default("medium"),
  status: wishStatus("status").notNull().default("wanted"),
  savingsGoalId: uuid("savings_goal_id").references(() => savingsGoals.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
