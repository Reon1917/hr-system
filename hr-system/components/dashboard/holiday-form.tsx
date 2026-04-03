"use client";

import { useActionState, useEffect } from "react";
import { saveHolidayAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModalClose } from "@/components/ui/modal";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

export function HolidayForm() {
  const closeModal = useModalClose();
  const [state, formAction, isPending] = useActionState(
    saveHolidayAction,
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
        <Label htmlFor="holiday-name">Holiday name</Label>
        <Input id="holiday-name" name="name" placeholder="Thingyan holiday" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="holiday-date">Date</Label>
        <Input id="holiday-date" name="holidayDate" required type="date" />
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save holiday"}
      </Button>
    </form>
  );
}
