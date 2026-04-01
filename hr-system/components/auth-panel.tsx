"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthPanelProps = {
  bootstrapRequired: boolean;
};

export function AuthPanel({ bootstrapRequired }: AuthPanelProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (bootstrapRequired && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      if (bootstrapRequired) {
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
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {bootstrapRequired ? "Initial system setup" : "Admin sign in"}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {bootstrapRequired ? "Create the first admin account" : "Access the HR workspace"}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
          {bootstrapRequired
            ? "This one-time step creates the first admin and unlocks the rest of the system. Future admin provisioning will happen inside the application."
            : "Use your admin email and password to access employee, attendance, leave, and payroll operations."}
        </p>
      </div>

      <form className="space-y-5 px-8 py-8" onSubmit={handleSubmit}>
        {bootstrapRequired ? (
          <div className="space-y-2">
            <Label htmlFor="auth-name">Full name</Label>
            <Input
              id="auth-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Maya Collins"
              required
              value={name}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@company.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
            required
            type="password"
            value={password}
          />
        </div>

        {bootstrapRequired ? (
          <div className="space-y-2">
            <Label htmlFor="auth-confirm-password">Confirm password</Label>
            <Input
              id="auth-confirm-password"
              minLength={8}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the password"
              required
              type="password"
              value={confirmPassword}
            />
          </div>
        ) : null}

        {message ? (
          <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        ) : null}

        <Button className="h-11 w-full" disabled={isPending} size="lg" type="submit">
          {isPending
            ? "Working..."
            : bootstrapRequired
              ? "Create admin account"
              : "Sign in"}
        </Button>
      </form>
    </section>
  );
}
