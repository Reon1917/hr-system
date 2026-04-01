"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { requireAdminSession } from "@/lib/auth/session";
import {
  attendanceEntry,
  companySettings,
  department,
  employee,
  employeeCompensationHistory,
  leaveBalanceLedger,
  leaveRequest,
  leaveType,
  payrollPeriod,
  payrollRun,
} from "@/db/schema/hr";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/hr/audit";
import {
  attendanceStatusOptions,
  isOneOf,
  leavePortionOptions,
  leaveRequestStatusOptions,
  payTypeOptions,
  payrollFrequencyOptions,
} from "@/lib/hr/options";
import {
  getCompanyLocalePresetById,
  isCompanyLocalePresetId,
} from "@/lib/hr/settings";

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

export async function signOutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/");
}

export async function createDepartmentAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!code || !name) {
    return { status: "error", message: "Department code and name are required." };
  }

  const existingDepartment = await db.query.department.findFirst({
    where: eq(department.code, code),
    columns: { id: true },
  });

  if (existingDepartment) {
    return { status: "error", message: "That department code already exists." };
  }

  await db.insert(department).values({
    id: crypto.randomUUID(),
    code,
    name,
    isActive: true,
  });

  const createdDepartment = await db.query.department.findFirst({
    where: eq(department.code, code),
    columns: { id: true, code: true, name: true },
  });

  if (createdDepartment) {
    await writeAuditLog({
      actorUserId: session.user.id,
      entityType: "department",
      entityId: createdDepartment.id,
      action: "department.create",
      afterJson: createdDepartment,
    });
  }

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/employees",
  ]);

  return { status: "success", message: "Department created." };
}

export async function createEmployeeAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const employeeCode = String(formData.get("employeeCode") ?? "").trim().toUpperCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const hireDate = String(formData.get("hireDate") ?? "").trim();
  const departmentId = String(formData.get("departmentId") ?? "").trim() || null;
  const payType = String(formData.get("payType") ?? "").trim();
  const rateValue = String(formData.get("rate") ?? "").trim();
  const overtimeEligible = formData.get("overtimeEligible") === "on";

  if (!employeeCode || !fullName || !jobTitle || !hireDate) {
    return { status: "error", message: "Employee code, name, title, and hire date are required." };
  }

  if (!isOneOf(payTypeOptions, payType)) {
    return { status: "error", message: "Select a valid pay type." };
  }

  const rateNumber = Number(rateValue);

  if (!Number.isFinite(rateNumber) || rateNumber <= 0) {
    return { status: "error", message: "Enter a valid compensation amount." };
  }

  const existingEmployee = await db.query.employee.findFirst({
    where: eq(employee.employeeCode, employeeCode),
    columns: { id: true },
  });

  if (existingEmployee) {
    return { status: "error", message: "That employee code is already in use." };
  }

  const employeeId = crypto.randomUUID();

  await db.insert(employee).values({
    id: employeeId,
    employeeCode,
    fullName,
    status: "active",
    hireDate,
    departmentId,
    jobTitle,
  });

  await db.insert(employeeCompensationHistory).values({
    id: crypto.randomUUID(),
    employeeId,
    payType,
    hourlyRate: payType === "hourly" ? rateValue : null,
    monthlySalary: payType === "monthly" ? rateValue : null,
    overtimeEligible,
    overtimeRateMode: overtimeEligible ? "multiplier" : null,
    overtimeMultiplier: overtimeEligible ? "1.50" : null,
    effectiveFrom: hireDate,
    createdByUserId: session.user.id,
    changeReason: "Initial compensation setup",
  });

  await writeAuditLog({
    actorUserId: session.user.id,
    entityType: "employee",
    entityId: employeeId,
    action: "employee.create",
    reason: "Initial employee setup",
    afterJson: {
      employeeCode,
      fullName,
      status: "active",
      hireDate,
      departmentId,
      jobTitle,
      payType,
      rateValue,
      overtimeEligible,
    },
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/employees",
    "/dashboard/attendance",
    "/dashboard/leave",
  ]);

  return { status: "success", message: "Employee created." };
}

