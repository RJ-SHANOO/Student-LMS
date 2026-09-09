import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { createEmployeeSchema, listEmployeesQuerySchema } from "@/lib/validation/employees";
import { createEmployee, listEmployees } from "@/lib/services/employees";

function serializeEmployee(employee: Awaited<ReturnType<typeof listEmployees>>[number]) {
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

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { id } = await createEmployee(new ObjectId(auth.tenantId!), parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ id: id.toString() }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listEmployeesQuerySchema.safeParse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      search: request.nextUrl.searchParams.get("search") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const employees = await listEmployees(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ employees: employees.map(serializeEmployee) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
