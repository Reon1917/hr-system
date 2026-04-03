import { PayrollPeriodForm } from "@/components/dashboard/payroll-period-form";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getPayrollPageData } from "@/lib/hr/queries";

export default async function PayrollPage() {
  const data = await getPayrollPageData();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Payroll
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Calculate and review payroll
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Payroll is calculated on demand and each period keeps only the latest saved result.
            </p>
          </div>
          <Modal
            description="Calculate payroll for a selected period. Running it again replaces the saved result for that same period."
            title="Calculate payroll"
            triggerLabel="Calculate payroll"
          >
            <PayrollPeriodForm />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Saved periods
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Latest payroll runs by period
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Calculated</th>
                <th className="px-6 py-3">Employees</th>
                <th className="px-6 py-3">Total cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.periods.length ? (
                data.periods.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {item.startDate} to {item.endDate}
                        </p>
                        <p className="text-muted-foreground">
                          Saved {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.latestRun?.calculatedAt
                        ? new Date(item.latestRun.calculatedAt).toLocaleString()
                        : "Not calculated"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{item.employeeCount}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.totalCost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={4}>
                    No payroll periods have been calculated yet.
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
            Latest results
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {data.activePeriod
              ? `${data.activePeriod.startDate} to ${data.activePeriod.endDate}`
              : "No payroll calculated yet"}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Worked days</th>
                <th className="px-6 py-3">Leave days</th>
                <th className="px-6 py-3">OT hours</th>
                <th className="px-6 py-3">Net pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.latestResults.length ? (
                data.latestResults.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{item.employeeName}</p>
                        <p className="text-muted-foreground">{item.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.workedDays}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.leaveDays}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.overtimeHours.toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.netPay}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                    Run payroll for a period to see employee totals here.
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
