import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/services/students";
import { listEmployees } from "@/lib/services/employees";
import { NewTaskForm } from "./new-task-form";

export default async function NewTaskPage() {
  const session = await getSession();
  const tenantId = new ObjectId(session!.tenantId!);

  const [students, employees] = await Promise.all([
    listStudents(tenantId, { status: "active" }),
    listEmployees(tenantId, { status: "active" }),
  ]);

  const assignees = [
    ...employees.map((e) => ({ id: e._id!.toString(), name: e.name, role: "employee" })),
    ...students.map((s) => ({ id: s._id!.toString(), name: s.name, role: "student", uniqueId: s.uniqueId })),
  ];

  return (
    <div className="max-w-lg">
      <Link href="/admin/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Assign Task</h1>

      <NewTaskForm assignees={assignees} />
    </div>
  );
}
