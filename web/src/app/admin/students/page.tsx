import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/services/students";
import { toggleStudentStatusAction } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await getSession();
  const { status, search } = await searchParams;

  const students = await listStudents(new ObjectId(session!.tenantId!), {
    status: status === "active" || status === "inactive" ? status : undefined,
    search: search || undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Students &amp; Interns</h1>
        <Link
          href="/admin/students/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Add Student
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name, CNIC, or ID"
          className="w-64 rounded-md border border-border px-3 py-1.5 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Filter
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Unique ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Dept / Course</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr key={student._id!.toString()}>
                <td className="px-4 py-2 font-mono text-xs text-foreground">{student.uniqueId}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/students/${student._id}`} className="text-primary hover:underline">
                    {student.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {student.department} / {student.course}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{student.batch}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      student.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
                    }
                  >
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <form
                    action={toggleStudentStatusAction.bind(
                      null,
                      student._id!.toString(),
                      student.status === "active" ? "inactive" : "active"
                    )}
                  >
                    <button type="submit" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                      {student.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No students yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
