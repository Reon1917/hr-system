import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { user } from "@/db/schema/auth";
import { db } from "@/lib/db";

export type AdminSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export async function isAdminBootstrapRequired() {
  const existingAdmin = await db.query.user.findFirst({
    where: eq(user.role, "admin"),
    columns: { id: true },
  });

  return !existingAdmin;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin" || session.user.isActive === false) {
    return null;
  }

  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/");
  }

  return session;
}
