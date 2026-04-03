"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEmployeeAction, type FormState } from "@/app/dashboard/actions";
import { useModalClose } from "@/components/ui/modal";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

export function EmployeeForm() {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    createEmployeeAction,
    initialFormState,
  );

  useEffect(() => {
    if (state.status === "success") {
      closeModal?.();
    }
  }, [closeModal, state.status]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee-code">Employee code</Label>
          <Input id="employee-code" name="employeeCode" placeholder="EMP-001" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employee-name">Full name</Label>
          <Input id="employee-name" name="fullName" placeholder="Maya Collins" required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job-title">Role</Label>
          <Input id="job-title" name="jobTitle" placeholder="Shift lead" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone</Label>
          <Input id="phone-number" name="phoneNumber" placeholder="Optional" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hire-date">Hire date</Label>
          <Input id="hire-date" name="hireDate" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-type">Pay type</Label>
          <select
            id="pay-type"
            name="payType"
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
            defaultValue="hourly"
          >
            <option value="hourly">Hourly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate">Hourly rate / monthly salary</Label>
        <Input id="rate" min="0" name="rate" placeholder="25.00" required step="0.01" type="number" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="paid-leave-quota">Paid leave quota</Label>
          <Input
            defaultValue="0"
            id="paid-leave-quota"
            min="0"
            name="paidLeaveQuota"
            step="0.5"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sick-leave-quota">Sick leave quota</Label>
          <Input
            defaultValue="0"
            id="sick-leave-quota"
            min="0"
            name="sickLeaveQuota"
            step="0.5"
            type="number"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border px-3 py-3 text-sm text-foreground">
        <input className="size-4 accent-current" name="overtimeEligible" type="checkbox" />
        Overtime enabled
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="overtime-rate">Overtime hourly rate</Label>
          <Input
            id="overtime-rate"
            min="0"
            name="overtimeRate"
            placeholder="Optional fixed OT rate"
            step="0.01"
            type="number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="overtime-multiplier">Overtime multiplier</Label>
          <Input
            defaultValue="1.50"
            id="overtime-multiplier"
            min="0"
            name="overtimeMultiplier"
            step="0.01"
            type="number"
          />
        </div>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Add employee"}
      </Button>
    </form>
  );
}
