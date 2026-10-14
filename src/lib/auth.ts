import { isConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; email: string; name: string };

/** User yang sedang login. Null jika belum login atau mode demo. */
export async function getUser(): Promise<SessionUser | null> {
  if (!isConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const u = data.user;
  if (!u) return null;
  const email = u.email ?? "";
  return { id: u.id, email, name: (u.user_metadata?.name as string | undefined) ?? email.split("@")[0] };
}
