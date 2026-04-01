"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDepartmentAction, type FormState } from "@/app/dashboard/actions";
import { useModalClose } from "@/components/ui/modal";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

export function DepartmentForm() {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    createDepartmentAction,
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
        <Label htmlFor="department-code">Department code</Label>
        <Input id="department-code" name="code" placeholder="OPS" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="department-name">Department name</Label>
        <Input id="department-name" name="name" placeholder="Operations" required />
      </div>
      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Add department"}
      </Button>
    </form>
  );
}
