"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import { auth } from "@/auth";
import { requireAdminSession } from "@/lib/auth/session";
import {
  attendanceEntry,
  companySettings,
  employee,
  employeeCompensationHistory,
  holiday,
  overtimeEntry,
  payrollPeriod,
  payrollPolicyVersion,
  payrollResult,
  payrollRun,
} from "@/db/schema/hr";
import { db } from "@/lib/db";
import {
  buildCurrentCompensationMap,
  getInclusiveDayCount,
  getOverlapDayCount,
  getWorkedHours,
  summarizeAttendanceStatuses,
} from "@/lib/hr/payroll";
import {
  attendanceStatusOptions,
  employeeStatusOptions,
  isOneOf,
  payTypeOptions,
  toDbAttendanceStatus,
} from "@/lib/hr/options";

export type FormState = {
  status: "idle" | "success" | "error";
  message: string;
};

function revalidateAdminPathSegments(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

function optionalText(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

function toDateTime(workDate: string, timeValue: string | null) {
  if (!timeValue) {
    return null;
  }

  return new Date(`${workDate}T${timeValue}:00`);
}

function toPositiveMoneyString(value: string) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return null;
  }

  return numericValue.toFixed(2);
}

function toNonNegativeQuantityString(value: string) {
  const numericValue = Number(value || "0");

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  return numericValue.toFixed(2);
}

function formatMoney(value: number) {
  return value.toFixed(2);
}

