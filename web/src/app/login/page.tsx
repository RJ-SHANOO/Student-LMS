import { LoginForm } from "./login-form";

type Role = "superadmin" | "institute" | "employee" | "student";

function isRole(value: string | undefined): value is Role {
  return value === "superadmin" || value === "institute" || value === "employee" || value === "student";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  return <LoginForm initialRole={isRole(role) ? role : "employee"} />;
}
