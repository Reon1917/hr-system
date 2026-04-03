"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/holidays", label: "Holidays" },
  { href: "/dashboard/payroll", label: "Payroll" },
  { href: "/dashboard/settings", label: "Settings" },
];

type AdminShellProps = {
  user: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-border bg-card lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Staff manager
            </p>
            <h1 className="mt-3 text-lg font-semibold tracking-tight">Admin workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simple operations for staff, attendance, holidays, and payroll.
            </p>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-4 lg:flex-1 lg:flex-col lg:overflow-visible lg:border-b-0">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  className={cn(
                    "inline-flex min-w-max items-center rounded-md border px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden border-t border-border px-6 py-5 lg:block">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge className="mt-4" variant="secondary">
              Admin access
            </Badge>
            <form action={signOutAction} className="mt-5">
              <Button className="w-full" type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-border bg-card px-6 py-4 sm:px-8 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </header>

        <main className="min-w-0 px-6 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
