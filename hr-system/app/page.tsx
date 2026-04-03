import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { getAdminSession, isAdminBootstrapRequired } from "@/lib/auth/session";

const featureCards = [
  {
    label: "Daily attendance",
    detail: "One clean record per employee per day, with worked, leave, holiday, and absent states.",
  },
  {
    label: "Simple payroll",
    detail: "Monthly totals stay understandable for a small store team with hourly and monthly pay.",
  },
  {
    label: "Low overhead",
    detail: "Built for a manager, two cashiers, and a helper, not a full HR department.",
  },
];

export default async function Home() {
  const [session, bootstrapRequired] = await Promise.all([
    getAdminSession(),
    isAdminBootstrapRequired(),
  ]);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] text-foreground">
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-8 sm:px-10 lg:px-12">
        <section className="grid w-full overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white shadow-[0_40px_120px_-56px_rgba(15,23,42,0.38)] lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative overflow-hidden bg-slate-950 px-8 py-10 text-white sm:px-10 sm:py-12 lg:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.18),transparent_30%)]" />
            <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-200">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  Small Business Staff Manager
                </div>

                <div className="mt-8 max-w-2xl space-y-5">
                  <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.65rem] lg:leading-[1.02]">
                    Calm back-office control for a fast-moving store.
                  </h1>
                  <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                    Run attendance, leave status, holidays, and payroll from one lightweight workspace built for everyday shop operations.
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Team size
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">4 staff</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Payroll base
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">THB monthly</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Admin flow
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">Setup then sign in</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {featureCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-sm"
                  >
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center justify-center bg-[linear-gradient(180deg,#fbfdff_0%,#f8fafc_100%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <AuthPanel bootstrapRequired={bootstrapRequired} />
          </section>
        </section>
      </main>
    </div>
  );
}
