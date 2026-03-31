import { headers } from "next/headers";
import { auth } from "@/auth";
import { AuthPanel } from "@/components/auth-panel";

export default async function Home() {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  const session = authSession
    ? {
        user: {
          id: authSession.user.id,
          name: authSession.user.name,
          email: authSession.user.email,
          emailVerified: authSession.user.emailVerified,
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-950 sm:px-10">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <section className="grid gap-8 rounded-[2rem] border border-black/10 bg-white p-8 shadow-sm lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
              HR System starter
            </p>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Better Auth email/password on top of Drizzle and Neon.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg">
                The starter now includes a Better Auth API route, a Neon-backed
                Drizzle connection, generated auth schema, and a working session
                check on the landing page.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-medium text-zinc-950">Database</p>
                <p>Neon Postgres via `drizzle-orm/neon-http`</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-medium text-zinc-950">Auth</p>
                <p>Better Auth email/password sessions</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="font-medium text-zinc-950">Migrations</p>
                <p>`npx drizzle-kit push` reads the generated schema</p>
              </div>
            </div>
          </div>
          <AuthPanel session={session} />
        </section>
      </main>
    </div>
  );
}
