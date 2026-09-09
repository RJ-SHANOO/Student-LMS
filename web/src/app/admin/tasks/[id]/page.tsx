import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getTask } from "@/lib/services/tasks";
import { AuthError } from "@/lib/auth";
import { updateTaskStatusAction } from "../actions";

const statusStyle: Record<string, string> = {
  pending: "bg-gray-100 text-foreground dark:bg-white/10",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

const STATUSES = ["pending", "in-progress", "completed"] as const;

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

  return (
    <div className="max-w-lg">
      <Link href="/admin/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
            <p className="text-xs text-muted-foreground">
              {task.assignee?.name} ({task.assignee?.role})
            </p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[task.status]}`}>{task.status}</span>
        </div>

        {task.description && <p className="mt-4 text-sm text-foreground">{task.description}</p>}

        <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Due Date</dt>
          <dd className="text-foreground">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</dd>
        </dl>

        <div className="mt-6 flex gap-2">
          {STATUSES.map((s) => (
            <form key={s} action={updateTaskStatusAction.bind(null, task._id!.toString(), s)}>
              <button
                type="submit"
                disabled={task.status === s}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-40"
              >
                Mark {s}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
