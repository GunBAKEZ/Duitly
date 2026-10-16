"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const credentials = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  name: z.string().trim().max(80).optional(),
});

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured) return { error: "failed" };
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "invalid" };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: "invalid" };
  redirect("/");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!isConfigured) return { error: "failed" };
  const parsed = credentials.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "minPassword" };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name || parsed.data.email.split("@")[0] },
      emailRedirectTo: `${await origin()}/auth/callback`,
    },
  });
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") return { error: "exists" };
    if (error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") return { error: "rateLimit" };
    if (error.code === "weak_password") return { error: "minPassword" };
    return { error: "failed" };
  }
  // Supabase menyamarkan email yang sudah ada saat konfirmasi email aktif: identities kosong.
  if (data.user && data.user.identities?.length === 0) return { error: "exists" };
  if (data.session) redirect("/");
  return { message: "checkEmail" };
}

export async function signInWithGoogle() {
  if (!isConfigured) redirect("/login");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback` },
  });
  if (error || !data.url) redirect("/login");
  redirect(data.url);
}

export async function signOut() {
  if (isConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
