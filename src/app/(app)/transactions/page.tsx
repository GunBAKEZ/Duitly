import { getLocale, getTranslations } from "next-intl/server";
import { AmountText, StatusBadge, TransactionIcon } from "@/components/features/transaction-parts";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatRupiah } from "@/lib/format";
import { transactions } from "@/lib/mock-data";

export default async function TransactionsPage() {
  const c = await getTranslations("common");
  const locale = await getLocale();
  return (
    <>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{c("name")}</TableHead>
                <TableHead>{c("category")}</TableHead>
                <TableHead>{c("date")}</TableHead>
                <TableHead>{c("status")}</TableHead>
                <TableHead className="text-right">{c("amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TransactionIcon type={tx.type} />
                      <span className="font-medium">{tx.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} label={c(tx.status)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <AmountText type={tx.type}>{formatRupiah(tx.amount, locale)}</AmountText>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