function formatQuantity(value: number) {
  return value.toFixed(2);
}

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export async function createEmployeeAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const employeeCode = String(formData.get("employeeCode") ?? "").trim().toUpperCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const phoneNumber = optionalText(formData.get("phoneNumber"));
  const hireDateInput = String(formData.get("hireDate") ?? "").trim();
  const payType = String(formData.get("payType") ?? "").trim();
  const rateValue = String(formData.get("rate") ?? "").trim();
  const overtimeEligible = formData.get("overtimeEligible") === "on";
  const overtimeRateValue = String(formData.get("overtimeRate") ?? "").trim();
  const overtimeMultiplierValue = String(formData.get("overtimeMultiplier") ?? "").trim();
  const paidLeaveQuotaValue = String(formData.get("paidLeaveQuota") ?? "0").trim();
  const sickLeaveQuotaValue = String(formData.get("sickLeaveQuota") ?? "0").trim();
  const hireDate = hireDateInput || new Date().toISOString().slice(0, 10);

  if (!employeeCode || !fullName || !jobTitle) {
    return { status: "error", message: "Employee code, name, and role are required." };
  }

  if (!isOneOf(payTypeOptions, payType)) {
    return { status: "error", message: "Select a valid pay type." };
  }

  const rate = toPositiveMoneyString(rateValue);

  if (!rate) {
    return { status: "error", message: "Enter a valid hourly rate or monthly salary." };
  }

  const paidLeaveQuota = toNonNegativeQuantityString(paidLeaveQuotaValue);
  const sickLeaveQuota = toNonNegativeQuantityString(sickLeaveQuotaValue);

  if (!paidLeaveQuota || !sickLeaveQuota) {
    return { status: "error", message: "Leave quotas must be zero or greater." };
  }

  const overtimeRate = overtimeRateValue ? toPositiveMoneyString(overtimeRateValue) : null;
  const overtimeMultiplier = overtimeMultiplierValue
    ? toPositiveMoneyString(overtimeMultiplierValue)
    : null;

  if (overtimeRateValue && !overtimeRate) {
    return { status: "error", message: "Enter a valid overtime rate." };
  }

  if (overtimeMultiplierValue && !overtimeMultiplier) {
    return { status: "error", message: "Enter a valid overtime multiplier." };
  }

  const [existingEmployee, existingPhone] = await Promise.all([
    db.query.employee.findFirst({
      where: eq(employee.employeeCode, employeeCode),
      columns: { id: true },
    }),
    phoneNumber
      ? db.query.employee.findFirst({
          where: eq(employee.phoneNumber, phoneNumber),
          columns: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (existingEmployee) {
    return { status: "error", message: "That employee code is already in use." };
  }

  if (existingPhone) {
    return { status: "error", message: "That phone number is already in use." };
  }

  const employeeId = crypto.randomUUID();

  await db.insert(employee).values({
    id: employeeId,
    employeeCode,
    fullName,
    phoneNumber,
    status: "active",
    hireDate,
    jobTitle,
    paidLeaveQuota,
    sickLeaveQuota,
  });

  await db.insert(employeeCompensationHistory).values({
    id: crypto.randomUUID(),
    employeeId,
    payType,
    hourlyRate: payType === "hourly" ? rate : null,
    monthlySalary: payType === "monthly" ? rate : null,
    overtimeEligible,
    overtimeRateMode: !overtimeEligible
      ? null
      : overtimeRate
        ? "flat_rate"
        : "multiplier",
    overtimeRate: overtimeEligible ? overtimeRate : null,
    overtimeMultiplier: overtimeEligible ? overtimeMultiplier ?? "1.50" : null,
    effectiveFrom: hireDate,
    createdByUserId: session.user.id,
    changeReason: "Initial pay setup",
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/employees",
    "/dashboard/attendance",
    "/dashboard/payroll",
  ]);

  return { status: "success", message: "Employee created." };
}

export async function toggleEmployeeStatusAction(
  employeeId: string,
  nextStatus: string,
) {
  await requireAdminSession();

  if (!employeeId || !isOneOf(employeeStatusOptions, nextStatus)) {
    return;
  }

  await db
    .update(employee)
    .set({
      status: nextStatus,
      updatedAt: new Date(),
    })
    .where(eq(employee.id, employeeId));

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/employees",
    "/dashboard/attendance",
    "/dashboard/payroll",
  ]);
}

export async function createAttendanceAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const employeeId = String(formData.get("employeeId") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const clockInTime = optionalText(formData.get("clockInTime"));
  const clockOutTime = optionalText(formData.get("clockOutTime"));
  const remarks = optionalText(formData.get("remarks"));
  const breakMinutesValue = String(formData.get("breakMinutes") ?? "0").trim();
  const overtimeHoursValue = String(formData.get("overtimeHours") ?? "0").trim();
  const breakMinutes = Number(breakMinutesValue || "0");
  const overtimeHours = Number(overtimeHoursValue || "0");

  if (!employeeId || !workDate) {
    return { status: "error", message: "Employee and work date are required." };
  }

  if (!isOneOf(attendanceStatusOptions, status)) {
    return { status: "error", message: "Select a valid attendance status." };
  }

  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    return { status: "error", message: "Break minutes must be zero or greater." };
  }

  if (!Number.isFinite(overtimeHours) || overtimeHours < 0) {
    return { status: "error", message: "Overtime hours must be zero or greater." };
  }

  if (status !== "worked" && overtimeHours > 0) {
    return { status: "error", message: "Overtime can only be recorded on worked days." };
  }

  const currentEmployee = await db.query.employee.findFirst({
    where: eq(employee.id, employeeId),
    columns: { id: true },
  });

  if (!currentEmployee) {
    return { status: "error", message: "Select a valid employee." };
  }

  const actualClockInAt = status === "worked" ? toDateTime(workDate, clockInTime) : null;
  const actualClockOutAt = status === "worked" ? toDateTime(workDate, clockOutTime) : null;

  if (
    actualClockInAt &&
    actualClockOutAt &&
    actualClockOutAt.getTime() <= actualClockInAt.getTime()
  ) {
    return {
      status: "error",
      message: "End time must be later than the start time for a worked day.",
    };
  }

  if (actualClockInAt && actualClockOutAt) {
    const workedMinutes = Math.floor(
      (actualClockOutAt.getTime() - actualClockInAt.getTime()) / 60000,
    );

    if (workedMinutes <= 0 || breakMinutes >= workedMinutes) {
      return {
        status: "error",
        message: "Break duration must be shorter than the worked time.",
      };
    }
  }

  const dbStatus = toDbAttendanceStatus(status);
  const existingEntry = await db.query.attendanceEntry.findFirst({
    where: and(
      eq(attendanceEntry.employeeId, employeeId),
      eq(attendanceEntry.workDate, workDate),
      eq(attendanceEntry.segmentIndex, 0),
    ),
    columns: { id: true },
  });

  const attendanceEntryId = existingEntry?.id ?? crypto.randomUUID();

  if (existingEntry) {
    await db
      .update(attendanceEntry)
      .set({
        actualClockInAt,
        actualClockOutAt,
        breakMinutes: status === "worked" ? breakMinutes : 0,
        status: dbStatus,
        approvalStatus: "approved",
        source: "admin",
        shiftLabel: null,
        remarks,
        updatedAt: new Date(),
      })
      .where(eq(attendanceEntry.id, attendanceEntryId));
  } else {
    await db.insert(attendanceEntry).values({
      id: attendanceEntryId,
      employeeId,
      workDate,
      segmentIndex: 0,
      shiftLabel: null,
      actualClockInAt,
      actualClockOutAt,
      breakMinutes: status === "worked" ? breakMinutes : 0,
      status: dbStatus,
      approvalStatus: "approved",
      source: "admin",
      remarks,
      createdByUserId: session.user.id,
    });
  }

  await db.delete(overtimeEntry).where(eq(overtimeEntry.attendanceEntryId, attendanceEntryId));

  if (overtimeHours > 0) {
    const overtimeMinutes = Math.round(overtimeHours * 60);

    await db.insert(overtimeEntry).values({
      id: crypto.randomUUID(),
      employeeId,
      attendanceEntryId,
      workDate,
      requestedMinutes: overtimeMinutes,
      approvedMinutes: overtimeMinutes,
      status: "approved",
      remarks,
    });
  }

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/attendance",
    "/dashboard/employees",
    "/dashboard/payroll",
  ]);

  return {
    status: "success",
    message: existingEntry ? "Attendance updated." : "Attendance saved.",
  };
}

