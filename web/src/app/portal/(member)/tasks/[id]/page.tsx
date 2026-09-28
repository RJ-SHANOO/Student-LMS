import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getTaskForEmployee, getTaskForStudent } from "@/lib/services/tasks";
import { getCourse } from "@/lib/services/courses";
import { AuthError } from "@/lib/auth";
import { ReviewForm } from "./review-form";
import { SubmitForm } from "./submit-form";

const STATUS_STYLES: Record<string, string> = {
  reviewed: "bg-[var(--color-mod-attendance-soft)] text-[var(--color-mod-attendance)]",
  submitted: "bg-[var(--color-mod-fees-soft)] text-[var(--color-mod-fees)]",
  none: "bg-gray-100 text-foreground dark:bg-white/10",
};

export default async function PortalTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const tenantId = new ObjectId(session!.tenantId!);
  const actor = { userId: session!.userId, tenantId: session!.tenantId!, role: session!.role };

  if (session!.role === "employee") {
    let task;
    try {
      task = await getTaskForEmployee(actor, id);
    } catch (error) {
      if (error instanceof AuthError && error.status === 404) notFound();
      throw error;
    }
    const course = await getCourse(tenantId, task.courseId.toString());

    return (
      <div className="space-y-4">
        <Link href="/portal/tasks" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to tasks
        </Link>

        <div className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {course.name} ({course.code})
          </p>
          {task.description && <p className="mt-3 text-sm text-foreground">{task.description}</p>}
          <p className="mt-3 text-xs text-muted-foreground">
            {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}
          </p>
          {task.attachmentUrl && (
            <a
              href={task.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm text-primary underline"
            >
              Download attachment ({task.attachmentName})
            </a>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-foreground">Submissions ({task.roster.length})</h2>
          {task.roster.map((member) => {
            const statusKey = member.submission?.status === "reviewed" ? "reviewed" : member.submission ? "submitted" : "none";
            return (
              <div
                key={member.studentId}
                className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{member.uniqueId ?? "—"}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[statusKey]}`}>
                    {statusKey === "reviewed" ? "Reviewed" : statusKey === "submitted" ? "Submitted" : "Not submitted"}
                  </span>
                </div>

                {member.submission && (
                  <>
                    <a
                      href={member.submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-sm text-primary underline"
                    >
                      Download {member.submission.fileName}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {new Date(member.submission.submittedAt).toLocaleString()}
                    </p>
                    <div className="mt-3">
                      <ReviewForm
                        taskId={task._id!.toString()}
                        studentId={member.studentId}
                        remarks={member.submission.remarks}
                        marks={member.submission.marks}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {task.roster.length === 0 && (
            <p className="text-sm text-muted-foreground">No students enrolled in this course yet.</p>
          )}
        </div>
      </div>
    );
  }

  let task;
  try {
    task = await getTaskForStudent(actor, id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }
  const course = await getCourse(tenantId, task.courseId.toString());
  const statusKey = task.submission?.status === "reviewed" ? "reviewed" : task.submission ? "submitted" : "none";

  return (
    <div className="space-y-4">
      <Link href="/portal/tasks" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tasks
      </Link>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <h1 className="text-lg font-semibold text-foreground">{task.title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {course.name} ({course.code})
        </p>
        {task.description && <p className="mt-3 text-sm text-foreground">{task.description}</p>}
        <p className="mt-3 text-xs text-muted-foreground">
          {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}
        </p>
        {task.attachmentUrl && (
          <a
            href={task.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary underline"
          >
            Download attachment ({task.attachmentName})
          </a>
        )}
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-medium text-foreground">Your Submission</h2>

        {task.submission ? (
          <div className="mt-3 space-y-2 text-sm">
            <a
              href={task.submission.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {task.submission.fileName}
            </a>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(task.submission.submittedAt).toLocaleString()}
            </p>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[statusKey]}`}>
              {statusKey === "reviewed" ? "Reviewed" : "Submitted"}
            </span>
            {task.submission.status === "reviewed" && (
              <div className="rounded-md border border-border p-3">
                {task.submission.marks !== undefined && (
                  <p className="text-sm text-foreground">Marks: {task.submission.marks}</p>
                )}
                {task.submission.remarks && (
                  <p className="mt-1 text-sm text-muted-foreground">{task.submission.remarks}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">You haven&apos;t submitted yet.</p>
        )}

        <div className="mt-4">
          <SubmitForm taskId={task._id!.toString()} hasSubmission={!!task.submission} />
        </div>
      </div>
    </div>
  );
}
