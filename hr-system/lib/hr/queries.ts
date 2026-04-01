import {
  and,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";
import {
  attendanceEntry,
  companySettings,
  department,
  employee,
  employeeCompensationHistory,
  leaveRequest,
  leaveType,
  payrollPeriod,
  payrollRun,
} from "@/db/schema/hr";
import { db } from "@/lib/db";
import {
  attendanceStatusOptions,
  employeeStatusOptions,
  isOneOf,
  leaveRequestStatusOptions,
  payrollFrequencyOptions,
  payrollPeriodStatusOptions,
} from "@/lib/hr/options";
import {
  companyLocalePresets,
  getCompanyLocalePresetByValues,
} from "@/lib/hr/settings";

type EmployeesFilters = {
  query?: string;
  departmentId?: string;
  status?: string;
};

type AttendanceFilters = {
  employeeId?: string;
  status?: string;
  workDate?: string;
};

type LeaveFilters = {
  employeeId?: string;
  leaveTypeId?: string;
  status?: string;
};

type PayrollFilters = {
  status?: string;
  frequency?: string;
};

function normalizeFilter(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildCurrentCompensationMap(
  history: Array<{
    employeeId: string;
    payType: "hourly" | "monthly";
    hourlyRate: string | null;
    monthlySalary: string | null;
    effectiveFrom: string;
  }>,
) {
  const currentCompensationByEmployee = new Map<string, (typeof history)[number]>();

  for (const row of history) {
    if (!currentCompensationByEmployee.has(row.employeeId)) {
      currentCompensationByEmployee.set(row.employeeId, row);
    }
  }

  return currentCompensationByEmployee;
}

export async function getDepartmentOptions() {
  return db
    .select({ id: department.id, name: department.name, code: department.code })
    .from(department)
    .where(eq(department.isActive, true))
    .orderBy(department.name);
}

export async function getEmployeeOptions() {
  return db
    .select({ id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode })
    .from(employee)
    .where(eq(employee.status, "active"))
    .orderBy(employee.fullName);
}

export async function getLeaveTypeOptions() {
  return db
    .select({ id: leaveType.id, name: leaveType.name, code: leaveType.code })
    .from(leaveType)
    .where(eq(leaveType.isActive, true))
    .orderBy(leaveType.name);
}

export async function getDashboardData() {
  const [employeeSummary, activeEmployeeSummary, departmentSummary, pendingLeaveSummary, draftPayrollSummary, recentEmployees] =
    await Promise.all([
      db.select({ value: count() }).from(employee),
      db.select({ value: count() }).from(employee).where(eq(employee.status, "active")),
      db.select({ value: count() }).from(department).where(eq(department.isActive, true)),
      db.select({ value: count() }).from(leaveRequest).where(eq(leaveRequest.status, "pending")),
      db.select({ value: count() }).from(payrollPeriod).where(eq(payrollPeriod.status, "draft")),
      db
        .select({
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          jobTitle: employee.jobTitle,
          status: employee.status,
          createdAt: employee.createdAt,
          departmentName: department.name,
        })
        .from(employee)
        .leftJoin(department, eq(employee.departmentId, department.id))
        .orderBy(desc(employee.createdAt))
        .limit(8),
    ]);

  return {
    summary: {
      totalEmployees: employeeSummary[0]?.value ?? 0,
      activeEmployees: activeEmployeeSummary[0]?.value ?? 0,
      activeDepartments: departmentSummary[0]?.value ?? 0,
      pendingLeaveRequests: pendingLeaveSummary[0]?.value ?? 0,
      draftPayrollPeriods: draftPayrollSummary[0]?.value ?? 0,
    },
    recentEmployees,
  };
}

export async function getEmployeesPageData(filters: EmployeesFilters = {}) {
  const query = normalizeFilter(filters.query);
  const departmentId = normalizeFilter(filters.departmentId);
  const status = normalizeFilter(filters.status);
  const conditions: SQL[] = [];

  if (query) {
    const pattern = `%${query}%`;
    const searchCondition = or(
      ilike(employee.fullName, pattern),
      ilike(employee.employeeCode, pattern),
      ilike(employee.jobTitle, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (departmentId) {
    conditions.push(eq(employee.departmentId, departmentId));
  }

  if (status && isOneOf(employeeStatusOptions, status)) {
    conditions.push(eq(employee.status, status));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [departments, employees, compensationHistory] = await Promise.all([
    getDepartmentOptions(),
    db
      .select({
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        status: employee.status,
        hireDate: employee.hireDate,
        jobTitle: employee.jobTitle,
        departmentId: employee.departmentId,
        departmentName: department.name,
      })
      .from(employee)
      .leftJoin(department, eq(employee.departmentId, department.id))
      .where(whereClause)
      .orderBy(desc(employee.createdAt)),
    db
      .select({
        employeeId: employeeCompensationHistory.employeeId,
        payType: employeeCompensationHistory.payType,
        hourlyRate: employeeCompensationHistory.hourlyRate,
        monthlySalary: employeeCompensationHistory.monthlySalary,
        effectiveFrom: employeeCompensationHistory.effectiveFrom,
      })
      .from(employeeCompensationHistory)
      .orderBy(
        desc(employeeCompensationHistory.effectiveFrom),
        desc(employeeCompensationHistory.createdAt),
      ),
  ]);

  const currentCompensationByEmployee = buildCurrentCompensationMap(compensationHistory);

  return {
    departments,
    employees: employees.map((item) => ({
      ...item,
      currentCompensation: currentCompensationByEmployee.get(item.id) ?? null,
    })),
  };
}

export async function getAttendancePageData(filters: AttendanceFilters = {}) {
  const employeeId = normalizeFilter(filters.employeeId);
  const status = normalizeFilter(filters.status);
  const workDate = normalizeFilter(filters.workDate);
  const conditions: SQL[] = [];

  if (employeeId) {
    conditions.push(eq(attendanceEntry.employeeId, employeeId));
  }

  if (status && isOneOf(attendanceStatusOptions, status)) {
    conditions.push(eq(attendanceEntry.status, status));
  }

  if (workDate) {
    conditions.push(eq(attendanceEntry.workDate, workDate));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [employees, entries] = await Promise.all([
    getEmployeeOptions(),
    db
      .select({
        id: attendanceEntry.id,
        workDate: attendanceEntry.workDate,
        shiftLabel: attendanceEntry.shiftLabel,
        status: attendanceEntry.status,
        approvalStatus: attendanceEntry.approvalStatus,
        actualClockInAt: attendanceEntry.actualClockInAt,
        actualClockOutAt: attendanceEntry.actualClockOutAt,
        breakMinutes: attendanceEntry.breakMinutes,
        remarks: attendanceEntry.remarks,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
      })
      .from(attendanceEntry)
      .innerJoin(employee, eq(attendanceEntry.employeeId, employee.id))
      .where(whereClause)
      .orderBy(desc(attendanceEntry.workDate), desc(attendanceEntry.createdAt))
      .limit(24),
  ]);

  return { employees, entries };
}

export async function getLeavePageData(filters: LeaveFilters = {}) {
  const employeeId = normalizeFilter(filters.employeeId);
  const leaveTypeId = normalizeFilter(filters.leaveTypeId);
  const status = normalizeFilter(filters.status);
  const conditions: SQL[] = [];

  if (employeeId) {
    conditions.push(eq(leaveRequest.employeeId, employeeId));
  }

  if (leaveTypeId) {
    conditions.push(eq(leaveRequest.leaveTypeId, leaveTypeId));
  }

  if (status && isOneOf(leaveRequestStatusOptions, status)) {
    conditions.push(eq(leaveRequest.status, status));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [employees, leaveTypes, requests] = await Promise.all([
    getEmployeeOptions(),
    getLeaveTypeOptions(),
    db
      .select({
        id: leaveRequest.id,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        requestedUnits: leaveRequest.requestedUnits,
        approvedUnits: leaveRequest.approvedUnits,
        status: leaveRequest.status,
        requestedReason: leaveRequest.requestedReason,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
        leaveTypeName: leaveType.name,
        leaveTypeCode: leaveType.code,
      })
      .from(leaveRequest)
      .innerJoin(employee, eq(leaveRequest.employeeId, employee.id))
      .innerJoin(leaveType, eq(leaveRequest.leaveTypeId, leaveType.id))
      .where(whereClause)
      .orderBy(desc(leaveRequest.startDate), desc(leaveRequest.createdAt))
      .limit(24),
  ]);

  return { employees, leaveTypes, requests };
}

export async function getPayrollPageData(filters: PayrollFilters = {}) {
  const status = normalizeFilter(filters.status);
  const frequency = normalizeFilter(filters.frequency);
  const conditions: SQL[] = [];

  if (status && isOneOf(payrollPeriodStatusOptions, status)) {
    conditions.push(eq(payrollPeriod.status, status));
  }

  if (frequency && isOneOf(payrollFrequencyOptions, frequency)) {
    conditions.push(eq(payrollPeriod.frequency, frequency));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const periods = await db
    .select({
      id: payrollPeriod.id,
      startDate: payrollPeriod.startDate,
      endDate: payrollPeriod.endDate,
      frequency: payrollPeriod.frequency,
      status: payrollPeriod.status,
      finalizedAt: payrollPeriod.finalizedAt,
      createdAt: payrollPeriod.createdAt,
    })
    .from(payrollPeriod)
    .where(whereClause)
    .orderBy(desc(payrollPeriod.startDate), desc(payrollPeriod.createdAt))
    .limit(24);

  const periodIds = periods.map((period) => period.id);

  const runs = periodIds.length
    ? await db
        .select({
          id: payrollRun.id,
          payrollPeriodId: payrollRun.payrollPeriodId,
          runNumber: payrollRun.runNumber,
          status: payrollRun.status,
          createdAt: payrollRun.createdAt,
        })
        .from(payrollRun)
        .where(inArray(payrollRun.payrollPeriodId, periodIds))
        .orderBy(desc(payrollRun.runNumber), desc(payrollRun.createdAt))
    : [];

  const latestRunByPeriod = new Map<string, (typeof runs)[number]>();

  for (const run of runs) {
    if (!latestRunByPeriod.has(run.payrollPeriodId)) {
      latestRunByPeriod.set(run.payrollPeriodId, run);
    }
  }

  return {
    periods: periods.map((period) => ({
      ...period,
      latestRun: latestRunByPeriod.get(period.id) ?? null,
    })),
  };
}

export async function getDashboardRecentEmployees() {
  return db
    .select({
      id: employee.id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      jobTitle: employee.jobTitle,
      status: employee.status,
      departmentName: department.name,
    })
    .from(employee)
    .leftJoin(department, eq(employee.departmentId, department.id))
    .orderBy(desc(employee.createdAt))
    .limit(8);
}

export async function getAttendanceSnapshot() {
  return db
    .select({
      id: attendanceEntry.id,
      workDate: attendanceEntry.workDate,
      status: attendanceEntry.status,
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
    })
    .from(attendanceEntry)
    .innerJoin(employee, eq(attendanceEntry.employeeId, employee.id))
    .orderBy(desc(attendanceEntry.workDate), desc(attendanceEntry.createdAt))
    .limit(6);
}

export async function getPendingLeaveSnapshot() {
  return db
    .select({
      id: leaveRequest.id,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      leaveTypeCode: leaveType.code,
    })
    .from(leaveRequest)
    .innerJoin(employee, eq(leaveRequest.employeeId, employee.id))
    .innerJoin(leaveType, eq(leaveRequest.leaveTypeId, leaveType.id))
    .where(eq(leaveRequest.status, "pending"))
    .orderBy(desc(leaveRequest.startDate), desc(leaveRequest.createdAt))
    .limit(6);
}

export async function getDraftPayrollSnapshot() {
  return db
    .select({
      id: payrollPeriod.id,
      startDate: payrollPeriod.startDate,
      endDate: payrollPeriod.endDate,
      frequency: payrollPeriod.frequency,
      status: payrollPeriod.status,
    })
    .from(payrollPeriod)
    .where(eq(payrollPeriod.status, "draft"))
    .orderBy(desc(payrollPeriod.startDate), desc(payrollPeriod.createdAt))
    .limit(6);
}

export async function getOverviewPageData() {
  const [dashboard, attendanceEntries, pendingLeaveRequests, draftPayrolls] = await Promise.all([
    getDashboardData(),
    getAttendanceSnapshot(),
    getPendingLeaveSnapshot(),
    getDraftPayrollSnapshot(),
  ]);

  return {
    ...dashboard,
    attendanceEntries,
    pendingLeaveRequests,
    draftPayrolls,
  };
}

export async function getSettingsPageData() {
  const settings = await db.query.companySettings.findFirst({
    where: eq(companySettings.id, "main"),
    columns: {
      id: true,
      businessName: true,
      currencyCode: true,
      timezone: true,
      weekStartsOn: true,
      updatedAt: true,
    },
  });

  if (!settings) {
    throw new Error("Company settings are not initialized.");
  }

  return {
    settings,
    presets: companyLocalePresets,
    activePreset:
      getCompanyLocalePresetByValues(settings.currencyCode, settings.timezone) ??
      companyLocalePresets[0],
  };
}
