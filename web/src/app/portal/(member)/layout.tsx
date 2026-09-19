import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { usersCollection } from "@/lib/db/collections";
import { getSettings } from "@/lib/services/settings";
import { ThemeOverride } from "@/components/theme-script";
import { Logo } from "@/components/logo";
import { IconLogOut } from "@/components/icons";
import { logoutAction } from "./actions";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !["employee", "student"].includes(session.role) || !session.tenantId) {
    redirect("/portal/login");
  }

  const tenantId = new ObjectId(session.tenantId);
  const users = await usersCollection();
  const [user, settings] = await Promise.all([
    users.findOne({ _id: new ObjectId(session.userId) }),
    getSettings(tenantId),
  ]);
  if (!user || user.status !== "active") {
    redirect("/portal/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ThemeOverride preference={settings.themePreference ?? "light"} />

      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs capitalize text-muted-foreground">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Log out"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <IconLogOut />
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
