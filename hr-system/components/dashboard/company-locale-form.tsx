"use client";

import { useActionState } from "react";
import { updateCompanyLocaleAction, type FormState } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";

const initialFormState: FormState = {
  status: "idle",
  message: "",
};

type LocalePreset = {
  id: string;
  label: string;
  currencyCode: string;
  timezone: string;
  locationLabel: string;
};

type CompanyLocaleFormProps = {
  presets: readonly LocalePreset[];
  activePresetId: string;
};

export function CompanyLocaleForm({ presets, activePresetId }: CompanyLocaleFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateCompanyLocaleAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-3">
        {presets.map((preset) => (
          <label
            key={preset.id}
            className="flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-white px-4 py-4 transition hover:border-primary/30"
          >
            <input
              className="mt-1 size-4 accent-current"
              defaultChecked={preset.id === activePresetId}
              name="presetId"
              type="radio"
              value={preset.id}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-foreground">{preset.label}</p>
                <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                  {preset.currencyCode}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{preset.locationLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{preset.timezone}</p>
            </div>
          </label>
        ))}
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
