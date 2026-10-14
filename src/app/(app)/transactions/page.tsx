import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { deleteTransactionAction } from "@/actions/transactions";
import { DeleteButton } from "@/components/delete-button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { formatDate, formatRupiah } from "@/lib/format";
import { transactions as mockTransactions } from "@/lib/mock-data";
import { listTransactions } from "@/lib/queries";

export default async function TransactionsPage() {
  const c = await getTranslations("common");
  const q = await getTranslations("quickAdd");
  const locale = await getLocale();

  let rows: { id: string | number; name: string; category: string | null; type: string; amount: number; date: string }[];
  if (isConfigured) {
    const user = await getUser();
    if (!user) redirect("/login");
    rows = await listTransactions(getDb(), user.id, 200);
  } else {
    rows = mockTransactions.map((t) => ({ ...t }));
  }

  return (
    <Card>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{q("empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c("name")}</TableHead>
                <TableHead>{c("category")}</TableHead>
                <TableHead>{c("date")}</TableHead>
                <TableHead className="text-right">{c("amount")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell>{tx.category ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date, locale)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {tx.type === "income" ? "+" : "−"}
                    {formatRupiah(tx.amount, locale)}
                  </TableCell>
                  <TableCell>
                    <DeleteButton id={String(tx.id)} action={deleteTransactionAction} demo={!isConfigured} successMessage={q("deleted")} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
