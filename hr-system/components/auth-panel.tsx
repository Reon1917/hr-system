"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AuthPanelProps = {
  bootstrapRequired: boolean;
};

type AuthMode = "sign-in" | "sign-up";

const authModes: Array<{
  id: AuthMode;
  label: string;
  detail: string;
}> = [
  {
    id: "sign-in",
    label: "Sign in",
    detail: "For the current admin account",
  },
  {
    id: "sign-up",
    label: "Create admin",
    detail: "Only used during first setup",
  },
];

export function AuthPanel({ bootstrapRequired }: AuthPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(bootstrapRequired ? "sign-up" : "sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isSignUp = mode === "sign-up";
  const signInAvailable = !bootstrapRequired;
  const signUpAvailable = bootstrapRequired;
  const modeAvailable = isSignUp ? signUpAvailable : signInAvailable;

  const title = isSignUp ? "Create the first admin" : "Welcome back";
  const description = isSignUp
    ? "Finish the one-time bootstrap so the store workspace can switch into normal sign-in mode."
    : "Sign in to manage employees, attendance, leave status, holidays, and payroll in one place.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (isSignUp && !signUpAvailable) {
      setMessage("Initial setup is already complete. Use Sign in instead.");
      return;
    }

    if (!isSignUp && !signInAvailable) {
      setMessage("Create the first admin account before signing in.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      if (isSignUp) {
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
      setConfirmPassword("");
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-xl">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_28px_80px_-50px_rgba(15,23,42,0.35)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-600">
              Admin Access
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
          </div>

          <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
            {bootstrapRequired ? "Setup mode" : "Live access"}
          </div>
        </div>

        <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">{description}</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
          {authModes.map((item) => {
            const active = item.id === mode;
            const available = item.id === "sign-in" ? signInAvailable : signUpAvailable;

            return (
              <button
                key={item.id}
                aria-selected={active}
                className={cn(
                  "rounded-[1rem] px-4 py-4 text-left transition",
                  active ? "bg-slate-950 text-white shadow-sm" : "text-slate-700 hover:bg-white/80",
                )}
                onClick={() => {
                  setMode(item.id);
                  setMessage(null);
                }}
                role="tab"
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className={cn("mt-1 text-xs leading-5", active ? "text-slate-300" : "text-slate-500")}>
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      available
                        ? active
                          ? "bg-white/10 text-emerald-200"
                          : "bg-emerald-100 text-emerald-700"
                        : active
                          ? "bg-white/10 text-slate-300"
                          : "bg-slate-200 text-slate-500",
                    )}
                  >
                    {available ? "Open" : "Locked"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {!modeAvailable ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {isSignUp
              ? "Bootstrap signup is closed because an admin account already exists."
              : "Sign in becomes available after the first admin account is created."}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {isSignUp ? (
            <div className="space-y-2">
              <Label htmlFor="auth-name">Full name</Label>
              <Input
                disabled={!modeAvailable || isPending}
                id="auth-name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Anan Kittisak"
                required={modeAvailable}
                value={name}
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              disabled={isPending}
              id="auth-email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="manager@baanjaistore.test"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              disabled={isPending}
              id="auth-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignUp ? "Create a strong admin password" : "Enter your password"}
              required
              type="password"
              value={password}
            />
          </div>

          {isSignUp ? (
            <div className="space-y-2">
              <Label htmlFor="auth-confirm-password">Confirm password</Label>
              <Input
                disabled={!modeAvailable || isPending}
                id="auth-confirm-password"
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat the password"
                required={modeAvailable}
                type="password"
                value={confirmPassword}
              />
            </div>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {message}
            </div>
          ) : null}

          <Button
            className="mt-2 h-12 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800"
            disabled={isPending || !modeAvailable}
            size="lg"
            type="submit"
          >
            {isPending
              ? "Working..."
              : isSignUp
                ? "Create admin account"
                : "Sign in to dashboard"}
          </Button>
        </form>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.28)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Access Rules
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            One admin bootstraps the workspace first. After that, daily access happens through sign-in only.
          </p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_16px_36px_-34px_rgba(15,23,42,0.28)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Workspace Scope
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Employees, attendance, leave status, holidays, and payroll stay in one lightweight admin flow.
          </p>
        </div>
      </div>
    </div>
  );
}
