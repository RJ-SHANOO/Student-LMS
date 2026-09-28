import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateCourseSchema } from "@/lib/validation/courses";
import { getCourse, updateCourse } from "@/lib/services/courses";

function serializeCourse(course: Awaited<ReturnType<typeof getCourse>>) {
  return {
    id: course._id!.toString(),
    name: course.name,
    code: course.code,
    duration: course.duration,
    status: course.status,
    createdAt: course.createdAt,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const { id } = await params;
    const course = await getCourse(new ObjectId(auth.tenantId!), id);
    return NextResponse.json({ course: serializeCourse(course) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateCourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const course = await updateCourse(new ObjectId(auth.tenantId!), id, parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ course: serializeCourse(course) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
