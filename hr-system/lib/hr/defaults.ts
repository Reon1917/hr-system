import { eq } from "drizzle-orm";
import { companySettings, payrollPolicyVersion } from "@/db/schema/hr";
import { db } from "@/lib/db";

export async function ensureBusinessDefaults() {
  const [settings, policy] = await Promise.all([
    db.query.companySettings.findFirst({
      where: eq(companySettings.id, "main"),
      columns: { id: true },
    }),
    db.query.payrollPolicyVersion.findFirst({
      where: eq(payrollPolicyVersion.id, "policy-default"),
      columns: { id: true },
    }),
  ]);

  if (!settings) {
    await db.insert(companySettings).values({
      id: "main",
      businessName: "Staff Manager",
      timezone: "Asia/Bangkok",
      currencyCode: "THB",
      weekStartsOn: 1,
    });
  }

  if (!policy) {
    await db.insert(payrollPolicyVersion).values({
      id: "policy-default",
      effectiveFrom: "2026-01-01",
      payrollFrequency: "monthly",
      overtimeMultiplierDefault: "1.50",
      paidLeavePayable: true,
      sickLeavePayable: true,
      holidaysPaid: true,
      holidayWorkMultiplier: "1.00",
      lateGraceMinutes: 0,
      unpaidBreakRequired: true,
      defaultWorkMinutesPerDay: 480,
      monthlyDeductionMethod: "calendar_days",
      notes: "Default lightweight payroll policy.",
    });
  }
}
