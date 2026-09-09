import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse, AuthError } from "@/lib/auth";
import { tenantsCollection } from "@/lib/db/collections";
import { createStudentSchema, listStudentsQuerySchema } from "@/lib/validation/students";
import { createStudent, listStudents } from "@/lib/services/students";

function serializeStudent(student: Awaited<ReturnType<typeof listStudents>>[number]) {
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

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const tenants = await tenantsCollection();
    const tenant = await tenants.findOne({ _id: new ObjectId(auth.tenantId!) });
    if (!tenant) throw new AuthError("Tenant not found", 404);

    const { id, uniqueId } = await createStudent(tenant, parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ id: id.toString(), uniqueId }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listStudentsQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const students = await listStudents(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ students: students.map(serializeStudent) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
