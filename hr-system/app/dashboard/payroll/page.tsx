import Link from "next/link";
import { PayrollPeriodForm } from "@/components/dashboard/payroll-period-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  formatEnumLabel,
  payrollFrequencyOptions,
  payrollPeriodStatusOptions,
} from "@/lib/hr/options";
import { getPayrollPageData } from "@/lib/hr/queries";
import { type AsyncSearchParams, readSearchParam } from "@/lib/search-params";

type PayrollPageProps = {
  searchParams: AsyncSearchParams;
};

export default async function PayrollPage({ searchParams }: PayrollPageProps) {
  const params = await searchParams;
  const filters = {
    status: readSearchParam(params.status) ?? "",
    frequency: readSearchParam(params.frequency) ?? "",
  };
  const data = await getPayrollPageData(filters);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Payroll
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Payroll periods and draft runs
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review payroll periods first, then open the draft creation flow only when you need a new period.
            </p>
          </div>
          <Modal
            description="Create a new payroll period and initialize its first draft payroll run against the current policy version."
            title="Create payroll period"
            triggerLabel="Create payroll period"
          >
            <PayrollPeriodForm />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Narrow the payroll calendar
          </h2>
        </div>
        <form className="grid gap-4 px-6 py-6 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="payroll-filter-status">Period status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.status}
              id="payroll-filter-status"
              name="status"
            >
              <option value="">All statuses</option>
              {payrollPeriodStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {formatEnumLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payroll-filter-frequency">Frequency</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.frequency}
              id="payroll-filter-frequency"
              name="frequency"
            >
              <option value="">All frequencies</option>
              {payrollFrequencyOptions.map((item) => (
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
            <Link href="/dashboard/payroll">Clear</Link>
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Payroll periods
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Current payroll calendar
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Frequency</th>
                <th className="px-6 py-3">Period status</th>
                <th className="px-6 py-3">Latest run</th>
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
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatEnumLabel(item.frequency)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === "draft" ? "secondary" : "success"}>
                        {formatEnumLabel(item.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.latestRun
                        ? `Run ${item.latestRun.runNumber} · ${formatEnumLabel(item.latestRun.status)}`
                        : "No run"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={4}>
                    No payroll periods matched the current filters.
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
