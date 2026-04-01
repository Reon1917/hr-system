import Link from "next/link";
import { DepartmentForm } from "@/components/dashboard/department-form";
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
    departmentId: readSearchParam(params.departmentId) ?? "",
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
              Employee master data
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review employee records first, then open creation actions only when you need them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Modal
              description="Create a new employee record with initial compensation settings and department assignment."
              title="Register employee"
              triggerLabel="Add employee"
            >
              <EmployeeForm departments={data.departments} />
            </Modal>
            <Modal
              description="Add a department for structure, filtering, and reporting across the employee register."
              title="Add department"
              triggerLabel="Add department"
              triggerVariant="outline"
            >
              <DepartmentForm />
            </Modal>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Narrow the employee register
          </h2>
        </div>
        <form className="grid gap-4 px-6 py-6 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="employee-filter-q">Search</Label>
            <Input
              defaultValue={filters.query}
              id="employee-filter-q"
              name="q"
              placeholder="Name, code, or title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee-filter-department">Department</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.departmentId}
              id="employee-filter-department"
              name="departmentId"
            >
              <option value="">All departments</option>
              {data.departments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
            </select>
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
            Employee register
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Current employee roster
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Compensation</th>
                <th className="px-6 py-3">Status</th>
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
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.departmentName ?? "Unassigned"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.currentCompensation
                        ? item.currentCompensation.payType === "hourly"
                          ? `Hourly · ${item.currentCompensation.hourlyRate}`
                          : `Monthly · ${item.currentCompensation.monthlySalary}`
                        : "Not set"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status === "active" ? "success" : "secondary"}>
                        {formatEnumLabel(item.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={4}>
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
