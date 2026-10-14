"use client";

import * as React from "react";
import { Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ActionResult } from "@/actions/transactions";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  id,
  action,
  demo,
  successMessage,
}: {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  demo: boolean;
  successMessage: string;
}) {
  const t = useTranslations("quickAdd");
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={t("delete")}
      disabled={pending}
      onClick={() => {
        if (demo) return void toast.info(t("demo"));
        startTransition(async () => {
          const res = await action(id);
          if (res.ok) toast.success(successMessage);
          else toast.error(t("error"));
        });
      }}
    >
      <Trash2Icon />
    </Button>
  );
}
