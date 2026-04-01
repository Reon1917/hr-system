import { AdminShell } from "@/components/dashboard/admin-shell";
import { requireAdminSession } from "@/lib/auth/session";
import { ensureBusinessDefaults } from "@/lib/hr/defaults";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAdminSession();

  await ensureBusinessDefaults();

  return (
    <AdminShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
