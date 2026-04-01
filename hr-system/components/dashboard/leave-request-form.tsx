"use client";

import { useActionState, useEffect } from "react";
import { createLeaveRequestAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalClose } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import {
  formatEnumLabel,
  leavePortionOptions,
  leaveRequestStatusOptions,
} from "@/lib/hr/options";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

type EmployeeOption = {
  id: string;
  fullName: string;
  employeeCode: string;
};

type LeaveTypeOption = {
  id: string;
  name: string;
  code: string;
};

type LeaveRequestFormProps = {
  employees: EmployeeOption[];
  leaveTypes: LeaveTypeOption[];
};

export function LeaveRequestForm({ employees, leaveTypes }: LeaveRequestFormProps) {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    createLeaveRequestAction,
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
        <Label htmlFor="leave-employee">Employee</Label>
        <select
          id="leave-employee"
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
          <Label htmlFor="leave-type">Leave type</Label>
          <select
            id="leave-type"
            name="leaveTypeId"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue=""
            required
          >
            <option value="">Select a leave type</option>
            {leaveTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="leave-status">Status</Label>
          <select
            id="leave-status"
            name="status"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue="pending"
          >
            {leaveRequestStatusOptions.map((item) => (
              <option key={item} value={item}>
                {formatEnumLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="leave-start-date">Start date</Label>
          <Input id="leave-start-date" name="startDate" required type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="leave-end-date">End date</Label>
          <Input id="leave-end-date" name="endDate" required type="date" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="requested-units">Units</Label>
          <Input id="requested-units" min="0.5" name="requestedUnits" placeholder="1" required step="0.5" type="number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-portion">Start portion</Label>
          <select
            id="start-portion"
            name="startPortion"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue="full_day"
          >
            {leavePortionOptions.map((item) => (
              <option key={item} value={item}>
                {formatEnumLabel(item)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-portion">End portion</Label>
          <select
            id="end-portion"
            name="endPortion"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue="full_day"
          >
            {leavePortionOptions.map((item) => (
              <option key={item} value={item}>
                {formatEnumLabel(item)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="leave-reason">Reason</Label>
        <Textarea id="leave-reason" name="requestedReason" placeholder="Why is this leave being recorded or requested?" />
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save leave request"}
      </Button>
    </form>
  );
}
