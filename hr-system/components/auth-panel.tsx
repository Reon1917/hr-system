"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";

type SessionData = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  };
} | null;

type AuthMode = "sign-in" | "sign-up";

type AuthPanelProps = {
  session: SessionData;
};

export function AuthPanel({ session }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submitLabel = mode === "sign-in" ? "Sign in" : "Create account";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          setMessage(error.message ?? "Unable to create account.");
          return;
        }

        setName("");
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setMessage(error.message ?? "Unable to sign in.");
          return;
        }
      }

      setPassword("");
      setMessage(mode === "sign-in" ? "Signed in." : "Account created.");
      router.refresh();
    });
  };

  const handleSignOut = () => {
    setMessage(null);

    startTransition(async () => {
      const { error } = await authClient.signOut();

      if (error) {
        setMessage(error.message ?? "Unable to sign out.");
        return;
      }

      setPassword("");
      setMessage("Signed out.");
      router.refresh();
    });
  };

  if (session) {
    return (
      <section className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Active session
            </p>
            <h2 className="text-2xl font-semibold text-zinc-950">
              Welcome back, {session.user.name}
            </h2>
            <div className="space-y-1 text-sm text-zinc-600">
              <p>{session.user.email}</p>
              <p>
                Email verified: {session.user.emailVerified ? "yes" : "no"}
              </p>
            </div>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-900 transition hover:border-zinc-950 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={handleSignOut}
            type="button"
          >
            {isPending ? "Working..." : "Sign out"}
          </button>
        </div>
        {message ? <p className="mt-4 text-sm text-zinc-600">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="w-full rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
      <div className="mb-6 flex gap-2 rounded-full bg-zinc-100 p-1">
        <button
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "sign-in"
              ? "bg-white text-zinc-950 shadow-sm"
              : "text-zinc-500"
          }`}
          onClick={() => setMode("sign-in")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "sign-up"
              ? "bg-white text-zinc-950 shadow-sm"
              : "text-zinc-500"
          }`}
          onClick={() => setMode("sign-up")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "sign-up" ? (
          <label className="block space-y-2 text-sm font-medium text-zinc-700">
            <span>Name</span>
            <input
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-950"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
        ) : null}

        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Email</span>
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-950"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-zinc-700">
          <span>Password</span>
          <input
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-950"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <button
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Working..." : submitLabel}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-sm text-zinc-600">
        <p>Email/password auth is wired to Better Auth and Neon through Drizzle.</p>
        {message ? <p>{message}</p> : null}
      </div>
    </section>
  );
}
