import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listActivityLog } from "@/lib/services/activity-log";

function humanizeAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function ActivityLogPage() {
  const session = await getSession();
  const entries = await listActivityLog(new ObjectId(session!.tenantId!));

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Activity Log</h1>
      <p className="mt-1 text-sm text-muted-foreground">Most recent 100 actions across your institute.</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Who</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry) => (
              <tr key={entry._id!.toString()}>
                <td className="whitespace-nowrap px-4 py-2 text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-foreground">
                  {entry.user?.name ?? "—"}
                  {entry.user?.role && <span className="ml-1 text-xs text-muted-foreground">({entry.user.role})</span>}
                </td>
                <td className="px-4 py-2 text-foreground">{humanizeAction(entry.action)}</td>
                <td className="px-4 py-2 text-muted-foreground">{entry.description ?? "—"}</td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No activity recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
