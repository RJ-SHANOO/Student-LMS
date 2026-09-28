import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listTasksForEmployee, listTasksForStudent } from "@/lib/services/tasks";
import { listCourses } from "@/lib/services/courses";

const STATUS_STYLES: Record<string, string> = {
  reviewed: "bg-[var(--color-mod-attendance-soft)] text-[var(--color-mod-attendance)]",
  submitted: "bg-[var(--color-mod-fees-soft)] text-[var(--color-mod-fees)]",
  none: "bg-gray-100 text-foreground dark:bg-white/10",
};

export default async function PortalTasksPage() {
  const session = await getSession();
  const tenantId = new ObjectId(session!.tenantId!);
  const userId = new ObjectId(session!.userId);

  if (session!.role === "employee") {
    const [tasks, courses] = await Promise.all([listTasksForEmployee(tenantId, userId), listCourses(tenantId)]);
    const courseById = new Map(courses.map((c) => [c._id!.toString(), c]));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">My Tasks</h1>
          <Link href="/portal/tasks/new" className="rounded-md btn-gradient px-3 py-1.5 text-sm font-medium text-white">
            New Task
          </Link>
        </div>

        <ul className="space-y-3">
          {tasks.map((task) => {
            const course = courseById.get(task.courseId.toString());
            return (
              <li key={task._id!.toString()}>
                <Link
                  href={`/portal/tasks/${task._id}`}
                  className="block rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
                >
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {course ? `${course.name} (${course.code})` : "—"}
                    {task.dueDate ? ` · Due ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {task.submittedCount}/{task.enrolledCount} submitted · {task.reviewedCount} reviewed
                  </p>
                </Link>
              </li>
            );
          })}
          {tasks.length === 0 && (
            <p className="text-sm text-muted-foreground">You haven&apos;t created any tasks yet.</p>
          )}
        </ul>
      </div>
    );
  }

  const tasks = await listTasksForStudent(tenantId, userId);

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">My Tasks</h1>

      <ul className="space-y-3">
        {tasks.map((task) => {
          const statusKey = task.submission?.status === "reviewed" ? "reviewed" : task.submission ? "submitted" : "none";
          return (
            <li key={task._id!.toString()}>
              <Link
                href={`/portal/tasks/${task._id}`}
                className="block rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}
                </p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[statusKey]}`}>
                  {statusKey === "reviewed" ? "Reviewed" : statusKey === "submitted" ? "Submitted" : "Not submitted"}
                </span>
              </Link>
            </li>
          );
        })}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks for your course yet.</p>}
      </ul>
    </div>
  );
}
