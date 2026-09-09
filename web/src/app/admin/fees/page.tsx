import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listFees } from "@/lib/services/fees";

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();
  const { status } = await searchParams;

  const fees = await listFees(new ObjectId(session!.tenantId!), {
    status: status === "paid" || status === "partial" || status === "unpaid" ? status : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">Fees</h1>
        <Link
          href="/admin/fees/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Generate Fee
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Filter
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Student</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Paid</th>
              <th className="px-4 py-2">Remaining</th>
              <th className="px-4 py-2">Due Date</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fees.map((fee) => (
              <tr key={fee._id!.toString()}>
                <td className="px-4 py-2">
                  <Link href={`/admin/fees/${fee._id}`} className="text-primary hover:underline">
                    {fee.student.name}
                  </Link>
                  <span className="ml-1 font-mono text-xs text-muted-foreground">{fee.student.uniqueId}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{fee.totalFee.toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">{fee.paidAmount.toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">{fee.remainingAmount.toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {new Date(fee.dueDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
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
                </td>
              </tr>
            ))}
            {fees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No fee records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
