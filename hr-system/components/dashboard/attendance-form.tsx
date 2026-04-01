"use client";

import { useActionState, useEffect } from "react";
import { createAttendanceAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalClose } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { attendanceStatusOptions, formatEnumLabel } from "@/lib/hr/options";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

type EmployeeOption = {
  id: string;
  fullName: string;
  employeeCode: string;
};

type AttendanceFormProps = {
  employees: EmployeeOption[];
};

export function AttendanceForm({ employees }: AttendanceFormProps) {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    createAttendanceAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      closeModal?.();
    }
  }, [closeModal, state.status]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="attendance-employee">Employee</Label>
        <select
          id="attendance-employee"
          name="employeeId"
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
          defaultValue=""
          required
        >
          <option value="">Select an employee</option>
          {employees.map((item) => (
            <option key={item.id} value={item.id}>
              {item.employeeCode} · {item.fullName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="attendance-date">Work date</Label>
          <Input id="attendance-date" name="workDate" required type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendance-status">Status</Label>
          <select
            id="attendance-status"
            name="status"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue="present"
          >
            {attendanceStatusOptions.map((item) => (
              <option key={item} value={item}>
                {formatEnumLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendance-shift">Shift label</Label>
        <Input id="attendance-shift" name="shiftLabel" placeholder="Morning shift" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="clock-in-time">Clock in</Label>
          <Input id="clock-in-time" name="clockInTime" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clock-out-time">Clock out</Label>
          <Input id="clock-out-time" name="clockOutTime" type="time" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="break-minutes">Break minutes</Label>
          <Input id="break-minutes" min="0" name="breakMinutes" step="1" type="number" defaultValue="0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="attendance-remarks">Remarks</Label>
        <Textarea id="attendance-remarks" name="remarks" placeholder="Optional note for payroll and attendance review." />
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Record attendance"}
      </Button>
    </form>
  );
}