export async function createAttendanceAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const employeeId = String(formData.get("employeeId") ?? "").trim();
  const workDate = String(formData.get("workDate") ?? "").trim();
  const shiftLabel = optionalText(formData.get("shiftLabel"));
  const status = String(formData.get("status") ?? "").trim();
  const clockInTime = optionalText(formData.get("clockInTime"));
  const clockOutTime = optionalText(formData.get("clockOutTime"));
  const remarks = optionalText(formData.get("remarks"));
  const breakMinutesValue = String(formData.get("breakMinutes") ?? "0").trim();
  const breakMinutes = Number(breakMinutesValue || "0");

  if (!employeeId || !workDate) {
    return { status: "error", message: "Employee and work date are required." };
  }

  if (!isOneOf(attendanceStatusOptions, status)) {
    return { status: "error", message: "Select a valid attendance status." };
  }

  if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
    return { status: "error", message: "Break minutes must be zero or greater." };
  }

  const currentEmployee = await db.query.employee.findFirst({
    where: eq(employee.id, employeeId),
    columns: { id: true, fullName: true, employeeCode: true },
  });

  if (!currentEmployee) {
    return { status: "error", message: "Select a valid employee." };
  }

  const actualClockInAt = toDateTime(workDate, clockInTime);
  let actualClockOutAt = toDateTime(workDate, clockOutTime);

  if (actualClockInAt && actualClockOutAt && actualClockOutAt <= actualClockInAt) {
    actualClockOutAt = new Date(actualClockOutAt.getTime() + 24 * 60 * 60 * 1000);
  }

  if (actualClockInAt && actualClockOutAt) {
    const workedMinutes = Math.floor((actualClockOutAt.getTime() - actualClockInAt.getTime()) / 60000);

    if (workedMinutes <= 0 || breakMinutes >= workedMinutes) {
      return {
        status: "error",
        message: "Break duration must be shorter than the recorded shift duration.",
      };
    }
  }

  const latestSegment = await db.query.attendanceEntry.findFirst({
    where: and(
      eq(attendanceEntry.employeeId, employeeId),
      eq(attendanceEntry.workDate, workDate),
    ),
    columns: { segmentIndex: true },
    orderBy: (fields, operators) => [operators.desc(fields.segmentIndex)],
  });

  const entryId = crypto.randomUUID();
  const segmentIndex = (latestSegment?.segmentIndex ?? -1) + 1;

  await db.insert(attendanceEntry).values({
    id: entryId,
    employeeId,
    workDate,
    segmentIndex,
    shiftLabel,
    actualClockInAt,
    actualClockOutAt,
    breakMinutes,
    status,
    approvalStatus: "approved",
    source: "admin",
    remarks,
    createdByUserId: session.user.id,
  });

  await writeAuditLog({
    actorUserId: session.user.id,
    entityType: "attendance_entry",
    entityId: entryId,
    action: "attendance.create",
    afterJson: {
      employeeId,
      employeeCode: currentEmployee.employeeCode,
      workDate,
      segmentIndex,
      status,
      clockInTime,
      clockOutTime,
      breakMinutes,
      remarks,
    },
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/attendance",
  ]);

  return { status: "success", message: "Attendance entry recorded." };
}

export async function createLeaveRequestAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const employeeId = String(formData.get("employeeId") ?? "").trim();
  const leaveTypeId = String(formData.get("leaveTypeId") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const startPortion = String(formData.get("startPortion") ?? "full_day").trim();
  const endPortion = String(formData.get("endPortion") ?? "full_day").trim();
  const status = String(formData.get("status") ?? "pending").trim();
  const requestedUnitsValue = String(formData.get("requestedUnits") ?? "").trim();
  const requestedReason = optionalText(formData.get("requestedReason"));

  if (!employeeId || !leaveTypeId || !startDate || !endDate) {
    return { status: "error", message: "Employee, leave type, and dates are required." };
  }

  if (startDate > endDate) {
    return { status: "error", message: "Leave start date cannot be after the end date." };
  }

  if (!isOneOf(leavePortionOptions, startPortion) || !isOneOf(leavePortionOptions, endPortion)) {
    return { status: "error", message: "Select valid leave portions." };
  }

  if (!isOneOf(leaveRequestStatusOptions, status)) {
    return { status: "error", message: "Select a valid leave status." };
  }

  const requestedUnits = Number(requestedUnitsValue);

  if (!Number.isFinite(requestedUnits) || requestedUnits <= 0) {
    return { status: "error", message: "Requested units must be greater than zero." };
  }

  const [currentEmployee, selectedLeaveType] = await Promise.all([
    db.query.employee.findFirst({
      where: eq(employee.id, employeeId),
      columns: { id: true, fullName: true, employeeCode: true },
    }),
    db.query.leaveType.findFirst({
      where: eq(leaveType.id, leaveTypeId),
      columns: { id: true, name: true, code: true, consumesBalance: true },
    }),
  ]);

  if (!currentEmployee || !selectedLeaveType) {
    return { status: "error", message: "Select a valid employee and leave type." };
  }

  const leaveRequestId = crypto.randomUUID();
  const approvedUnits = status === "approved" ? requestedUnitsValue : null;
  const approvedByUserId = status === "approved" || status === "rejected" ? session.user.id : null;

  await db.insert(leaveRequest).values({
    id: leaveRequestId,
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    startPortion,
    endPortion,
    requestedUnits: requestedUnitsValue,
    approvedUnits,
    status,
    requestedReason,
    requestedByUserId: session.user.id,
    approvedByUserId,
  });

  if (status === "approved" && selectedLeaveType.consumesBalance) {
    await db.insert(leaveBalanceLedger).values({
      id: crypto.randomUUID(),
      employeeId,
      leaveTypeId,
      entryType: "usage",
      unitsDelta: `-${requestedUnitsValue}`,
      effectiveDate: startDate,
      referenceType: "leave_request",
      referenceId: leaveRequestId,
      reason: requestedReason,
      createdByUserId: session.user.id,
    });
  }

  await writeAuditLog({
    actorUserId: session.user.id,
    entityType: "leave_request",
    entityId: leaveRequestId,
    action: "leave.create",
    reason: requestedReason,
    afterJson: {
      employeeId,
      employeeCode: currentEmployee.employeeCode,
      leaveTypeId,
      leaveTypeCode: selectedLeaveType.code,
      startDate,
      endDate,
      startPortion,
      endPortion,
      requestedUnits: requestedUnitsValue,
      status,
    },
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/leave",
  ]);

  return { status: "success", message: "Leave request saved." };
}

