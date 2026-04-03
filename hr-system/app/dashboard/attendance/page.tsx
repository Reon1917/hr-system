import Link from "next/link";
import { AttendanceRosterForm } from "@/components/dashboard/attendance-roster-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatEnumLabel } from "@/lib/hr/options";
import { getAttendancePageData } from "@/lib/hr/queries";
import { type AsyncSearchParams, readSearchParam } from "@/lib/search-params";

type AttendancePageProps = {
  searchParams: AsyncSearchParams;
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const params = await searchParams;
  const filters = {
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
              Daily roster sheet
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              The system loads every active employee for the selected day using their saved shift. You only change exceptions and save the whole roster once.
            </p>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="attendance-roster-date">Roster date</Label>
              <Input defaultValue={data.rosterDate} id="attendance-roster-date" name="workDate" type="date" />
            </div>
            <Button type="submit" variant="outline">
              Load date
            </Button>
            <Button asChild variant="ghost">
              <Link href="/dashboard/attendance">Today</Link>
            </Button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Day roster
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {data.rosterDate}
          </h2>
        </div>
        <div className="px-6 py-6">
          <AttendanceRosterForm rosterDate={data.rosterDate} rows={data.rosterRows} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Recent entries
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Latest saved attendance
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
                        : "Shift-based / no exact time"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.overtimeHours ? item.overtimeHours.toFixed(2) : "0.00"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={5}>
                    No attendance entries have been saved yet.
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
