import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getTask } from "@/lib/services/tasks";
import { AuthError } from "@/lib/auth";

const statusStyle: Record<string, string> = {
  pending: "bg-gray-100 text-foreground dark:bg-white/10",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  let task;
  try {
    task = await getTask(new ObjectId(session!.tenantId!), id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  const completedCount = task.roster.filter((m) => m.status === "completed").length;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
            <p className="text-xs text-muted-foreground">
              {task.audienceType === "course" ? "Course" : "Department"}: {task.audienceValue}
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-foreground dark:bg-white/10">
            {completedCount}/{task.roster.length} completed
          </span>
        </div>

        {task.description && <p className="mt-4 text-sm text-foreground">{task.description}</p>}

        <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Due Date</dt>
          <dd className="text-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</dd>
        </dl>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {task.roster.map((member) => (
              <tr key={member.userId}>
                <td className="px-4 py-2 text-foreground">{member.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{member.uniqueId ?? "—"}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[member.status]}`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{member.note ?? "—"}</td>
              </tr>
            ))}
            {task.roster.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No one in this {task.audienceType} yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
