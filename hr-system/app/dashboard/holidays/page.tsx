import { HolidayForm } from "@/components/dashboard/holiday-form";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { getHolidayPageData } from "@/lib/hr/queries";

export default async function HolidaysPage() {
  const data = await getHolidayPageData();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Holidays
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Holiday calendar
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Keep a simple list of business holidays for attendance and payroll reference.
            </p>
          </div>
          <Modal
            description="Save a holiday date. Saving the same date again updates the name."
            title="Save holiday"
            triggerLabel="Save holiday"
          >
            <HolidayForm />
          </Modal>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Holiday list
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Saved dates
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Holiday</th>
                <th className="px-6 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {data.holidays.length ? (
                data.holidays.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-muted-foreground">{item.holidayDate}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">Holiday</Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-muted-foreground" colSpan={3}>
                    No holidays have been saved yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
