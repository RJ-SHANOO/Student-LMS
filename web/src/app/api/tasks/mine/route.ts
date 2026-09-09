import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listMyTasks } from "@/lib/services/tasks";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["employee", "student"]);
    const tasks = await listMyTasks(new ObjectId(auth.tenantId!), new ObjectId(auth.userId));
    return NextResponse.json({ tasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}
