import { fromDbAttendanceStatus, type UiAttendanceStatus } from "@/lib/hr/options";

export type CompensationRecord = {
  employeeId: string;
  payType: "daily" | "monthly";
  dailyRate: string | null;
  monthlySalary: string | null;
  overtimeEligible: boolean;
  overtimeRateMode: "multiplier" | "flat_rate" | null;
  overtimeRate: string | null;
  overtimeMultiplier: string | null;
  effectiveFrom: string;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  workDate: string;
  status: string;
  actualClockInAt: Date | null;
  actualClockOutAt: Date | null;
  breakMinutes: number;
};

export function getShiftHours(
  startTime: string | null,
  endTime: string | null,
  breakMinutes: number,
) {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  if (
    !Number.isFinite(startHour) ||
    !Number.isFinite(startMinute) ||
    !Number.isFinite(endHour) ||
    !Number.isFinite(endMinute)
  ) {
    return 0;
  }

  const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);

  if (totalMinutes <= 0) {
    return 0;
  }

  return Math.max(0, totalMinutes - breakMinutes) / 60;
}

export function buildCurrentCompensationMap(
  history: CompensationRecord[],
  targetDate?: string,
) {
  const currentCompensationByEmployee = new Map<string, CompensationRecord>();

  for (const row of history) {
    if (targetDate && row.effectiveFrom > targetDate) {
      continue;
    }

    if (!currentCompensationByEmployee.has(row.employeeId)) {
      currentCompensationByEmployee.set(row.employeeId, row);
    }
  }

  return currentCompensationByEmployee;
}

export function getWorkedHours(entry: AttendanceRecord) {
  if (fromDbAttendanceStatus(entry.status) !== "worked") {
    return 0;
  }

  if (!entry.actualClockInAt || !entry.actualClockOutAt) {
    return 0;
  }

  const minutes = Math.floor(
    (entry.actualClockOutAt.getTime() - entry.actualClockInAt.getTime()) / 60000,
  );

  if (minutes <= 0) {
    return 0;
  }

  const payableMinutes = Math.max(0, minutes - entry.breakMinutes);
  return payableMinutes / 60;
}

export function getInclusiveDayCount(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000) + 1);
}

export function getOverlapDayCount(
  startDate: string,
  endDate: string,
  hireDate: string,
  endEmploymentDate: string | null,
) {
  const overlapStart = startDate > hireDate ? startDate : hireDate;
  const overlapEnd = endEmploymentDate && endEmploymentDate < endDate ? endEmploymentDate : endDate;

  if (overlapStart > overlapEnd) {
    return 0;
  }

  return getInclusiveDayCount(overlapStart, overlapEnd);
}

export function summarizeAttendanceStatuses(entries: AttendanceRecord[]) {
  const summary: Record<UiAttendanceStatus, number> = {
    worked: 0,
    paid_leave: 0,
    sick_leave: 0,
    unpaid_leave: 0,
    holiday: 0,
    absent: 0,
  };

  for (const entry of entries) {
    const status = fromDbAttendanceStatus(entry.status);
    summary[status] += 1;
  }

  return summary;
}
