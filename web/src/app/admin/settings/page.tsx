import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/services/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  const settings = await getSettings(new ObjectId(session!.tenantId!));

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Settings</h1>
      <SettingsForm
        instituteName={settings.instituteName}
        officeLat={settings.officeLat}
        officeLng={settings.officeLng}
        officeRadius={settings.officeRadius}
        lateAfterTime={settings.lateAfterTime}
        themePreference={settings.themePreference}
      />
    </div>
  );
}
