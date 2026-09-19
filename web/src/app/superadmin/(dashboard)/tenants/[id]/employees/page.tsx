import { ObjectId } from "mongodb";
import { listEmployees } from "@/lib/services/employees";

export default async function TenantEmployeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { id } = await params;
  const { status, search } = await searchParams;

  const employees = await listEmployees(new ObjectId(id), {
    status: status === "active" || status === "inactive" ? status : undefined,
    search: search || undefined,
  });

  return (
    <div>
      <form className="flex gap-2" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name, CNIC, or designation"
          className="w-64 rounded-md border border-border px-3 py-1.5 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Filter
        </button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">CNIC</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Designation</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {employees.map((employee) => (
              <tr key={employee._id!.toString()}>
                <td className="px-4 py-2 text-foreground">{employee.name}</td>
                <td className="px-4 py-2 font-mono text-xs text-foreground">{employee.cnic}</td>
                <td className="px-4 py-2 text-muted-foreground">{employee.department}</td>
                <td className="px-4 py-2 text-muted-foreground">{employee.designation}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      employee.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
                    }
                  >
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
