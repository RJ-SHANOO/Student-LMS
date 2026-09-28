import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getCourse } from "@/lib/services/courses";
import { AuthError } from "@/lib/auth";
import { toggleCourseStatusAction } from "../actions";
import { EditCourseForm } from "./edit-course-form";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  let course;
  try {
    course = await getCourse(new ObjectId(session!.tenantId!), id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="max-w-lg">
      <Link href="/admin/courses" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to courses
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{course.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{course.code}</p>
          </div>
          <span
            className={
              course.status === "active"
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
            }
          >
            {course.status}
          </span>
        </div>

        <div className="mt-6">
          <EditCourseForm courseId={course._id!.toString()} name={course.name} duration={course.duration} />
        </div>

        <form
          action={toggleCourseStatusAction.bind(
            null,
            course._id!.toString(),
            course.status === "active" ? "inactive" : "active"
          )}
          className="mt-6 border-t border-border pt-4"
        >
          <button type="submit" className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background">
            {course.status === "active"
              ? "Deactivate course (blocks new enrollment/assignment)"
              : "Activate course"}
          </button>
        </form>
      </div>
    </div>
  );
}
