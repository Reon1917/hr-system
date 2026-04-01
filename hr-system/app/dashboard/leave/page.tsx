import Link from "next/link";
import { LeaveRequestForm } from "@/components/dashboard/leave-request-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatEnumLabel, leaveRequestStatusOptions } from "@/lib/hr/options";
import { getLeavePageData } from "@/lib/hr/queries";
import { type AsyncSearchParams, readSearchParam } from "@/lib/search-params";

type LeavePageProps = {
  searchParams: AsyncSearchParams;
};

export default async function LeavePage({ searchParams }: LeavePageProps) {
  const params = await searchParams;
  const filters = {
    employeeId: readSearchParam(params.employeeId) ?? "",
    leaveTypeId: readSearchParam(params.leaveTypeId) ?? "",
    status: readSearchParam(params.status) ?? "",
  };
  const data = await getLeavePageData(filters);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Leave
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Leave requests and balances
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review leave activity with filters first, then open the request flow only when you need to create or approve one.
            </p>
          </div>
          <Modal
            description="Create an admin-managed leave request and, when approved, write the matching leave balance usage entry."
            title="Add leave request"
            triggerLabel="Add leave request"
          >
            <LeaveRequestForm employees={data.employees} leaveTypes={data.leaveTypes} />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Narrow leave activity
          </h2>
        </div>
        <form className="grid gap-4 px-6 py-6 lg:grid-cols-[1.2fr_1.2fr_1fr_auto_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="leave-filter-employee">Employee</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.employeeId}
              id="leave-filter-employee"
              name="employeeId"
            >
              <option value="">All employees</option>
              {data.employees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.employeeCode} · {item.fullName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave-filter-type">Leave type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.leaveTypeId}
              id="leave-filter-type"
              name="leaveTypeId"
            >
              <option value="">All leave types</option>
              {data.leaveTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave-filter-status">Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.status}
              id="leave-filter-status"
              name="status"
            >
              <option value="">All statuses</option>
              {leaveRequestStatusOptions.map((item) => (
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
            <Link href="/dashboard/leave">Clear</Link>
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Leave activity
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Current leave register
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Leave type</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.requests.length ? (
                data.requests.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{item.fullName}</p>
                        <p className="text-muted-foreground">{item.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.leaveTypeCode} · {item.leaveTypeName}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.startDate} to {item.endDate}
                      <div className="text-xs">{item.requestedUnits} units</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === "approved" ? "success" : "secondary"}>
                        {formatEnumLabel(item.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={4}>
                    No leave requests matched the current filters.
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
