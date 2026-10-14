"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createTransactionAction } from "@/actions/transactions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type Option = { id: string; name: string };
type Category = Option & { kind: "income" | "expense" };

type QuickAddContext = { open: () => void };
const Ctx = React.createContext<QuickAddContext>({ open: () => {} });
export const useQuickAdd = () => React.useContext(Ctx);

const today = () => new Date().toISOString().slice(0, 10);
const NONE = "__none__";

export function QuickAddProvider({
  accounts,
  categories,
  children,
}: {
  accounts: Option[];
  categories: Category[];
  children: React.ReactNode;
}) {
  const t = useTranslations("quickAdd");
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [type, setType] = React.useState<"income" | "expense">("expense");
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = React.useState(NONE);

  const demo = accounts.length === 0;
  const cats = categories.filter((c) => c.kind === type);

  const openDialog = React.useCallback(() => {
    if (demo) {
      toast.info(t("demo"));
      return;
    }
    setOpen(true);
  }, [demo, t]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const note = String(fd.get("note") ?? "").trim();
    startTransition(async () => {
      const res = await createTransactionAction({
        type,
        name: fd.get("name"),
        amount: fd.get("amount"),
        date: fd.get("date"),
        accountId,
        categoryId: categoryId === NONE ? null : categoryId,
        note: note || null,
      });
      if (res.ok) {
        toast.success(t("saved"));
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.error === "demo" ? t("demo") : t("error"));
      }
    });
  }

  return (
    <Ctx.Provider value={{ open: openDialog }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("desc")}</DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <ToggleGroup
              multiple={false}
              value={[type]}
              onValueChange={(v) => {
                if (v[0]) {
                  setType(v[0] as "income" | "expense");
                  setCategoryId(NONE);
                }
              }}
              variant="outline"
              className="w-full *:data-[slot=toggle-group-item]:flex-1"
            >
              <ToggleGroupItem value="expense">{t("expense")}</ToggleGroupItem>
              <ToggleGroupItem value="income">{t("income")}</ToggleGroupItem>
            </ToggleGroup>

            <div className="space-y-1.5">
              <Label htmlFor="qa-name">{t("name")}</Label>
              <Input id="qa-name" name="name" required maxLength={120} placeholder={t("namePh")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qa-amount">{t("amount")}</Label>
                <Input id="qa-amount" name="amount" type="number" inputMode="numeric" min={1} step={1} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qa-date">{t("date")}</Label>
                <Input id="qa-date" name="date" type="date" required defaultValue={today()} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("account")}</Label>
                <Select value={accountId} onValueChange={(v) => v && setAccountId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string | null) => accounts.find((a) => a.id === v)?.name}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("category")}</Label>
                <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(v: string | null) => (v === NONE || !v ? t("none") : cats.find((c) => c.id === v)?.name)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t("none")}</SelectItem>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-note">{t("note")}</Label>
              <Input id="qa-note" name="note" maxLength={500} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? t("saving") : t("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}
