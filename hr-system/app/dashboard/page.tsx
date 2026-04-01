import Link from "next/link";
import { getOverviewPageData } from "@/lib/hr/queries";
import { formatEnumLabel } from "@/lib/hr/options";

const summaryLabels = [
  { key: "totalEmployees", label: "Employees" },
  { key: "activeEmployees", label: "Active employees" },
  { key: "activeDepartments", label: "Departments" },
  { key: "pendingLeaveRequests", label: "Pending leave" },
  { key: "draftPayrollPeriods", label: "Draft payrolls" },
] as const;

export default async function DashboardPage() {
  const data = await getOverviewPageData();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Daily HR operations summary
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Monitor employee volume, pending leave, and payroll draft readiness from a single operational view.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summaryLabels.map((item) => (
          <div key={item.key} className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {item.label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">
              {data.summary[item.key]}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Recent employees
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Latest employee records
            </h2>
          </div>
          <Link className="text-sm font-medium text-primary" href="/dashboard/employees">
            View employees
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.recentEmployees.length ? (
                data.recentEmployees.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{item.fullName}</p>
                        <p className="text-muted-foreground">{item.jobTitle}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.employeeCode}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.departmentName ?? "Unassigned"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatEnumLabel(item.status)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={4}>
                    No employees have been created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Operational queue
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Items that need attention
          </h2>
        </div>
        <div className="grid gap-0 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <section className="px-6 py-5">
            <div className="border-b border-border px-0 py-5 pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Pending leave
              </p>
            </div>
            <div className="space-y-3 pt-5">
              {data.pendingLeaveRequests.length ? (
                data.pendingLeaveRequests.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-white px-4 py-3">
                    <p className="font-medium text-foreground">{item.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.employeeCode} · {item.leaveTypeCode}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.startDate} to {item.endDate}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No pending leave requests.</p>
              )}
            </div>
          </section>

          <section className="px-6 py-5">
            <div className="border-b border-border px-0 py-5 pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Draft payrolls
              </p>
            </div>
            <div className="space-y-3 pt-5">
              {data.draftPayrolls.length ? (
                data.draftPayrolls.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-white px-4 py-3">
                    <p className="font-medium text-foreground">
                      {item.startDate} to {item.endDate}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatEnumLabel(item.frequency)} · {formatEnumLabel(item.status)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No draft payroll periods.</p>
              )}
            </div>
          </section>

          <section className="px-6 py-5">
            <div className="border-b border-border px-0 py-5 pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Recent attendance
              </p>
            </div>
            <div className="space-y-3 pt-5">
              {data.attendanceEntries.length ? (
                data.attendanceEntries.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-white px-4 py-3">
                    <p className="font-medium text-foreground">{item.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.employeeCode} · {item.workDate}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatEnumLabel(item.status)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No attendance entries yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