export async function saveHolidayAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const holidayDate = String(formData.get("holidayDate") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!holidayDate || !name) {
    return { status: "error", message: "Holiday name and date are required." };
  }

  const existingHoliday = await db.query.holiday.findFirst({
    where: eq(holiday.holidayDate, holidayDate),
    columns: { id: true },
  });

  if (existingHoliday) {
    await db
      .update(holiday)
      .set({
        name,
        updatedAt: new Date(),
      })
      .where(eq(holiday.id, existingHoliday.id));
  } else {
    await db.insert(holiday).values({
      id: crypto.randomUUID(),
      holidayDate,
      name,
      type: "public",
      businessClosed: true,
      workAllowed: false,
      isPaidHoliday: true,
    });
  }

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/attendance",
    "/dashboard/holidays",
    "/dashboard/payroll",
  ]);

  return {
    status: "success",
    message: existingHoliday ? "Holiday updated." : "Holiday saved.",
  };
}

export async function calculatePayrollAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();

  if (!startDate || !endDate) {
    return { status: "error", message: "Payroll start and end dates are required." };
  }

  if (startDate > endDate) {
    return { status: "error", message: "Payroll start date cannot be after the end date." };
  }

  const [selectedPolicy, existingPeriod] = await Promise.all([
    db.query.payrollPolicyVersion.findFirst({
      columns: {
        id: true,
        paidLeavePayable: true,
        sickLeavePayable: true,
        holidaysPaid: true,
        overtimeMultiplierDefault: true,
        defaultWorkMinutesPerDay: true,
      },
      orderBy: (fields, operators) => [operators.desc(fields.effectiveFrom)],
    }),
    db.query.payrollPeriod.findFirst({
      where: and(eq(payrollPeriod.startDate, startDate), eq(payrollPeriod.endDate, endDate)),
      columns: { id: true },
    }),
  ]);

  if (!selectedPolicy) {
    return { status: "error", message: "No payroll policy is configured." };
  }

  const now = new Date();
  const payrollPeriodId = existingPeriod?.id ?? crypto.randomUUID();

  if (existingPeriod) {
    await db
      .update(payrollPeriod)
      .set({
        frequency: "monthly",
        status: "finalized",
        finalizedAt: now,
        updatedAt: now,
      })
      .where(eq(payrollPeriod.id, payrollPeriodId));
  } else {
    await db.insert(payrollPeriod).values({
      id: payrollPeriodId,
      startDate,
      endDate,
      frequency: "monthly",
      status: "finalized",
      finalizedAt: now,
      createdByUserId: session.user.id,
    });
  }

  const existingRun = await db.query.payrollRun.findFirst({
    where: eq(payrollRun.payrollPeriodId, payrollPeriodId),
    columns: { id: true },
    orderBy: (fields, operators) => [operators.desc(fields.runNumber)],
  });

  const payrollRunId = existingRun?.id ?? crypto.randomUUID();

  if (existingRun) {
    await db
      .update(payrollRun)
      .set({
        payrollPolicyVersionId: selectedPolicy.id,
        status: "calculated",
        notes: "Latest payroll calculation.",
        calculatedAt: now,
        triggeredByUserId: session.user.id,
        updatedAt: now,
      })
      .where(eq(payrollRun.id, payrollRunId));
  } else {
    await db.insert(payrollRun).values({
      id: payrollRunId,
      payrollPeriodId,
      payrollPolicyVersionId: selectedPolicy.id,
      runNumber: 1,
      status: "calculated",
      notes: "Latest payroll calculation.",
      calculatedAt: now,
      triggeredByUserId: session.user.id,
    });
  }

  await db.delete(payrollResult).where(eq(payrollResult.payrollRunId, payrollRunId));

  const [employees, compensationHistory, attendanceEntries, overtimeRows] = await Promise.all([
    db
      .select({
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        status: employee.status,
        hireDate: employee.hireDate,
        endDate: employee.endDate,
      })
      .from(employee)
      .orderBy(employee.fullName),
    db
      .select({
        employeeId: employeeCompensationHistory.employeeId,
        payType: employeeCompensationHistory.payType,
        hourlyRate: employeeCompensationHistory.hourlyRate,
        monthlySalary: employeeCompensationHistory.monthlySalary,
        overtimeEligible: employeeCompensationHistory.overtimeEligible,
        overtimeRateMode: employeeCompensationHistory.overtimeRateMode,
        overtimeRate: employeeCompensationHistory.overtimeRate,
        overtimeMultiplier: employeeCompensationHistory.overtimeMultiplier,
        effectiveFrom: employeeCompensationHistory.effectiveFrom,
      })
      .from(employeeCompensationHistory)
      .orderBy(
        desc(employeeCompensationHistory.effectiveFrom),
        desc(employeeCompensationHistory.createdAt),
      ),
    db
      .select({
        id: attendanceEntry.id,
        employeeId: attendanceEntry.employeeId,
        workDate: attendanceEntry.workDate,
        status: attendanceEntry.status,
        actualClockInAt: attendanceEntry.actualClockInAt,
        actualClockOutAt: attendanceEntry.actualClockOutAt,
        breakMinutes: attendanceEntry.breakMinutes,
      })
      .from(attendanceEntry)
      .where(and(gte(attendanceEntry.workDate, startDate), lte(attendanceEntry.workDate, endDate))),
    db
      .select({
        employeeId: overtimeEntry.employeeId,
        approvedMinutes: overtimeEntry.approvedMinutes,
      })
      .from(overtimeEntry)
      .where(and(gte(overtimeEntry.workDate, startDate), lte(overtimeEntry.workDate, endDate))),
  ]);

  const currentCompensationByEmployee = buildCurrentCompensationMap(compensationHistory, endDate);
  const attendanceByEmployee = new Map<string, typeof attendanceEntries>();
  const overtimeHoursByEmployee = new Map<string, number>();

  for (const entry of attendanceEntries) {
    const entries = attendanceByEmployee.get(entry.employeeId) ?? [];
    entries.push(entry);
    attendanceByEmployee.set(entry.employeeId, entries);
  }

  for (const row of overtimeRows) {
    overtimeHoursByEmployee.set(
      row.employeeId,
      (overtimeHoursByEmployee.get(row.employeeId) ?? 0) + row.approvedMinutes / 60,
    );
  }

  const periodDays = getInclusiveDayCount(startDate, endDate);
  const standardHoursPerDay = selectedPolicy.defaultWorkMinutesPerDay / 60;
  const resultRows = [];

  for (const currentEmployee of employees) {
    const overlapDays = getOverlapDayCount(
      startDate,
      endDate,
      currentEmployee.hireDate,
      currentEmployee.endDate,
    );
    const employeeEntries = attendanceByEmployee.get(currentEmployee.id) ?? [];

    if (!overlapDays && !employeeEntries.length) {
      continue;
    }

    const compensation = currentCompensationByEmployee.get(currentEmployee.id);

    if (!compensation) {
      continue;
    }

    const attendanceSummary = summarizeAttendanceStatuses(employeeEntries);
    const workedHours = employeeEntries.reduce(
      (total, entry) => total + getWorkedHours(entry),
      0,
    );
    const overtimeHours = overtimeHoursByEmployee.get(currentEmployee.id) ?? 0;

    let regularPay = 0;
    let paidLeavePay = 0;
    let sickLeavePay = 0;
    let holidayPay = 0;
    let deductionsTotal = 0;

    if (compensation.payType === "hourly") {
      const hourlyRate = Number(compensation.hourlyRate ?? "0");
      regularPay = workedHours * hourlyRate;
      paidLeavePay = selectedPolicy.paidLeavePayable
        ? attendanceSummary.paid_leave * standardHoursPerDay * hourlyRate
        : 0;
      sickLeavePay = selectedPolicy.sickLeavePayable
        ? attendanceSummary.sick_leave * standardHoursPerDay * hourlyRate
        : 0;
      holidayPay = selectedPolicy.holidaysPaid
        ? attendanceSummary.holiday * standardHoursPerDay * hourlyRate
        : 0;
    } else {
      const monthlySalary = Number(compensation.monthlySalary ?? "0");
      const proratedSalary = monthlySalary * (overlapDays / periodDays);
      const dailyRate = monthlySalary / periodDays;

      regularPay = proratedSalary;
      deductionsTotal = dailyRate * (attendanceSummary.unpaid_leave + attendanceSummary.absent);
    }

    let overtimePay = 0;

    if (compensation.overtimeEligible && overtimeHours > 0) {
      if (compensation.overtimeRateMode === "flat_rate" && compensation.overtimeRate) {
        overtimePay = overtimeHours * Number(compensation.overtimeRate);
      } else {
        const baseHourlyRate =
          compensation.payType === "hourly"
            ? Number(compensation.hourlyRate ?? "0")
            : Number(compensation.monthlySalary ?? "0") / (periodDays * standardHoursPerDay);
        const multiplier = Number(
          compensation.overtimeMultiplier ?? selectedPolicy.overtimeMultiplierDefault,
        );
        overtimePay = overtimeHours * baseHourlyRate * multiplier;
      }
    }

    const netPay = Math.max(
      0,
      regularPay + paidLeavePay + sickLeavePay + holidayPay + overtimePay - deductionsTotal,
    );
    const payableHours =
      workedHours +
      (selectedPolicy.paidLeavePayable ? attendanceSummary.paid_leave * standardHoursPerDay : 0) +
      (selectedPolicy.sickLeavePayable ? attendanceSummary.sick_leave * standardHoursPerDay : 0) +
      (selectedPolicy.holidaysPaid ? attendanceSummary.holiday * standardHoursPerDay : 0);

    resultRows.push({
      id: crypto.randomUUID(),
      payrollRunId,
      employeeId: currentEmployee.id,
      payableMinutes: Math.round(payableHours * 60),
      overtimeMinutes: Math.round(overtimeHours * 60),
      unpaidLeaveUnits: formatQuantity(attendanceSummary.unpaid_leave),
      regularPay: formatMoney(regularPay),
      overtimePay: formatMoney(overtimePay),
      paidLeavePay: formatMoney(paidLeavePay),
      sickLeavePay: formatMoney(sickLeavePay),
      holidayPay: formatMoney(holidayPay),
      deductionsTotal: formatMoney(deductionsTotal),
      adjustmentsTotal: "0.00",
      netPay: formatMoney(netPay),
      snapshotJson: {
        employeeCode: currentEmployee.employeeCode,
        employeeName: currentEmployee.fullName,
        payType: compensation.payType,
        activeDays: overlapDays,
        workedDays: attendanceSummary.worked,
        leaveDays:
          attendanceSummary.paid_leave +
          attendanceSummary.sick_leave +
          attendanceSummary.unpaid_leave,
        absentDays: attendanceSummary.absent,
        holidayDays: attendanceSummary.holiday,
        workedHours: Number(workedHours.toFixed(2)),
        overtimeHours: Number(overtimeHours.toFixed(2)),
      },
    });
  }

  if (resultRows.length) {
    await db.insert(payrollResult).values(resultRows);
  }

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/payroll",
    "/dashboard/employees",
  ]);

  return {
    status: "success",
    message: `Payroll calculated for ${resultRows.length} employee${resultRows.length === 1 ? "" : "s"}.`,
  };
}

