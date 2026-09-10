import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listDistinctCourses } from "@/lib/services/students";
import { listDistinctDepartments } from "@/lib/services/employees";
import { NewTaskForm } from "./new-task-form";

export default async function NewTaskPage() {
  const session = await getSession();
  const tenantId = new ObjectId(session!.tenantId!);

  const [courses, departments] = await Promise.all([
    listDistinctCourses(tenantId),
    listDistinctDepartments(tenantId),
  ]);

  return (
    <div className="max-w-lg">
      <Link href="/admin/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Assign Task</h1>

      <NewTaskForm courses={courses} departments={departments} />
    </div>
  );
}
