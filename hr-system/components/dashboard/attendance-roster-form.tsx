"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAttendanceRosterAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { attendanceStatusOptions, formatEnumLabel } from "@/lib/hr/options";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

type AttendanceRosterRow = {
  id: string;
  employeeCode: string;
  fullName: string;
  jobTitle: string;
  defaultShiftLabel: string;
  defaultShiftStartTime: string;
  defaultShiftEndTime: string;
  defaultShiftBreakMinutes: number;
  payLabel: string;
  currentStatus: (typeof attendanceStatusOptions)[number];
  overtimeHours: number;
  remarks: string;
};

type AttendanceRosterFormProps = {
  rosterDate: string;
  rows: AttendanceRosterRow[];
};

export function AttendanceRosterForm({ rosterDate, rows }: AttendanceRosterFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    saveAttendanceRosterAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <input name="workDate" type="hidden" value={rosterDate} />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Default shift</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">OT hours</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-4 align-top">
                  <input name="employeeId" type="hidden" value={row.id} />
                  <div>
                    <p className="font-medium text-foreground">{row.fullName}</p>
                    <p className="text-muted-foreground">
                      {row.employeeCode} · {row.jobTitle}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-muted-foreground">{row.payLabel}</td>
                <td className="px-4 py-4 align-top text-muted-foreground">
                  <div>{row.defaultShiftLabel}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.defaultShiftStartTime} - {row.defaultShiftEndTime} · {row.defaultShiftBreakMinutes} min break
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <select
                    className="flex h-10 w-full min-w-36 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    defaultValue={row.currentStatus}
                    name="status"
                  >
                    {attendanceStatusOptions.map((item) => (
                      <option key={item} value={item}>
                        {formatEnumLabel(item)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4 align-top">
                  <input
                    className="flex h-10 w-28 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    defaultValue={row.overtimeHours.toFixed(2)}
                    min="0"
                    name="overtimeHours"
                    step="0.25"
                    type="number"
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <input
                    className="flex h-10 w-full min-w-56 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
                    defaultValue={row.remarks}
                    name="remarks"
                    placeholder="Optional note"
                    type="text"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Everyone is preloaded for {rosterDate}. Only change exceptions, overtime, or notes, then save the whole day.
        </p>
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving roster..." : "Save day roster"}
        </Button>
      </div>
    </form>
  );
}
