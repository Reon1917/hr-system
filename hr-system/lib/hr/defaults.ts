import { eq } from "drizzle-orm";
import {
  companySettings,
  leaveType,
  payrollPolicyVersion,
  workSchedule,
} from "@/db/schema/hr";
import { db } from "@/lib/db";
import { defaultCompanyLocalePreset } from "@/lib/hr/settings";

const defaultLeaveTypes = [
  {
    id: "leave-paid",
    code: "PAID",
    name: "Paid Leave",
    payable: true,
    consumesBalance: true,
    supportsHalfDay: true,
  },
  {
    id: "leave-sick",
    code: "SICK",
    name: "Sick Leave",
    payable: true,
    consumesBalance: true,
    supportsHalfDay: true,
  },
  {
    id: "leave-unpaid",
    code: "UNPAID",
    name: "Unpaid Leave",
    payable: false,
    consumesBalance: false,
    supportsHalfDay: true,
  },
];

export async function ensureBusinessDefaults() {
  const [settings, paidLeave, policy, schedule] = await Promise.all([
    db.query.companySettings.findFirst({
      where: eq(companySettings.id, "main"),
      columns: { id: true },
    }),
    db.query.leaveType.findFirst({
      where: eq(leaveType.code, "PAID"),
      columns: { id: true },
    }),
    db.query.payrollPolicyVersion.findFirst({
      where: eq(payrollPolicyVersion.id, "policy-default"),
      columns: { id: true },
    }),
    db.query.workSchedule.findFirst({
      where: eq(workSchedule.id, "schedule-standard"),
      columns: { id: true },
    }),
  ]);

  if (!settings) {
    await db.insert(companySettings).values({
      id: "main",
      businessName: "HR System",
      timezone: defaultCompanyLocalePreset.timezone,
      currencyCode: defaultCompanyLocalePreset.currencyCode,
      weekStartsOn: 1,
    });
  }

  if (!paidLeave) {
    await db.insert(leaveType).values(defaultLeaveTypes);
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
      holidayWorkMultiplier: "2.00",
      lateGraceMinutes: 10,
      unpaidBreakRequired: true,
      defaultWorkMinutesPerDay: 480,
      monthlyDeductionMethod: "scheduled_days",
      notes: "Default company payroll policy.",
    });
  }

  if (!schedule) {
    await db.insert(workSchedule).values({
      id: "schedule-standard",
      name: "Standard Work Week",
      description: "Default Monday to Friday schedule.",
      workDays: [1, 2, 3, 4, 5],
      plannedStartTime: "09:00:00",
      plannedEndTime: "18:00:00",
      defaultBreakMinutes: 60,
      isDefault: true,
    });
  }
}
