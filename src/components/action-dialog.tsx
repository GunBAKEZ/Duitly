"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/transactions";
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

export type Field = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: { value: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
};

export function ActionDialog({
  trigger,
  triggerVariant = "outline",
  triggerSize = "sm",
  title,
  description,
  submitLabel,
  successMessage,
  fields,
  hidden,
  action,
  demo,
}: {
  trigger: React.ReactNode;
  triggerVariant?: "default" | "outline" | "ghost" | "secondary";
  triggerSize?: "default" | "sm" | "xs";
  title: string;
  description?: string;
  submitLabel: string;
  successMessage: string;
  fields: Field[];
  hidden?: Record<string, unknown>;
  action: (input: unknown) => Promise<ActionResult>;
  demo: boolean;
}) {
  const t = useTranslations("quickAdd");
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [selects, setSelects] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(fields.filter((f) => f.type === "select").map((f) => [f.name, f.defaultValue ?? f.options?.[0]?.value ?? ""])),
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values: Record<string, unknown> = { ...hidden, ...selects };
    for (const f of fields) if (f.type !== "select") values[f.name] = fd.get(f.name);
    startTransition(async () => {
      const res = await action(values);
      if (res.ok) {
        toast.success(successMessage);
        setOpen(false);
      } else {
        toast.error(res.error === "demo" ? t("demo") : t("error"));
      }
    });
  }

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => (demo ? toast.info(t("demo")) : setOpen(true))}
      >
        {trigger}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <Label htmlFor={`f-${f.name}`}>{f.label}</Label>
                {f.type === "select" ? (
                  <Select value={selects[f.name]} onValueChange={(v) => v && setSelects((s) => ({ ...s, [f.name]: v }))}>
                    <SelectTrigger id={`f-${f.name}`} className="w-full">
                      <SelectValue>{(v: string | null) => f.options?.find((o) => o.value === v)?.label}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`f-${f.name}`}
                    name={f.name}
                    type={f.type}
                    required={f.required}
                    defaultValue={f.defaultValue}
                    placeholder={f.placeholder}
                    inputMode={f.type === "number" ? "numeric" : undefined}
                    min={f.type === "number" ? 1 : undefined}
                    step={f.type === "number" ? 1 : undefined}
                  />
                )}
              </div>
            ))}
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? t("saving") : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
