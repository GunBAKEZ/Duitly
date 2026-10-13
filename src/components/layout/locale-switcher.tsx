"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setLocale } from "@/actions/locale";

export function LocaleSwitcher() {
  const locale = useLocale();
  const [pending, start] = useTransition();
  return (
    <div className="inline-flex rounded-lg border bg-card p-0.5" role="group" aria-label="Language">
      {(["id", "en"] as const).map((l) => (
        <Button
          key={l}
          size="sm"
          variant={locale === l ? "default" : "ghost"}
          disabled={pending}
          onClick={() => start(() => setLocale(l))}
          className="h-7 px-2.5 uppercase"
        >
          {l}
        </Button>
      ))}
    </div>
  );
}
