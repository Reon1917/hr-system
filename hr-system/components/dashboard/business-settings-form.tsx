"use client";

import { useActionState } from "react";
import { updateBusinessSettingsAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

type BusinessSettingsFormProps = {
  settings: {
    businessName: string;
    currencyCode: string;
    timezone: string;
  };
  policy: {
    paidLeavePayable: boolean;
    sickLeavePayable: boolean;
    holidaysPaid: boolean;
    overtimeMultiplierDefault: string;
    defaultWorkHoursPerDay: number;
  };
};

export function BusinessSettingsForm({ settings, policy }: BusinessSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateBusinessSettingsAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business-name">Business name</Label>
          <Input defaultValue={settings.businessName} id="business-name" name="businessName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency-code">Currency code</Label>
          <Input defaultValue={settings.currencyCode} id="currency-code" name="currencyCode" required />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input defaultValue={settings.timezone} id="timezone" name="timezone" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-work-hours">Default work hours per day</Label>
          <Input
            defaultValue={policy.defaultWorkHoursPerDay}
            id="default-work-hours"
            min="1"
            name="defaultWorkHoursPerDay"
            required
            step="0.5"
            type="number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="default-overtime-multiplier">Default overtime multiplier</Label>
        <Input
          defaultValue={policy.overtimeMultiplierDefault}
          id="default-overtime-multiplier"
          min="0"
          name="defaultOvertimeMultiplier"
          required
          step="0.01"
          type="number"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground">
          <input
            className="size-4 accent-current"
            defaultChecked={policy.paidLeavePayable}
            name="paidLeavePayable"
            type="checkbox"
          />
          Paid leave is payable
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground">
          <input
            className="size-4 accent-current"
            defaultChecked={policy.sickLeavePayable}
            name="sickLeavePayable"
            type="checkbox"
          />
          Sick leave is payable
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground">
          <input
            className="size-4 accent-current"
            defaultChecked={policy.holidaysPaid}
            name="holidaysPaid"
            type="checkbox"
          />
          Holidays are payable
        </label>
      </div>

      {state.message ? (
        <p className={`text-sm ${state.status === "error" ? "text-red-600" : "text-blue-700"}`}>
          {state.message}
        </p>
      ) : null}

      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
