import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { getFee } from "@/lib/services/fees";
import { AuthError } from "@/lib/auth";
import { RecordPaymentForm } from "./record-payment-form";

export default async function FeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;

  let fee;
  try {
    fee = await getFee(new ObjectId(session!.tenantId!), id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="max-w-lg">
      <Link href="/admin/fees" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to fees
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{fee.student?.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{fee.student?.uniqueId}</p>
          </div>
          <span
            className={
              fee.status === "paid"
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : fee.status === "partial"
                  ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }
          >
            {fee.status}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Total Fee</dt>
          <dd className="text-foreground">{fee.totalFee.toLocaleString()}</dd>
          <dt className="text-muted-foreground">Paid</dt>
          <dd className="text-foreground">{fee.paidAmount.toLocaleString()}</dd>
          <dt className="text-muted-foreground">Remaining</dt>
          <dd className="text-foreground">{fee.remainingAmount.toLocaleString()}</dd>
          <dt className="text-muted-foreground">Due Date</dt>
          <dd className="text-foreground">{new Date(fee.dueDate).toLocaleDateString()}</dd>
        </dl>

        {fee.status !== "paid" && <RecordPaymentForm feeId={fee._id!.toString()} />}
      </div>
    </div>
  );
}
