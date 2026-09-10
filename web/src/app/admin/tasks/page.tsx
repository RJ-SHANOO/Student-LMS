import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listTasks } from "@/lib/services/tasks";
import { ModuleIcon } from "@/components/module-icon";
import { IconTasks } from "@/components/icons";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ audienceType?: string }>;
}) {
  const session = await getSession();
  const { audienceType } = await searchParams;

  const tasks = await listTasks(new ObjectId(session!.tenantId!), {
    audienceType: audienceType === "course" || audienceType === "department" ? audienceType : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ModuleIcon mod="tasks" icon={IconTasks} />
          <h1 className="text-lg font-semibold text-foreground">Tasks</h1>
        </div>
        <Link
          href="/admin/tasks/new"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          Assign Task
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <select
          name="audienceType"
          defaultValue={audienceType ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All tasks</option>
          <option value="course">Course tasks</option>
          <option value="department">Department tasks</option>
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
              <th className="px-4 py-2">Audience</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Progress</th>
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
                  {task.audienceType === "course" ? "Course" : "Department"}: {task.audienceValue}
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-foreground dark:bg-white/10">
                    {task.completedCount}/{task.audienceCount} completed
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
