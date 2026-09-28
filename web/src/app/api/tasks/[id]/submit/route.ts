import { NextRequest, NextResponse } from "next/server";
import { requireRole, toErrorResponse, AuthError } from "@/lib/auth";
import { submitTask } from "@/lib/services/tasks";

// Student-only: upload/replace their submission file for a task in their own course.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["student"]);
    const { id } = await params;
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      throw new AuthError("Expected multipart/form-data", 400);
    }
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new AuthError("A file is required", 400);
    }

    const result = await submitTask({ userId: auth.userId, tenantId: auth.tenantId!, role: auth.role }, id, file);
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
