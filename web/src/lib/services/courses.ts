import { ObjectId, type Filter } from "mongodb";
import { coursesCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { Course } from "@/types/models";
import type { createCourseSchema, listCoursesQuerySchema, updateCourseSchema } from "@/lib/validation/courses";
import type { z } from "zod";

type CreateCourseInput = z.infer<typeof createCourseSchema>;
type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;

export async function createCourse(tenantId: ObjectId, input: CreateCourseInput, actorId: ObjectId) {
  const courses = await coursesCollection();

  const existing = await courses.findOne({ tenantId, code: input.code });
  if (existing) {
    throw new AuthError("A course with this code already exists", 409);
  }

  const result = await courses.insertOne({
    tenantId,
    name: input.name,
    code: input.code,
    duration: input.duration,
    status: "active",
    createdAt: new Date(),
  });

  await logActivity({
    tenantId,
    userId: actorId,
    action: "course_created",
    description: `Created course ${input.name} (${input.code})`,
  });

  return { id: result.insertedId };
}

export async function listCourses(tenantId: ObjectId, filters: ListCoursesQuery = {}) {
  const courses = await coursesCollection();
  const query: Filter<Course> = { tenantId };
  if (filters.status) query.status = filters.status;
  return courses.find(query).sort({ name: 1 }).toArray();
}

export async function listActiveCourses(tenantId: ObjectId) {
  return listCourses(tenantId, { status: "active" });
}

export async function getCourse(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Course not found", 404);
  }
  const courses = await coursesCollection();
  const course = await courses.findOne({ _id: new ObjectId(id), tenantId });
  if (!course) {
    throw new AuthError("Course not found", 404);
  }
  return course;
}

export async function updateCourse(tenantId: ObjectId, id: string, input: UpdateCourseInput, actorId: ObjectId) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Course not found", 404);
  }
  const courses = await coursesCollection();
  const updated = await courses.findOneAndUpdate(
    { _id: new ObjectId(id), tenantId },
    { $set: input },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AuthError("Course not found", 404);
  }

  await logActivity({
    tenantId,
    userId: actorId,
    action: input.status ? "course_status_changed" : "course_updated",
    description: input.status ? `Set course ${updated.name} to ${input.status}` : `Updated course ${updated.name}`,
  });

  return updated;
}

// Validates that every submitted courseId actually belongs to this tenant
// before it's persisted on a student/employee User document.
export async function assertCoursesBelongToTenant(tenantId: ObjectId, courseIds: ObjectId[]) {
  if (courseIds.length === 0) return;
  const courses = await coursesCollection();
  const count = await courses.countDocuments({ tenantId, _id: { $in: courseIds } });
  if (count !== courseIds.length) {
    throw new AuthError("One or more selected courses were not found", 400);
  }
}

// Resolves a single course's code — used wherever a student/employee's
// courseId needs to be matched against a course-scoped task's audience code.
export async function getCourseCode(tenantId: ObjectId, courseId: ObjectId | undefined | null) {
  if (!courseId) return undefined;
  const courses = await coursesCollection();
  const course = await courses.findOne({ _id: courseId, tenantId });
  return course?.code;
}

export async function getCourseCodes(tenantId: ObjectId, courseIds: ObjectId[]) {
  if (courseIds.length === 0) return [];
  const courses = await coursesCollection();
  const found = await courses.find({ tenantId, _id: { $in: courseIds } }).toArray();
  return found.map((c) => c.code);
}

export async function getCourseIdByCode(tenantId: ObjectId, code: string) {
  const courses = await coursesCollection();
  const course = await courses.findOne({ tenantId, code: code.toUpperCase() });
  return course?._id;
}
