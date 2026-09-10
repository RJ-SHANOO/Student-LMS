import { ObjectId, type Filter } from "mongodb";
import { tasksCollection, taskCompletionsCollection, usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { Task, UserRole } from "@/types/models";
import type {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskCompletionSchema,
  updateTaskSchema,
} from "@/lib/validation/tasks";
import type { z } from "zod";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type UpdateCompletionInput = z.infer<typeof updateTaskCompletionSchema>;
type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export interface TaskActor {
  userId: string;
  tenantId: string;
  role: UserRole;
}

function audienceField(audienceType: "course" | "department") {
  return audienceType === "course" ? "course" : "department";
}

// Admins can target any course or department. Employees may only target a
// course they're listed as teaching (their own `coursesTaught`) — department-
// wide tasks stay admin-only, since there's no "owns this department" concept
// for employees the way there is for an instructor and their course.
async function assertCanAssign(actor: TaskActor, audienceType: "course" | "department", audienceValue: string) {
  if (actor.role === "admin") return;
  if (actor.role !== "employee") {
    throw new AuthError("Forbidden", 403);
  }
  if (audienceType !== "course") {
    throw new AuthError("You can only assign tasks to a course", 403);
  }
  const users = await usersCollection();
  const employee = await users.findOne({ _id: new ObjectId(actor.userId), tenantId: new ObjectId(actor.tenantId) });
  const taught = (employee?.coursesTaught ?? []).map((c) => c.toUpperCase());
  if (!taught.includes(audienceValue.toUpperCase())) {
    throw new AuthError("You can only assign tasks to your own course", 403);
  }
}

export async function createTask(actor: TaskActor, input: CreateTaskInput) {
  const audienceValue = input.audienceValue.toUpperCase();
  await assertCanAssign(actor, input.audienceType, audienceValue);

  const tenantId = new ObjectId(actor.tenantId);
  const tasks = await tasksCollection();
  const result = await tasks.insertOne({
    tenantId,
    audienceType: input.audienceType,
    audienceValue,
    title: input.title,
    description: input.description,
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    createdBy: new ObjectId(actor.userId),
    createdAt: new Date(),
  });

  await logActivity({
    tenantId,
    userId: new ObjectId(actor.userId),
    action: "task_assigned",
    description: `Assigned "${input.title}" to ${input.audienceType} ${audienceValue}`,
  });

  return { id: result.insertedId };
}

// Admin's task list, with each task's completion progress across its audience.
export async function listTasks(tenantId: ObjectId, filters: ListTasksQuery = {}) {
  const tasks = await tasksCollection();

  const match: Filter<Task> = { tenantId };
  if (filters.audienceType) match.audienceType = filters.audienceType;

  const results = await tasks.find(match).sort({ createdAt: -1 }).toArray();

  const users = await usersCollection();
  const completions = await taskCompletionsCollection();

  return Promise.all(
    results.map(async (task) => {
      const field = audienceField(task.audienceType);
      const audienceCount = await users.countDocuments({
        tenantId,
        role: task.audienceType === "course" ? "student" : "employee",
        status: "active",
        [field]: task.audienceValue,
      });
      const completedCount = await completions.countDocuments({
        tenantId,
        taskId: task._id,
        status: "completed",
      });

      return { ...task, audienceCount, completedCount };
    })
  );
}

// Self-service: tasks visible to a student (by course) or employee (by department),
// merged with that user's own completion status (defaults to "pending" if untouched).
export async function listMyTasks(tenantId: ObjectId, userId: ObjectId) {
  const users = await usersCollection();
  const user = await users.findOne({ _id: userId, tenantId });
  if (!user) return [];

  const audienceType = user.role === "student" ? "course" : "department";
  const audienceValue = user.role === "student" ? user.course : user.department;
  if (!audienceValue) return [];

  const tasks = await tasksCollection();
  const myTasks = await tasks
    .find({ tenantId, audienceType, audienceValue })
    .sort({ dueDate: 1 })
    .toArray();

  const completions = await taskCompletionsCollection();
  const myCompletions = await completions
    .find({ tenantId, userId, taskId: { $in: myTasks.map((t) => t._id!) } })
    .toArray();
  const byTaskId = new Map(myCompletions.map((c) => [c.taskId.toString(), c]));

  return myTasks.map((task) => {
    const completion = byTaskId.get(task._id!.toString());
    return {
      ...task,
      status: completion?.status ?? "pending",
      note: completion?.note,
    };
  });
}

export async function getTask(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Task not found", 404);
  }
  const tasks = await tasksCollection();
  const task = await tasks.findOne({ _id: new ObjectId(id), tenantId });
  if (!task) {
    throw new AuthError("Task not found", 404);
  }

  const users = await usersCollection();
  const field = audienceField(task.audienceType);
  const audience = await users
    .find({
      tenantId,
      role: task.audienceType === "course" ? "student" : "employee",
      [field]: task.audienceValue,
    })
    .sort({ name: 1 })
    .toArray();

  const completions = await taskCompletionsCollection();
  const taskCompletions = await completions.find({ tenantId, taskId: task._id }).toArray();
  const byUserId = new Map(taskCompletions.map((c) => [c.userId.toString(), c]));

  const roster = audience.map((member) => {
    const completion = byUserId.get(member._id!.toString());
    return {
      userId: member._id!.toString(),
      name: member.name,
      uniqueId: member.uniqueId,
      status: completion?.status ?? "pending",
      note: completion?.note,
    };
  });

  return { ...task, roster };
}

// Admin-only: retitle/re-describe/reschedule a task. Audience is fixed at creation.
export async function updateTask(tenantId: ObjectId, id: string, input: UpdateTaskInput) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Task not found", 404);
  }
  const tasks = await tasksCollection();
  const update: Partial<Task> = {
    ...(input.title && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
  };

  const updated = await tasks.findOneAndUpdate({ _id: new ObjectId(id), tenantId }, { $set: update }, { returnDocument: "after" });
  if (!updated) {
    throw new AuthError("Task not found", 404);
  }
  return updated;
}

// Self-service: a student/employee marks their own progress on a task in their
// audience. Upserts their TaskCompletion row — the task document itself never
// carries a shared status.
export async function upsertMyCompletion(actor: TaskActor, taskId: string, input: UpdateCompletionInput) {
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
  const user = await users.findOne({ _id: new ObjectId(actor.userId), tenantId });
  const myValue = task.audienceType === "course" ? user?.course : user?.department;
  if (!myValue || myValue !== task.audienceValue) {
    throw new AuthError("This task isn't assigned to you", 403);
  }

  const completions = await taskCompletionsCollection();
  const userId = new ObjectId(actor.userId);
  const now = new Date();
  await completions.updateOne(
    { tenantId, taskId: task._id!, userId },
    { $set: { status: input.status, note: input.note, updatedAt: now }, $setOnInsert: { tenantId, taskId: task._id!, userId } },
    { upsert: true }
  );

  await logActivity({
    tenantId,
    userId,
    action: "task_status_changed",
    description: `Set task "${task.title}" to ${input.status}`,
  });

  return { status: input.status, note: input.note };
}
