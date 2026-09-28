"use client";

import { useActionState } from "react";
import { updateEmployeeCoursesAction, type UpdateEmployeeCoursesState } from "../actions";

const initialState: UpdateEmployeeCoursesState = {};

export function EditCoursesForm({
  employeeId,
  courses,
  assignedCourseIds,
}: {
  employeeId: string;
  courses: { id: string; name: string; code: string; status: "active" | "inactive" }[];
  assignedCourseIds: string[];
}) {
  const action = updateEmployeeCoursesAction.bind(null, employeeId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const assigned = new Set(assignedCourseIds);

  return (
    <form action={formAction} className="space-y-3">
      {courses.length === 0 ? (
        <p className="text-xs text-muted-foreground">No courses yet — add one under Courses first.</p>
      ) : (
        <div className="space-y-1.5">
          {courses.map((course) => (
            <label key={course.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="courseIds"
                value={course.id}
                defaultChecked={assigned.has(course.id)}
                className="rounded border-border"
              />
              {course.name} <span className="font-mono text-xs text-muted-foreground">{course.code}</span>
              {course.status === "inactive" && <span className="text-xs text-muted-foreground">(inactive)</span>}
            </label>
          ))}
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-border px-4 py-2 text-sm hover:bg-background disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Course Assignment"}
      </button>
    </form>
  );
}
