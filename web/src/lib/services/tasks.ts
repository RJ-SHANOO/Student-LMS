import { ObjectId, type Filter } from "mongodb";
import { tasksCollection, taskSubmissionsCollection, usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import { deleteTaskFile, uploadTaskFile } from "@/lib/services/file-storage";
import type { Task, UserRole } from "@/types/models";
import type {
  createTaskSchema,
  listTasksQuerySchema,
  reviewSubmissionSchema,
  updateTaskSchema,
} from "@/lib/validation/tasks";
import type { z } from "zod";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export interface TaskActor {
  userId: string;
  tenantId: string;
  role: UserRole;
}

async function assertEmployeeOwnsCourse(tenantId: ObjectId, employeeId: ObjectId, courseId: ObjectId) {
  const users = await usersCollection();
  const employee = await users.findOne({ _id: employeeId, tenantId, role: "employee" });
  const assigned = (employee?.courseIds ?? []).some((c) => c.equals(courseId));
  if (!assigned) {
    throw new AuthError("You can only assign tasks to your own course", 403);
  }
}

// Employee-only: create a task for one of their own assigned courses, with an
// optional reference attachment (e.g. instructions). Every active student
// enrolled in that course can then see it and submit work.
export async function createTask(actor: TaskActor, input: CreateTaskInput, attachment?: File) {
  if (actor.role !== "employee") {
    throw new AuthError("Only employees can create tasks", 403);
  }
  const tenantId = new ObjectId(actor.tenantId);
  const courseId = new ObjectId(input.courseId);
  await assertEmployeeOwnsCourse(tenantId, new ObjectId(actor.userId), courseId);

  let attachmentUrl: string | undefined;
  let attachmentName: string | undefined;
  if (attachment && attachment.size > 0) {
    const uploaded = await uploadTaskFile(`tasks/${actor.tenantId}/${courseId.toString()}`, attachment);
    attachmentUrl = uploaded.url;
    attachmentName = uploaded.fileName;
  }

  const tasks = await tasksCollection();
  const result = await tasks.insertOne({
    tenantId,
    courseId,
    createdBy: new ObjectId(actor.userId),
    title: input.title,
    description: input.description,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    attachmentUrl,
    attachmentName,
    createdAt: new Date(),
  });

  await logActivity({
    tenantId,
    userId: new ObjectId(actor.userId),
    action: "task_assigned",
    description: `Assigned "${input.title}"`,
  });

  return { id: result.insertedId };
}

async function withSubmissionCounts(tenantId: ObjectId, tasks: Task[]) {
  const users = await usersCollection();
  const submissions = await taskSubmissionsCollection();

  return Promise.all(
    tasks.map(async (task) => {
      const [enrolledCount, submittedCount, reviewedCount] = await Promise.all([
        users.countDocuments({ tenantId, role: "student", status: "active", courseId: task.courseId }),
        submissions.countDocuments({ tenantId, taskId: task._id }),
        submissions.countDocuments({ tenantId, taskId: task._id, status: "reviewed" }),
      ]);
      return { ...task, enrolledCount, submittedCount, reviewedCount };
    })
  );
}

// Institute's read-only view: every task in the tenant, optionally filtered by course.
export async function listTasksForInstitute(tenantId: ObjectId, filters: ListTasksQuery = {}) {
  const tasks = await tasksCollection();
  const match: Filter<Task> = { tenantId };
  if (filters.courseId) match.courseId = new ObjectId(filters.courseId);
  const results = await tasks.find(match).sort({ createdAt: -1 }).toArray();
  return withSubmissionCounts(tenantId, results);
}

// An employee's own view: only the tasks they created.
export async function listTasksForEmployee(tenantId: ObjectId, employeeId: ObjectId) {
  const tasks = await tasksCollection();
  const results = await tasks.find({ tenantId, createdBy: employeeId }).sort({ createdAt: -1 }).toArray();
  return withSubmissionCounts(tenantId, results);
}

// A student's own view: tasks for the course they're enrolled in, merged with their own submission.
export async function listTasksForStudent(tenantId: ObjectId, studentId: ObjectId) {
  const users = await usersCollection();
  const student = await users.findOne({ _id: studentId, tenantId, role: "student" });
  if (!student?.courseId) return [];

  const tasks = await tasksCollection();
  const myTasks = await tasks.find({ tenantId, courseId: student.courseId }).sort({ dueDate: 1 }).toArray();

  const submissions = await taskSubmissionsCollection();
  const mySubmissions = await submissions
    .find({ tenantId, studentId, taskId: { $in: myTasks.map((t) => t._id!) } })
    .toArray();
  const byTaskId = new Map(mySubmissions.map((s) => [s.taskId.toString(), s]));

  return myTasks.map((task) => ({ ...task, submission: byTaskId.get(task._id!.toString()) ?? null }));
}

async function getTaskOrThrow(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Task not found", 404);
  }
  const tasks = await tasksCollection();
  const task = await tasks.findOne({ _id: new ObjectId(id), tenantId });
  if (!task) {
    throw new AuthError("Task not found", 404);
  }
  return task;
}

