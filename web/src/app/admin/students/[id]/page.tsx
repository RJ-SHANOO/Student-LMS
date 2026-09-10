import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getStudent } from "@/lib/services/students";
import { AuthError } from "@/lib/auth";
import { toggleStudentStatusAction } from "../actions";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  let student;
  try {
    student = await getStudent(new ObjectId(session!.tenantId!), id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="max-w-lg">
      <Link href="/admin/students" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to students
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{student.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{student.uniqueId}</p>
          </div>
          <span
            className={
              student.status === "active"
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
            }
          >
            {student.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">CNIC</dt>
          <dd className="text-foreground">{student.cnic}</dd>
          <dt className="text-muted-foreground">Date of Birth</dt>
          <dd className="text-foreground">{student.dob}</dd>
          <dt className="text-muted-foreground">Department</dt>
          <dd className="text-foreground">{student.department}</dd>
          <dt className="text-muted-foreground">Course</dt>
          <dd className="text-foreground">{student.course}</dd>
          <dt className="text-muted-foreground">Batch</dt>
          <dd className="text-foreground">{student.batch}</dd>
        </dl>

        <form
          action={toggleStudentStatusAction.bind(
            null,
            student._id!.toString(),
            student.status === "active" ? "inactive" : "active"
          )}
          className="mt-6"
        >
          <button
            type="submit"
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background"
          >
            {student.status === "active" ? "Deactivate Student" : "Activate Student"}
          </button>
        </form>
      </div>
    </div>
  );
}