export async function updateBusinessSettingsAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminSession();

  const businessName = String(formData.get("businessName") ?? "").trim();
  const currencyCode = String(formData.get("currencyCode") ?? "").trim().toUpperCase();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const workHoursValue = String(formData.get("defaultWorkHoursPerDay") ?? "").trim();
  const overtimeMultiplierValue = String(formData.get("defaultOvertimeMultiplier") ?? "").trim();
  const paidLeavePayable = formData.get("paidLeavePayable") === "on";
  const sickLeavePayable = formData.get("sickLeavePayable") === "on";
  const holidaysPaid = formData.get("holidaysPaid") === "on";
  const workHours = Number(workHoursValue);
  const overtimeMultiplier = Number(overtimeMultiplierValue);

  if (!businessName || !currencyCode || !timezone) {
    return { status: "error", message: "Business name, currency, and timezone are required." };
  }

  if (!Number.isFinite(workHours) || workHours <= 0) {
    return { status: "error", message: "Enter valid default work hours per day." };
  }

  if (!Number.isFinite(overtimeMultiplier) || overtimeMultiplier <= 0) {
    return { status: "error", message: "Enter a valid default overtime multiplier." };
  }

  const selectedPolicy = await db.query.payrollPolicyVersion.findFirst({
    columns: { id: true },
    orderBy: (fields, operators) => [operators.desc(fields.effectiveFrom)],
  });

  if (!selectedPolicy) {
    return { status: "error", message: "No payroll policy is configured." };
  }

  await db
    .update(companySettings)
    .set({
      businessName,
      currencyCode,
      timezone,
      updatedAt: new Date(),
    })
    .where(eq(companySettings.id, "main"));

  await db
    .update(payrollPolicyVersion)
    .set({
      payrollFrequency: "monthly",
      overtimeMultiplierDefault: overtimeMultiplier.toFixed(2),
      paidLeavePayable,
      sickLeavePayable,
      holidaysPaid,
      defaultWorkMinutesPerDay: Math.round(workHours * 60),
      monthlyDeductionMethod: "calendar_days",
      updatedAt: new Date(),
    })
    .where(eq(payrollPolicyVersion.id, selectedPolicy.id));

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/payroll",
  ]);

  return { status: "success", message: "Settings updated." };
}