async function getRoster(tenantId: ObjectId, task: Task) {
  const users = await usersCollection();
  const students = await users
    .find({ tenantId, role: "student", courseId: task.courseId })
    .sort({ name: 1 })
    .toArray();

  const submissions = await taskSubmissionsCollection();
  const taskSubmissions = await submissions.find({ tenantId, taskId: task._id }).toArray();
  const byStudentId = new Map(taskSubmissions.map((s) => [s.studentId.toString(), s]));

  return students.map((student) => {
    const submission = byStudentId.get(student._id!.toString());
    return {
      studentId: student._id!.toString(),
      name: student.name,
      uniqueId: student.uniqueId,
      submission: submission
        ? {
            fileUrl: submission.fileUrl,
            fileName: submission.fileName,
            submittedAt: submission.submittedAt,
            status: submission.status,
            remarks: submission.remarks,
            marks: submission.marks,
          }
        : null,
    };
  });
}

// Employee (task owner) view: full roster with each student's submission,
// including the download link — this is the only place a file URL surfaces.
export async function getTaskForEmployee(actor: TaskActor, id: string) {
  if (actor.role !== "employee") {
    throw new AuthError("Forbidden", 403);
  }
  const tenantId = new ObjectId(actor.tenantId);
  const task = await getTaskOrThrow(tenantId, id);
  if (task.createdBy.toString() !== actor.userId) {
    throw new AuthError("Task not found", 404);
  }
  const roster = await getRoster(tenantId, task);
  return { ...task, roster };
}

// Institute's read-only detail view: status and marks, but never the file
// itself — downloading a submission is an employee-only action per CLAUDE.md.
export async function getTaskForInstitute(tenantId: ObjectId, id: string) {
  const task = await getTaskOrThrow(tenantId, id);
  const roster = await getRoster(tenantId, task);
  return {
    ...task,
    roster: roster.map((r) => ({
      ...r,
      submission: r.submission ? { ...r.submission, fileUrl: undefined, fileName: undefined } : null,
    })),
  };
}

// Student's own view: the task plus their own submission (if any) — never anyone else's.
export async function getTaskForStudent(actor: TaskActor, id: string) {
  const tenantId = new ObjectId(actor.tenantId);
  const task = await getTaskOrThrow(tenantId, id);

  const users = await usersCollection();
  const student = await users.findOne({ _id: new ObjectId(actor.userId), tenantId, role: "student" });
  if (!student?.courseId || !student.courseId.equals(task.courseId)) {
    throw new AuthError("Task not found", 404);
  }

  const submissions = await taskSubmissionsCollection();
  const submission = await submissions.findOne({ tenantId, taskId: task._id, studentId: student._id! });

  return { ...task, submission };
}

