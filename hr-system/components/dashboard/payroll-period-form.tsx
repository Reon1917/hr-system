"use client";

import { useActionState, useEffect } from "react";
import { calculatePayrollAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalClose } from "@/components/ui/modal";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

export function PayrollPeriodForm() {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    calculatePayrollAction,
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
          <Label htmlFor="payroll-start-date">Start date</Label>
          <Input id="payroll-start-date" name="startDate" required type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payroll-end-date">End date</Label>
          <Input id="payroll-end-date" name="endDate" required type="date" />
        </div>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Calculating..." : "Calculate payroll"}
      </Button>
    </form>
  );
}
