import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateStudentSchema } from "@/lib/validation/students";
import { getStudent, updateStudent } from "@/lib/services/students";

function serializeStudent(student: Awaited<ReturnType<typeof getStudent>>) {
  return {
    id: student._id!.toString(),
    name: student.name,
    cnic: student.cnic,
    dob: student.dob,
    department: student.department,
    course: student.course,
    batch: student.batch,
    status: student.status,
    uniqueId: student.uniqueId,
    createdAt: student.createdAt,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const student = await getStudent(new ObjectId(auth.tenantId!), id);
    return NextResponse.json({ student: serializeStudent(student) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const student = await updateStudent(new ObjectId(auth.tenantId!), id, parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ student: serializeStudent(student) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