// Employee-only: retitle/re-describe/reschedule a task they created. Its course is fixed at creation.
export async function updateTask(actor: TaskActor, id: string, input: UpdateTaskInput) {
  if (actor.role !== "employee") {
    throw new AuthError("Forbidden", 403);
  }
  const tenantId = new ObjectId(actor.tenantId);
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Task not found", 404);
  }
  const tasks = await tasksCollection();
  const existing = await tasks.findOne({ _id: new ObjectId(id), tenantId });
  if (!existing || existing.createdBy.toString() !== actor.userId) {
    throw new AuthError("Task not found", 404);
  }

  const update: Partial<Task> = {
    ...(input.title && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
  };

  const updated = await tasks.findOneAndUpdate({ _id: existing._id }, { $set: update }, { returnDocument: "after" });
  return updated!;
}

// Student-only: upload/replace their submission for a task in their own course.
export async function submitTask(actor: TaskActor, taskId: string, file: File) {
  if (actor.role !== "student") {
    throw new AuthError("Forbidden", 403);
  }
  if (!ObjectId.isValid(taskId)) {
    throw new AuthError("Task not found", 404);
  }

  const tenantId = new ObjectId(actor.tenantId);
  const tasks = await tasksCollection();
  const task = await tasks.findOne({ _id: new ObjectId(taskId), tenantId });
  if (!task) {
    throw new AuthError("Task not found", 404);
  }

  const users = await usersCollection();
  const student = await users.findOne({ _id: new ObjectId(actor.userId), tenantId, role: "student" });
  if (!student?.courseId || !student.courseId.equals(task.courseId)) {
    throw new AuthError("This task isn't assigned to you", 403);
  }

  const submissions = await taskSubmissionsCollection();
  const existing = await submissions.findOne({ tenantId, taskId: task._id!, studentId: student._id! });

  const uploaded = await uploadTaskFile(`tasks/${actor.tenantId}/${taskId}/${actor.userId}`, file);
  // Resubmitting replaces the file and resets review state — best-effort
  // delete the old blob so it doesn't linger once nothing references it.
  if (existing) {
    await deleteTaskFile(existing.fileUrl);
  }

  const now = new Date();
  await submissions.updateOne(
    { tenantId, taskId: task._id!, studentId: student._id! },
    {
      $set: {
        tenantId,
        taskId: task._id!,
        studentId: student._id!,
        fileUrl: uploaded.url,
        fileName: uploaded.fileName,
        submittedAt: now,
        status: "submitted",
      },
      $unset: { remarks: "", marks: "", reviewedBy: "", reviewedAt: "" },
    },
    { upsert: true }
  );

  await logActivity({
    tenantId,
    userId: student._id!,
    action: "task_submitted",
    description: `Submitted work for "${task.title}"`,
  });

  return { fileUrl: uploaded.url, fileName: uploaded.fileName };
}

// Employee (task owner) only: mark a student's submission reviewed with remarks/marks.
export async function reviewSubmission(actor: TaskActor, taskId: string, input: ReviewSubmissionInput) {
  if (actor.role !== "employee") {
    throw new AuthError("Forbidden", 403);
  }
  if (!ObjectId.isValid(taskId)) {
    throw new AuthError("Task not found", 404);
  }

  const tenantId = new ObjectId(actor.tenantId);
  const tasks = await tasksCollection();
  const task = await tasks.findOne({ _id: new ObjectId(taskId), tenantId });
  if (!task || task.createdBy.toString() !== actor.userId) {
    throw new AuthError("Task not found", 404);
  }

  const studentId = new ObjectId(input.studentId);
  const submissions = await taskSubmissionsCollection();
  const now = new Date();
  const updated = await submissions.findOneAndUpdate(
    { tenantId, taskId: task._id!, studentId },
    {
      $set: {
        status: "reviewed",
        remarks: input.remarks,
        marks: input.marks,
        reviewedBy: new ObjectId(actor.userId),
        reviewedAt: now,
      },
    },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AuthError("Submission not found", 404);
  }

  await logActivity({
    tenantId,
    userId: new ObjectId(actor.userId),
    action: "task_reviewed",
    description: `Reviewed submission for "${task.title}"`,
  });

  return updated;
}
