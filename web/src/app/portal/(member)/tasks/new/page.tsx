import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getEmployee } from "@/lib/services/employees";
import { listActiveCourses } from "@/lib/services/courses";
import { NewTaskForm } from "./new-task-form";

export default async function NewPortalTaskPage() {
  const session = await getSession();
  if (session!.role !== "employee") redirect("/portal/tasks");

  const tenantId = new ObjectId(session!.tenantId!);
  const [employee, activeCourses] = await Promise.all([
    getEmployee(tenantId, session!.userId),
    listActiveCourses(tenantId),
  ]);
  const assignedIds = new Set((employee.courseIds ?? []).map((c) => c.toString()));
  const courses = activeCourses.filter((c) => assignedIds.has(c._id!.toString()));

  return (
    <div className="space-y-4">
      <Link href="/portal/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>
      <h1 className="text-lg font-semibold text-foreground">New Task</h1>
      <NewTaskForm courses={courses.map((c) => ({ id: c._id!.toString(), name: c.name, code: c.code }))} />
    </div>
  );
}
