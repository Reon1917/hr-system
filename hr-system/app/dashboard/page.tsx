import Link from "next/link";
import { getOverviewPageData } from "@/lib/hr/queries";
import { formatEnumLabel } from "@/lib/hr/options";

const summaryLabels = [
  { key: "totalEmployees", label: "Employees" },
  { key: "activeEmployees", label: "Active employees" },
  { key: "attendanceToday", label: "Entries today" },
  { key: "holidaysThisMonth", label: "Holidays this month" },
  { key: "payrollPeriods", label: "Saved payrolls" },
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
          Daily staff operations
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          See today&apos;s attendance activity, the latest payroll run, and upcoming holidays at a glance.
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
              Latest staff records
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
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.recentEmployees.length ? (
                data.recentEmployees.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 font-medium text-foreground">{item.fullName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.employeeCode}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.jobTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatEnumLabel(item.status)}
                    </td>
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

      <section className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Recent attendance
            </p>
          </div>
          <div className="space-y-3 px-6 py-5">
            {data.attendanceEntries.length ? (
              data.attendanceEntries.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-white px-4 py-3">
                  <p className="font-medium text-foreground">{item.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.employeeCode} · {item.workDate}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.statusLabel}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No attendance entries yet.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Upcoming holidays
            </p>
          </div>
          <div className="space-y-3 px-6 py-5">
            {data.upcomingHolidays.length ? (
              data.upcomingHolidays.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-white px-4 py-3">
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.holidayDate}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming holidays saved.</p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Latest payroll
            </p>
          </div>
          <div className="px-6 py-5">
            {data.latestPayroll ? (
              <div className="rounded-lg border border-border bg-white px-4 py-4">
                <p className="font-medium text-foreground">{data.latestPayroll.periodLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.latestPayroll.employeeCount} employees
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {data.latestPayroll.totalCost}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payroll has been calculated yet.</p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
