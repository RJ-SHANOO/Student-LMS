import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/services/students";
import { NewFeeForm } from "./new-fee-form";

export default async function NewFeePage() {
  const session = await getSession();
  const students = await listStudents(new ObjectId(session!.tenantId!), { status: "active" });

  return (
    <div className="max-w-lg">
      <Link href="/admin/fees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to fees
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Generate Fee</h1>

      <NewFeeForm
        students={students.map((s) => ({ id: s._id!.toString(), name: s.name, uniqueId: s.uniqueId }))}
      />
    </div>
  );
}
