import { CompanyLocaleForm } from "@/components/dashboard/company-locale-form";
import { getSettingsPageData } from "@/lib/hr/queries";

export default async function SettingsPage() {
  const data = await getSettingsPageData();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Currency and timezone settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          The system supports three preset combinations for company-wide currency and timezone behavior.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Current settings
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Active company locale
          </h2>
        </div>
        <div className="grid gap-4 px-6 py-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Business
            </p>
            <p className="mt-2 font-medium text-foreground">{data.settings.businessName}</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Currency
            </p>
            <p className="mt-2 font-medium text-foreground">{data.settings.currencyCode}</p>
          </div>
          <div className="rounded-xl border border-border bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Timezone
            </p>
            <p className="mt-2 font-medium text-foreground">{data.settings.timezone}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Presets
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Switch supported locale presets
          </h2>
        </div>
        <div className="px-6 py-6">
          <CompanyLocaleForm
            activePresetId={data.activePreset.id}
            presets={data.presets}
          />
        </div>
      </section>
    </div>
  );
}
