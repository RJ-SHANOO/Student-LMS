import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listTasks } from "@/lib/services/tasks";

const statusStyle: Record<string, string> = {
  pending: "bg-gray-100 text-foreground dark:bg-white/10",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  const { status } = await searchParams;

  const tasks = await listTasks(new ObjectId(session!.tenantId!), {
    status: status === "pending" || status === "in-progress" || status === "completed" ? status : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Tasks</h1>
        <Link
          href="/admin/tasks/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Assign Task
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Filter
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Assigned To</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task) => (
              <tr key={task._id!.toString()}>
                <td className="px-4 py-2">
                  <Link href={`/admin/tasks/${task._id}`} className="text-primary hover:underline">
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {task.assignee.name}
                  <span className="ml-1 text-xs text-muted-foreground">({task.assignee.role})</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[task.status]}`}>
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No tasks yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
