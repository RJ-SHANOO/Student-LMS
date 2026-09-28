import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listCourses } from "@/lib/services/courses";
import { ModuleIcon } from "@/components/module-icon";
import { IconCourses } from "@/components/icons";
import { toggleCourseStatusAction } from "./actions";

export default async function CoursesPage() {
  const session = await getSession();
  const courses = await listCourses(new ObjectId(session!.tenantId!));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ModuleIcon mod="courses" icon={IconCourses} />
          <h1 className="text-lg font-semibold text-foreground">Courses</h1>
        </div>
        <Link href="/admin/courses/new" className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white">
          Add Course
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((course) => (
              <tr key={course._id!.toString()}>
                <td className="px-4 py-2 font-mono text-xs text-foreground">{course.code}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/courses/${course._id}`} className="text-primary hover:underline">
                    {course.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{course.duration ?? "—"}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      course.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
                    }
                  >
                    {course.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <form
                    action={toggleCourseStatusAction.bind(
                      null,
                      course._id!.toString(),
                      course.status === "active" ? "inactive" : "active"
                    )}
                  >
                    <button type="submit" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                      {course.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
