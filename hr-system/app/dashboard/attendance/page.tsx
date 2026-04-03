import Link from "next/link";
import { AttendanceForm } from "@/components/dashboard/attendance-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { attendanceStatusOptions, formatEnumLabel } from "@/lib/hr/options";
import { getAttendancePageData } from "@/lib/hr/queries";
import { type AsyncSearchParams, readSearchParam } from "@/lib/search-params";

type AttendancePageProps = {
  searchParams: AsyncSearchParams;
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const filters = {
    employeeId: readSearchParam(params.employeeId) ?? "",
    status: readSearchParam(params.status) ?? "",
    workDate: readSearchParam(params.workDate) ?? "",
  };
  const data = await getAttendancePageData(filters);

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Attendance
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Daily attendance log
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Record one daily entry per employee. Saving the same employee and date again replaces the previous entry.
            </p>
          </div>
          <Modal
            description="Record a worked day, leave day, holiday, or absence for one employee."
            title="Save attendance"
            triggerLabel="Save attendance"
          >
            <AttendanceForm employees={data.employees} />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Filters
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Narrow the attendance log
          </h2>
        </div>
        <form className="grid gap-4 px-6 py-6 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="attendance-filter-employee">Employee</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.employeeId}
              id="attendance-filter-employee"
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
            <Label htmlFor="attendance-filter-status">Status</Label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
              defaultValue={filters.status}
              id="attendance-filter-status"
              name="status"
            >
              <option value="">All statuses</option>
              {attendanceStatusOptions.map((item) => (
                <option key={item} value={item}>
                  {formatEnumLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-filter-date">Date</Label>
            <Input defaultValue={filters.workDate} id="attendance-filter-date" name="workDate" type="date" />
          </div>
          <Button type="submit" variant="outline">
            Apply
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard/attendance">Clear</Link>
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Attendance log
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Latest saved entries
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Worked time</th>
                <th className="px-6 py-3">OT hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.entries.length ? (
                data.entries.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{item.fullName}</p>
                        <p className="text-muted-foreground">{item.employeeCode}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.workDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.uiStatus === "worked" ? "success" : "secondary"}>
                        {formatEnumLabel(item.uiStatus)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.actualClockInAt && item.actualClockOutAt
                        ? `${new Date(item.actualClockInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(item.actualClockOutAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "Manual / no time"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.overtimeHours ? item.overtimeHours.toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                    No attendance entries matched the current filters.
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
