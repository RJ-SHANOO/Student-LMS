import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listActiveCourses } from "@/lib/services/courses";
import { NewEmployeeForm } from "./new-employee-form";

export default async function NewEmployeePage() {
  const session = await getSession();
  const courses = await listActiveCourses(new ObjectId(session!.tenantId!));

  return (
    <div className="max-w-lg">
      <Link href="/admin/employees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to employees
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Add Employee</h1>

      <NewEmployeeForm
        courses={courses.map((c) => ({ id: c._id!.toString(), name: c.name, code: c.code }))}
      />
    </div>
  );
}
