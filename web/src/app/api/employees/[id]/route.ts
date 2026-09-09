import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateEmployeeSchema } from "@/lib/validation/employees";
import { getEmployee, updateEmployee } from "@/lib/services/employees";

function serializeEmployee(employee: Awaited<ReturnType<typeof getEmployee>>) {
  return {
    id: employee._id!.toString(),
    name: employee.name,
    cnic: employee.cnic,
    dob: employee.dob,
    department: employee.department,
    designation: employee.designation,
    status: employee.status,
    createdAt: employee.createdAt,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const employee = await getEmployee(new ObjectId(auth.tenantId!), id);
    return NextResponse.json({ employee: serializeEmployee(employee) });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const employee = await updateEmployee(new ObjectId(auth.tenantId!), id, parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ employee: serializeEmployee(employee) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
