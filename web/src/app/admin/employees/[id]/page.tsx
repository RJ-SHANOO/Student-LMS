import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getEmployee } from "@/lib/services/employees";
import { listCourses } from "@/lib/services/courses";
import { AuthError } from "@/lib/auth";
import { toggleEmployeeStatusAction } from "../actions";
import { EditCoursesForm } from "./edit-courses-form";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const tenantId = new ObjectId(session!.tenantId!);

  let employee;
  try {
    employee = await getEmployee(tenantId, id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  const courses = await listCourses(tenantId);

  return (
    <div className="max-w-lg">
      <Link href="/admin/employees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to employees
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{employee.name}</h1>
            <p className="text-xs text-muted-foreground">{employee.designation}</p>
          </div>
          <span
            className={
              employee.status === "active"
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
            }
          >
            {employee.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">CNIC</dt>
          <dd className="text-foreground">{employee.cnic}</dd>
          <dt className="text-muted-foreground">Date of Birth</dt>
          <dd className="text-foreground">{employee.dob}</dd>
          <dt className="text-muted-foreground">Department</dt>
          <dd className="text-foreground">{employee.department}</dd>
          <dt className="text-muted-foreground">Designation</dt>
          <dd className="text-foreground">{employee.designation}</dd>
        </dl>

        <form
          action={toggleEmployeeStatusAction.bind(
            null,
            employee._id!.toString(),
            employee.status === "active" ? "inactive" : "active"
          )}
          className="mt-6"
        >
          <button
            type="submit"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background"
          >
            {employee.status === "active" ? "Deactivate Employee" : "Activate Employee"}
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <h2 className="text-sm font-medium text-foreground">Assigned Courses</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Only instructors assigned to a course can create tasks for its students.
        </p>
        <div className="mt-4">
          <EditCoursesForm
            employeeId={employee._id!.toString()}
            courses={courses.map((c) => ({ id: c._id!.toString(), name: c.name, code: c.code, status: c.status }))}
            assignedCourseIds={(employee.courseIds ?? []).map((c) => c.toString())}
          />
        </div>
      </div>
    </div>
  );
}
