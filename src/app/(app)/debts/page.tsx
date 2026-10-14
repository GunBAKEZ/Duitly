import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createDebtAction, deleteDebtAction, payDebtAction } from "@/actions/finance";
import { ActionDialog } from "@/components/action-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SectionCards } from "@/components/section-cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDb } from "@/db";
import { getUser } from "@/lib/auth";
import { isConfigured } from "@/lib/env";
import { formatDate, formatRupiah } from "@/lib/format";
import { debts as mockDebts, REFERENCE_DATE } from "@/lib/mock-data";
import { listAccounts, listDebts } from "@/lib/queries";

type DebtRow = {
  id: string;
  direction: "owe" | "owed_to_me";
  counterparty: string;
  principal: number;
  paid: number;
  dueDate: string | null;
  installmentAmount: number | null;
};

export default async function DebtsPage() {
  const t = await getTranslations("debts");
  const c = await getTranslations("common");
  const locale = await getLocale();
  const rp = (n: number) => formatRupiah(n, locale);
  const demo = !isConfigured;
  const today = demo ? REFERENCE_DATE : new Date().toISOString().slice(0, 10);

  let rows: DebtRow[];
  let accounts: { id: string; name: string }[] = [];
  if (demo) {
    rows = mockDebts.map((d) => ({
      id: String(d.id),
      direction: d.direction === "owe" ? "owe" : "owed_to_me",
      counterparty: d.who,
      principal: d.principal,
      paid: d.paid,
      dueDate: d.due,
      installmentAmount: d.installment || null,
    }));
  } else {
    const user = await getUser();
    if (!user) redirect("/login");
    const db = getDb();
    const [list, accs] = await Promise.all([listDebts(db, user.id), listAccounts(db, user.id)]);
    rows = list;
    accounts = accs;
  }

  const sum = (dir: string) =>
    rows.filter((d) => d.direction === dir).reduce((a, d) => a + d.principal - d.paid, 0);

  const renderList = (dir: "owe" | "owed_to_me") => {
    const list = rows.filter((d) => d.direction === dir);
    if (list.length === 0) return <p className="py-6 text-sm text-muted-foreground">{t("empty")}</p>;
    return (
      <div className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => {
          const remaining = d.principal - d.paid;
          const overdue = remaining > 0 && d.dueDate !== null && d.dueDate < today;
          return (
            <Card key={d.id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{d.counterparty}</p>
                    {d.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        {c("dueDate")}: {formatDate(d.dueDate, locale)}
                      </p>
                    )}
                  </div>
                  {remaining === 0 ? (
                    <Badge variant="outline">{t("paidOff")}</Badge>
                  ) : overdue ? (
                    <Badge variant="destructive">{c("overdue")}</Badge>
                  ) : null}
                </div>
                <Progress value={(d.paid / d.principal) * 100} />
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("remaining")} <span className="font-medium text-foreground">{rp(remaining)}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {remaining > 0 && (
                      <ActionDialog
                        trigger={dir === "owe" ? t("pay") : t("receive")}
                        title={dir === "owe" ? t("payTitle") : t("receiveTitle")}
                        description={t("payDesc")}
                        submitLabel={dir === "owe" ? t("pay") : t("receive")}
                        successMessage={t("paidMsg")}
                        action={payDebtAction}
                        demo={demo}
                        hidden={{ debtId: d.id }}
                        fields={[
                          {
                            name: "amount",
                            label: c("amount"),
                            type: "number",
                            required: true,
                            defaultValue: String(Math.min(remaining, d.installmentAmount ?? remaining)),
                          },
                          { name: "date", label: c("date"), type: "date", required: true, defaultValue: today },
                          {
                            name: "accountId",
                            label: t("account"),
                            type: "select",
                            options: accounts.map((a) => ({ value: a.id, label: a.name })),
                          },
                        ]}
                      />
                    )}
                    <DeleteButton id={d.id} action={deleteDebtAction} demo={demo} successMessage={t("deleted")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-end">
        <ActionDialog
          trigger={t("add")}
          triggerVariant="default"
          title={t("add")}
          submitLabel={t("add")}
          successMessage={t("saved")}
          action={createDebtAction}
          demo={demo}
          fields={[
            {
              name: "direction",
              label: t("direction"),
              type: "select",
              options: [
                { value: "owe", label: t("owe") },
                { value: "owed_to_me", label: t("owed") },
              ],
            },
            { name: "counterparty", label: t("who"), type: "text", required: true },
            { name: "principal", label: t("principal"), type: "number", required: true },
            { name: "dueDate", label: t("due"), type: "date" },
            { name: "installmentAmount", label: t("installment"), type: "number" },
          ]}
        />
      </div>
      <SectionCards
        items={[
          { label: t("totalOwe"), value: rp(sum("owe")), footer: t("oweHint"), hint: " " },
          { label: t("totalOwed"), value: rp(sum("owed_to_me")), footer: t("owedHint"), hint: " " },
        ]}
      />
      <Tabs defaultValue="owe">
        <TabsList>
          <TabsTrigger value="owe">{t("owe")}</TabsTrigger>
          <TabsTrigger value="owed">{t("owed")}</TabsTrigger>
        </TabsList>
        <TabsContent value="owe">{renderList("owe")}</TabsContent>
        <TabsContent value="owed">{renderList("owed_to_me")}</TabsContent>
      </Tabs>
    </>
  );
}
