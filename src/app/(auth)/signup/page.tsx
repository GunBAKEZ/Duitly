import { AuthForm } from "@/components/auth-form";
import { isConfigured } from "@/lib/env";

export default function Page() {
  return <AuthForm mode="signup" demo={!isConfigured} />;
}