export async function createPayrollPeriodAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();

  const startDate = String(formData.get("startDate") ?? "").trim();
  const endDate = String(formData.get("endDate") ?? "").trim();
  const frequency = String(formData.get("frequency") ?? "").trim();

  if (!startDate || !endDate) {
    return { status: "error", message: "Payroll start and end dates are required." };
  }

  if (startDate > endDate) {
    return { status: "error", message: "Payroll start date cannot be after the end date." };
  }

  if (!isOneOf(payrollFrequencyOptions, frequency)) {
    return { status: "error", message: "Select a valid payroll frequency." };
  }

  const [existingPeriod, selectedPolicy] = await Promise.all([
    db.query.payrollPeriod.findFirst({
      where: and(eq(payrollPeriod.startDate, startDate), eq(payrollPeriod.endDate, endDate)),
      columns: { id: true },
    }),
    db.query.payrollPolicyVersion.findFirst({
      columns: { id: true },
      orderBy: (fields, operators) => [operators.desc(fields.effectiveFrom)],
    }),
  ]);

  if (existingPeriod) {
    return { status: "error", message: "That payroll period already exists." };
  }

  if (!selectedPolicy) {
    return { status: "error", message: "No payroll policy is configured." };
  }

  const payrollPeriodId = crypto.randomUUID();
  const payrollRunId = crypto.randomUUID();

  await db.insert(payrollPeriod).values({
    id: payrollPeriodId,
    startDate,
    endDate,
    frequency,
    status: "draft",
    createdByUserId: session.user.id,
  });

  await db.insert(payrollRun).values({
    id: payrollRunId,
    payrollPeriodId,
    payrollPolicyVersionId: selectedPolicy.id,
    runNumber: 1,
    status: "draft",
    triggeredByUserId: session.user.id,
    notes: "Initial draft payroll run.",
  });

  await writeAuditLog({
    actorUserId: session.user.id,
    entityType: "payroll_period",
    entityId: payrollPeriodId,
    action: "payroll_period.create",
    afterJson: {
      startDate,
      endDate,
      frequency,
      payrollRunId,
      payrollPolicyVersionId: selectedPolicy.id,
    },
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/payroll",
  ]);

  return { status: "success", message: "Payroll period created." };
}

export async function updateCompanyLocaleAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireAdminSession();
  const presetId = String(formData.get("presetId") ?? "").trim();

  if (!isCompanyLocalePresetId(presetId)) {
    return { status: "error", message: "Select a valid currency and timezone preset." };
  }

  const preset = getCompanyLocalePresetById(presetId);
  const currentSettings = await db.query.companySettings.findFirst({
    where: eq(companySettings.id, "main"),
    columns: {
      id: true,
      currencyCode: true,
      timezone: true,
    },
  });

  await db
    .update(companySettings)
    .set({
      currencyCode: preset.currencyCode,
      timezone: preset.timezone,
      updatedAt: new Date(),
    })
    .where(eq(companySettings.id, "main"));

  await writeAuditLog({
    actorUserId: session.user.id,
    entityType: "company_settings",
    entityId: "main",
    action: "company_settings.update_locale",
    reason: "Updated currency and timezone preset.",
    beforeJson: currentSettings
      ? {
          currencyCode: currentSettings.currencyCode,
          timezone: currentSettings.timezone,
        }
      : null,
    afterJson: {
      currencyCode: preset.currencyCode,
      timezone: preset.timezone,
      presetId: preset.id,
    },
  });

  revalidateAdminPathSegments([
    "/dashboard",
    "/dashboard/settings",
  ]);

  return { status: "success", message: "Company locale settings updated." };
}
