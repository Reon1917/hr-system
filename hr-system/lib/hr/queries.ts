import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  ne,
  or,
  type SQL,
} from "drizzle-orm";
import {
  attendanceEntry,
  companySettings,
  employee,
  employeeCompensationHistory,
  holiday,
  overtimeEntry,
  payrollPeriod,
  payrollResult,
  payrollRun,
} from "@/db/schema/hr";
import { db } from "@/lib/db";
import {
  buildCurrentCompensationMap,
  type CompensationRecord,
} from "@/lib/hr/payroll";
import {
  employeeStatusOptions,
  formatEnumLabel,
  fromDbAttendanceStatus,
  isOneOf,
  normalizeEmployeeStatus,
} from "@/lib/hr/options";

type EmployeesFilters = {
  query?: string;
  status?: string;
};

type AttendanceFilters = {
  workDate?: string;
};

function normalizeFilter(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function getLeaveUsageMap(
  entries: Array<{
    employeeId: string;
    status: string;
  }>,
) {
  const usageByEmployee = new Map<
    string,
    { paidLeaveUsed: number; sickLeaveUsed: number }
  >();

  for (const entry of entries) {
    const usage = usageByEmployee.get(entry.employeeId) ?? {
      paidLeaveUsed: 0,
      sickLeaveUsed: 0,
    };

    if (entry.status === "paid_leave") {
      usage.paidLeaveUsed += 1;
    }

    if (entry.status === "sick_leave") {
      usage.sickLeaveUsed += 1;
    }

    usageByEmployee.set(entry.employeeId, usage);
  }

  return usageByEmployee;
}

function getCurrentCompensationRows(
  history: CompensationRecord[],
  endDate?: string,
) {
  return buildCurrentCompensationMap(history, endDate);
}

export async function getEmployeeOptions() {
  return db
    .select({ id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode })
    .from(employee)
    .where(eq(employee.status, "active"))
    .orderBy(employee.fullName);
}

export async function getOverviewPageData() {
  const today = new Date().toISOString().slice(0, 10);
  const monthPrefix = today.slice(0, 7);

  const [employeeSummary, activeEmployeeSummary, attendanceTodaySummary, payrollPeriodSummary, recentEmployees, attendanceEntries, upcomingHolidays, latestPeriod] =
    await Promise.all([
      db.select({ value: count() }).from(employee),
      db.select({ value: count() }).from(employee).where(eq(employee.status, "active")),
      db.select({ value: count() }).from(attendanceEntry).where(eq(attendanceEntry.workDate, today)),
      db.select({ value: count() }).from(payrollPeriod),
      db
        .select({
          id: employee.id,
          employeeCode: employee.employeeCode,
          fullName: employee.fullName,
          jobTitle: employee.jobTitle,
          status: employee.status,
          createdAt: employee.createdAt,
        })
        .from(employee)
        .orderBy(desc(employee.createdAt))
        .limit(8),
      db
        .select({
          id: attendanceEntry.id,
          workDate: attendanceEntry.workDate,
          status: attendanceEntry.status,
          fullName: employee.fullName,
          employeeCode: employee.employeeCode,
        })
        .from(attendanceEntry)
        .innerJoin(employee, eq(attendanceEntry.employeeId, employee.id))
        .orderBy(desc(attendanceEntry.workDate), desc(attendanceEntry.updatedAt))
        .limit(6),
      db
        .select({
          id: holiday.id,
          holidayDate: holiday.holidayDate,
          name: holiday.name,
        })
        .from(holiday)
        .where(gte(holiday.holidayDate, today))
        .orderBy(asc(holiday.holidayDate))
        .limit(6),
      db.query.payrollPeriod.findFirst({
        columns: {
          id: true,
          startDate: true,
          endDate: true,
          finalizedAt: true,
        },
        orderBy: (fields, operators) => [operators.desc(fields.startDate)],
      }),
    ]);

  let latestPayroll: {
    periodLabel: string;
    totalCost: string;
    employeeCount: number;
  } | null = null;

  if (latestPeriod) {
    const run = await db.query.payrollRun.findFirst({
      where: eq(payrollRun.payrollPeriodId, latestPeriod.id),
      columns: { id: true },
      orderBy: (fields, operators) => [operators.desc(fields.runNumber)],
    });

    if (run) {
      const results = await db
        .select({ netPay: payrollResult.netPay })
        .from(payrollResult)
        .where(eq(payrollResult.payrollRunId, run.id));

      const totalCost = results.reduce(
        (sum, row) => sum + Number(row.netPay ?? "0"),
        0,
      );

      latestPayroll = {
        periodLabel: `${latestPeriod.startDate} to ${latestPeriod.endDate}`,
        totalCost: totalCost.toFixed(2),
        employeeCount: results.length,
      };
    }
  }

  return {
    summary: {
      totalEmployees: employeeSummary[0]?.value ?? 0,
      activeEmployees: activeEmployeeSummary[0]?.value ?? 0,
      attendanceToday: attendanceTodaySummary[0]?.value ?? 0,
      holidaysThisMonth: upcomingHolidays.filter((item) => item.holidayDate.startsWith(monthPrefix))
        .length,
      payrollPeriods: payrollPeriodSummary[0]?.value ?? 0,
    },
    recentEmployees: recentEmployees.map((item) => ({
      ...item,
      status: normalizeEmployeeStatus(item.status),
    })),
    attendanceEntries: attendanceEntries.map((item) => ({
      ...item,
      statusLabel: formatEnumLabel(fromDbAttendanceStatus(item.status)),
    })),
    upcomingHolidays,
    latestPayroll,
  };
}

export async function getEmployeesPageData(filters: EmployeesFilters = {}) {
  const query = normalizeFilter(filters.query);
  const status = normalizeFilter(filters.status);
  const conditions: SQL[] = [];

  if (query) {
    const pattern = `%${query}%`;
    const searchCondition = or(
      ilike(employee.fullName, pattern),
      ilike(employee.employeeCode, pattern),
      ilike(employee.jobTitle, pattern),
      ilike(employee.phoneNumber, pattern),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (status && isOneOf(employeeStatusOptions, status)) {
    conditions.push(
      status === "active" ? eq(employee.status, "active") : ne(employee.status, "active"),
    );
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [employees, compensationHistory, leaveEntries] = await Promise.all([
    db
      .select({
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        status: employee.status,
        hireDate: employee.hireDate,
        jobTitle: employee.jobTitle,
        phoneNumber: employee.phoneNumber,
        defaultShiftLabel: employee.defaultShiftLabel,
        defaultShiftStartTime: employee.defaultShiftStartTime,
        defaultShiftEndTime: employee.defaultShiftEndTime,
        defaultShiftBreakMinutes: employee.defaultShiftBreakMinutes,
        paidLeaveQuota: employee.paidLeaveQuota,
        sickLeaveQuota: employee.sickLeaveQuota,
      })
      .from(employee)
      .where(whereClause)
      .orderBy(desc(employee.createdAt)),
    db
      .select({
        employeeId: employeeCompensationHistory.employeeId,
        payType: employeeCompensationHistory.payType,
        dailyRate: employeeCompensationHistory.hourlyRate,
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
        employeeId: attendanceEntry.employeeId,
        status: attendanceEntry.status,
      })
      .from(attendanceEntry)
      .where(inArray(attendanceEntry.status, ["paid_leave", "sick_leave"])),
  ]);

  const currentCompensationByEmployee = getCurrentCompensationRows(compensationHistory);
  const leaveUsageByEmployee = getLeaveUsageMap(leaveEntries);

  return {
    employees: employees.map((item) => ({
      ...item,
      status: normalizeEmployeeStatus(item.status),
      currentCompensation: currentCompensationByEmployee.get(item.id) ?? null,
      leaveUsage: leaveUsageByEmployee.get(item.id) ?? {
        paidLeaveUsed: 0,
        sickLeaveUsed: 0,
      },
    })),
  };
}

export async function getAttendancePageData(filters: AttendanceFilters = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const workDate = normalizeFilter(filters.workDate) ?? today;

  const [employees, compensationHistory, rawEntries, recentEntries] = await Promise.all([
    db
      .select({
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        jobTitle: employee.jobTitle,
        defaultShiftLabel: employee.defaultShiftLabel,
        defaultShiftStartTime: employee.defaultShiftStartTime,
        defaultShiftEndTime: employee.defaultShiftEndTime,
        defaultShiftBreakMinutes: employee.defaultShiftBreakMinutes,
      })
      .from(employee)
      .where(eq(employee.status, "active"))
      .orderBy(employee.fullName),
    db
      .select({
        employeeId: employeeCompensationHistory.employeeId,
        payType: employeeCompensationHistory.payType,
        dailyRate: employeeCompensationHistory.hourlyRate,
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
        remarks: attendanceEntry.remarks,
      })
      .from(attendanceEntry)
      .where(and(eq(attendanceEntry.workDate, workDate), eq(attendanceEntry.segmentIndex, 0)))
      .orderBy(attendanceEntry.updatedAt),
    db
      .select({
        id: attendanceEntry.id,
        employeeId: attendanceEntry.employeeId,
        workDate: attendanceEntry.workDate,
        status: attendanceEntry.status,
        actualClockInAt: attendanceEntry.actualClockInAt,
        actualClockOutAt: attendanceEntry.actualClockOutAt,
        breakMinutes: attendanceEntry.breakMinutes,
        remarks: attendanceEntry.remarks,
        fullName: employee.fullName,
        employeeCode: employee.employeeCode,
      })
      .from(attendanceEntry)
      .innerJoin(employee, eq(attendanceEntry.employeeId, employee.id))
      .orderBy(desc(attendanceEntry.workDate), desc(attendanceEntry.updatedAt))
      .limit(14),
  ]);

  const currentCompensationByEmployee = getCurrentCompensationRows(compensationHistory, workDate);
  const entryIds = [...rawEntries, ...recentEntries].map((item) => item.id);
  const overtimeRows = entryIds.length
    ? await db
        .select({
          attendanceEntryId: overtimeEntry.attendanceEntryId,
          approvedMinutes: overtimeEntry.approvedMinutes,
        })
        .from(overtimeEntry)
        .where(inArray(overtimeEntry.attendanceEntryId, entryIds))
    : [];
  const overtimeByEntryId = new Map<string, number>();

  for (const row of overtimeRows) {
    if (!row.attendanceEntryId) {
      continue;
    }

    overtimeByEntryId.set(
      row.attendanceEntryId,
      (overtimeByEntryId.get(row.attendanceEntryId) ?? 0) + row.approvedMinutes / 60,
    );
  }

  const entryByEmployeeId = new Map(rawEntries.map((item) => [item.employeeId, item]));

  const rosterRows = employees.map((item) => {
    const entry = entryByEmployeeId.get(item.id);
    const compensation = currentCompensationByEmployee.get(item.id) ?? null;
    const dailyRate = compensation?.dailyRate;
    const monthlySalary = compensation?.monthlySalary;

    return {
      ...item,
      payLabel: compensation
        ? compensation.payType === "daily"
          ? `Daily · ${dailyRate}`
          : `Monthly · ${monthlySalary}`
        : "Not set",
      currentStatus: entry ? fromDbAttendanceStatus(entry.status) : "worked",
      overtimeHours: entry ? overtimeByEntryId.get(entry.id) ?? 0 : 0,
      remarks: entry?.remarks ?? "",
      entryId: entry?.id ?? null,
    };
  });

  const entries = recentEntries.map((item) => ({
      ...item,
      uiStatus: fromDbAttendanceStatus(item.status),
      overtimeHours: overtimeByEntryId.get(item.id) ?? 0,
    }));

  return { rosterDate: workDate, rosterRows, entries };
}

export async function getHolidayPageData() {
  const holidays = await db
    .select({
      id: holiday.id,
      holidayDate: holiday.holidayDate,
      name: holiday.name,
    })
    .from(holiday)
    .orderBy(asc(holiday.holidayDate));

  return { holidays };
}

export async function getPayrollPageData() {
  const periods = await db
    .select({
      id: payrollPeriod.id,
      startDate: payrollPeriod.startDate,
      endDate: payrollPeriod.endDate,
      finalizedAt: payrollPeriod.finalizedAt,
      createdAt: payrollPeriod.createdAt,
    })
    .from(payrollPeriod)
    .orderBy(desc(payrollPeriod.startDate), desc(payrollPeriod.createdAt))
    .limit(12);

  const periodIds = periods.map((period) => period.id);
  const runs = periodIds.length
    ? await db
        .select({
          id: payrollRun.id,
          payrollPeriodId: payrollRun.payrollPeriodId,
          calculatedAt: payrollRun.calculatedAt,
          createdAt: payrollRun.createdAt,
          runNumber: payrollRun.runNumber,
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

  const runIds = Array.from(latestRunByPeriod.values()).map((run) => run.id);
  const results = runIds.length
    ? await db
        .select({
          id: payrollResult.id,
          payrollRunId: payrollResult.payrollRunId,
          netPay: payrollResult.netPay,
          snapshotJson: payrollResult.snapshotJson,
          employeeName: employee.fullName,
          employeeCode: employee.employeeCode,
        })
        .from(payrollResult)
        .innerJoin(employee, eq(payrollResult.employeeId, employee.id))
        .where(inArray(payrollResult.payrollRunId, runIds))
        .orderBy(employee.fullName)
    : [];

  const resultsByRunId = new Map<string, typeof results>();

  for (const result of results) {
    const runResults = resultsByRunId.get(result.payrollRunId) ?? [];
    runResults.push(result);
    resultsByRunId.set(result.payrollRunId, runResults);
  }

  const mappedPeriods = periods.map((period) => {
    const run = latestRunByPeriod.get(period.id) ?? null;
    const runResults = run ? resultsByRunId.get(run.id) ?? [] : [];
    const totalCost = runResults.reduce(
      (sum, result) => sum + Number(result.netPay ?? "0"),
      0,
    );

    return {
      ...period,
      latestRun: run,
      employeeCount: runResults.length,
      totalCost: totalCost.toFixed(2),
    };
  });

  const activePeriod = mappedPeriods[0] ?? null;
  const activeRunId = activePeriod?.latestRun?.id ?? null;
  const latestResults = activeRunId
    ? (resultsByRunId.get(activeRunId) ?? []).map((item) => {
        const snapshot = item.snapshotJson ?? {};

        return {
          id: item.id,
          employeeName: item.employeeName,
          employeeCode: item.employeeCode,
          netPay: item.netPay,
          workedDays:
            typeof snapshot.workedDays === "number" ? snapshot.workedDays : 0,
          leaveDays: typeof snapshot.leaveDays === "number" ? snapshot.leaveDays : 0,
          overtimeHours:
            typeof snapshot.overtimeHours === "number" ? snapshot.overtimeHours : 0,
        };
      })
    : [];

  return {
    periods: mappedPeriods,
    activePeriod,
    latestResults,
  };
}

export async function getSettingsPageData() {
  const [settings, policy] = await Promise.all([
    db.query.companySettings.findFirst({
      where: eq(companySettings.id, "main"),
      columns: {
        id: true,
        businessName: true,
        currencyCode: true,
        timezone: true,
        updatedAt: true,
      },
    }),
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
  ]);

  if (!settings || !policy) {
    throw new Error("Business settings are not initialized.");
  }

  return {
    settings,
    policy: {
      ...policy,
      defaultWorkHoursPerDay: policy.defaultWorkMinutesPerDay / 60,
    },
  };
}
