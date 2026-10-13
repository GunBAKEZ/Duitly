import { getLocale, getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
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
                  <TableCell className="font-medium">{tx.name}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(tx.date, locale)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c(tx.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {tx.type === "income" ? "+" : "−"}
                    {formatRupiah(tx.amount, locale)}
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
