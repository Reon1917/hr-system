import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { getAdminSession, isAdminBootstrapRequired } from "@/lib/auth/session";

export default async function Home() {
  const [session, bootstrapRequired] = await Promise.all([
    getAdminSession(),
    isAdminBootstrapRequired(),
  ]);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex border-b border-border bg-white px-6 py-14 sm:px-10 lg:border-r lg:border-b-0 lg:px-14">
          <div className="flex w-full max-w-2xl flex-col justify-between gap-12">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Enterprise HR Workspace
              </div>
              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Plain, structured HR operations for small business teams.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Manage employees, attendance, leave, holidays, and payroll in one
                  clear workspace built for admins who need accuracy without the
                  overhead of a full enterprise suite.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Employee records
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Structured profiles, departments, compensation history, and status tracking.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Time and leave
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Attendance, overtime, leave balances, and holiday-aware operational data.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Payroll readiness
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Effective-dated rules and auditable payroll structures built into the database model.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center bg-muted/40 px-6 py-14 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-xl">
            <AuthPanel bootstrapRequired={bootstrapRequired} />
          </div>
        </section>
      </main>
    </div>
  );
}
