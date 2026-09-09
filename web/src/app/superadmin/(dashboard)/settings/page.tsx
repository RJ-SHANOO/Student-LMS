import { getSession } from "@/lib/session";
import { getSuperAdminById } from "@/lib/services/super-admin";
import { SuperAdminSettingsForm } from "./settings-form";

export default async function SuperAdminSettingsPage() {
  const session = await getSession();
  const account = await getSuperAdminById(session!.userId);

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      <SuperAdminSettingsForm themePreference={account.themePreference} />
    </div>
  );
}
