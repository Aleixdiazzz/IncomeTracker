// app/(auth)/login/page.tsx
// Owner: UI / auth
// Purpose: Public /login page. The (auth) layout already handles the
// already-signed-in redirect.
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return <LoginForm />;
}
