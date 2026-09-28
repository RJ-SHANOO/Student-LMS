import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { createCourseSchema, listCoursesQuerySchema } from "@/lib/validation/courses";
import { createCourse, listCourses } from "@/lib/services/courses";

function serializeCourse(course: Awaited<ReturnType<typeof listCourses>>[number]) {
  return {
    id: course._id!.toString(),
    name: course.name,
    code: course.code,
    duration: course.duration,
    status: course.status,
    createdAt: course.createdAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = createCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { id } = await createCourse(new ObjectId(auth.tenantId!), parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ id: id.toString() }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const parsed = listCoursesQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const courses = await listCourses(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ courses: courses.map(serializeCourse) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
