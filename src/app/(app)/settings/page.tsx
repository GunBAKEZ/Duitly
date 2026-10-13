import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const c = await getTranslations("common");
  return (
    <>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{c("language")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">{t("languageHint")}</p>
          <LocaleSwitcher />
        </CardContent>
      </Card>
    </>
  );
}
