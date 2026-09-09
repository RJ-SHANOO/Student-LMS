import { ObjectId, type Filter } from "mongodb";
import { tasksCollection, usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { Task, UserRole } from "@/types/models";
import type { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "@/lib/validation/tasks";
import type { z } from "zod";

type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

export async function createTask(tenantId: ObjectId, input: CreateTaskInput, actorId: ObjectId) {
  if (!ObjectId.isValid(input.assignedTo)) {
    throw new AuthError("Assignee not found", 404);
  }

  const users = await usersCollection();
  const assignee = await users.findOne({
    _id: new ObjectId(input.assignedTo),
    tenantId,
    role: { $in: ["employee", "student"] },
  });
  if (!assignee) {
    throw new AuthError("Assignee not found", 404);
  }

  const tasks = await tasksCollection();
  const result = await tasks.insertOne({
    tenantId,
    assignedTo: assignee._id!,
    title: input.title,
    description: input.description,
    status: "pending",
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
  });

  await logActivity({
    tenantId,
    userId: actorId,
    action: "task_assigned",
    description: `Assigned "${input.title}" to ${assignee.name}`,
  });

  return { id: result.insertedId };
}

export async function listTasks(tenantId: ObjectId, filters: ListTasksQuery = {}) {
  const tasks = await tasksCollection();

  const match: Filter<Task> = { tenantId };
  if (filters.assignedTo && ObjectId.isValid(filters.assignedTo)) {
    match.assignedTo = new ObjectId(filters.assignedTo);
  }
  if (filters.status) match.status = filters.status;

  return tasks
    .aggregate([
      { $match: match },
      { $sort: { dueDate: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignee",
        },
      },
      { $unwind: "$assignee" },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          dueDate: 1,
          "assignee.name": 1,
          "assignee.role": 1,
          "assignee.uniqueId": 1,
        },
      },
    ])
    .toArray();
}

// Self-service: only the assigned employee/student's own tasks.
export async function listMyTasks(tenantId: ObjectId, userId: ObjectId) {
  const tasks = await tasksCollection();
  return tasks.find({ tenantId, assignedTo: userId }).sort({ dueDate: 1 }).toArray();
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
  const assignee = await users.findOne({ _id: task.assignedTo });

  return { ...task, assignee };
}

export interface UpdateTaskAuth {
  userId: string;
  tenantId: string;
  role: UserRole;
}

// Admins can update any field on any task in their tenant. Employees/students
// may only flip the status of a task assigned to themselves — they can't
// retitle, reassign, or touch anyone else's task.
export async function updateTask(auth: UpdateTaskAuth, id: string, input: UpdateTaskInput) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Task not found", 404);
  }
  const tasks = await tasksCollection();
  const tenantId = new ObjectId(auth.tenantId);
  const task = await tasks.findOne({ _id: new ObjectId(id), tenantId });
  if (!task) {
    throw new AuthError("Task not found", 404);
  }

  let update: Partial<Task>;
  if (auth.role === "admin") {
    update = {
      ...(input.status && { status: input.status }),
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
    };
  } else {
    if (task.assignedTo.toString() !== auth.userId) {
      throw new AuthError("You can only update your own tasks", 403);
    }
    if (!input.status) {
      throw new AuthError("Only the task status can be updated", 400);
    }
    update = { status: input.status };
  }

  const updated = await tasks.findOneAndUpdate(
    { _id: task._id, tenantId },
    { $set: update },
    { returnDocument: "after" }
  );

  await logActivity({
    tenantId,
    userId: new ObjectId(auth.userId),
    action: input.status ? "task_status_changed" : "task_updated",
    description: input.status
      ? `Set task "${updated!.title}" to ${input.status}`
      : `Updated task "${updated!.title}"`,
  });

  return updated!;
}
