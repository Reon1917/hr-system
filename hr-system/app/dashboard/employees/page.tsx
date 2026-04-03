import Link from "next/link";
import { toggleEmployeeStatusAction } from "@/app/dashboard/actions";
import { EmployeeForm } from "@/components/dashboard/employee-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { employeeStatusOptions, formatEnumLabel } from "@/lib/hr/options";
import { getEmployeesPageData } from "@/lib/hr/queries";
import { type AsyncSearchParams, readSearchParam } from "@/lib/search-params";

type EmployeesPageProps = {
  searchParams: AsyncSearchParams;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await searchParams;
  const filters = {
    query: readSearchParam(params.q) ?? "",
    status: readSearchParam(params.status) ?? "",
  };
  const data = await getEmployeesPageData(filters);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Employees
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Staff records and pay setup
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Keep a simple employee roster with pay settings and leave quotas in one place.
            </p>
          </div>
          <Modal
            description="Add a staff member with role, pay type, overtime settings, and leave quotas."
            title="Add employee"
            triggerLabel="Add employee"
          >
            <EmployeeForm />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Narrow the staff list
          </h2>
        </div>
        <form className="grid gap-4 px-6 py-6 lg:grid-cols-[1.4fr_1fr_auto_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="employee-filter-q">Search</Label>
            <Input
              defaultValue={filters.query}
              id="employee-filter-q"
              name="q"
              placeholder="Name, code, role, or phone"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-filter-status">Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.status}
              id="employee-filter-status"
              name="status"
            >
              <option value="">All statuses</option>
              {employeeStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {formatEnumLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="outline">
            Apply
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/employees">Clear</Link>
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Staff list
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Current employees
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Pay</th>
                <th className="px-6 py-3">Leave quota</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.employees.length ? (
                data.employees.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{item.fullName}</p>
                        <p className="text-muted-foreground">
                          {item.employeeCode} · {item.jobTitle}
                        </p>
                        {item.phoneNumber ? (
                          <p className="text-xs text-muted-foreground">{item.phoneNumber}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.currentCompensation
                        ? item.currentCompensation.payType === "hourly"
                          ? `Hourly · ${item.currentCompensation.hourlyRate}`
                          : `Monthly · ${item.currentCompensation.monthlySalary}`
                        : "Not set"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div>Paid: {item.leaveUsage.paidLeaveUsed} / {item.paidLeaveQuota}</div>
                      <div>Sick: {item.leaveUsage.sickLeaveUsed} / {item.sickLeaveQuota}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === "active" ? "success" : "secondary"}>
                        {formatEnumLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <form
                        action={toggleEmployeeStatusAction.bind(
                          null,
                          item.id,
                          item.status === "active" ? "inactive" : "active",
                        )}
                      >
                        <Button type="submit" variant="outline">
                          {item.status === "active" ? "Deactivate" : "Reactivate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                    No employees matched the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
