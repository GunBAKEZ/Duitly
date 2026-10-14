"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signIn, signInWithGoogle, signUp, type AuthState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function AuthForm({ mode, demo }: { mode: "login" | "signup"; demo: boolean }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? signIn : signUp, {});
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{isLogin ? t("login") : t("signup")}</CardTitle>
        <CardDescription>{isLogin ? t("loginDesc") : t("signupDesc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {demo && <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{t("demoBanner")}</p>}
        <form action={action} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" name="name" autoComplete="name" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>
          {state.error && <p className="text-sm text-destructive">{t(state.error as "invalid")}</p>}
          {state.message && <p className="text-sm text-muted-foreground">{t(state.message as "checkEmail")}</p>}
          <Button type="submit" className="w-full" disabled={pending || demo}>
            {isLogin ? t("login") : t("signup")}
          </Button>
        </form>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" />
          {t("or")}
          <Separator className="flex-1" />
        </div>
        <form action={signInWithGoogle}>
          <Button type="submit" variant="outline" className="w-full" disabled={demo}>
            {t("google")}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? t("noAccount") : t("haveAccount")}{" "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-foreground underline underline-offset-4">
            {isLogin ? t("signup") : t("login")}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
