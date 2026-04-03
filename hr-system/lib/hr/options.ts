export const employeeStatusOptions = ["active", "inactive"] as const;

export const payTypeOptions = ["daily", "monthly"] as const;

export const attendanceStatusOptions = [
  "worked",
  "paid_leave",
  "sick_leave",
  "unpaid_leave",
  "holiday",
  "absent",
] as const;

export type UiAttendanceStatus = (typeof attendanceStatusOptions)[number];

export type DbAttendanceStatus =
  | "present"
  | "paid_leave"
  | "sick_leave"
  | "unpaid_leave"
  | "holiday_off"
  | "absent";

const attendanceDbStatusByUiStatus: Record<UiAttendanceStatus, DbAttendanceStatus> = {
  worked: "present",
  paid_leave: "paid_leave",
  sick_leave: "sick_leave",
  unpaid_leave: "unpaid_leave",
  holiday: "holiday_off",
  absent: "absent",
};

const uiAttendanceStatusByDbStatus: Record<string, UiAttendanceStatus> = {
  present: "worked",
  late: "worked",
  absent: "absent",
  paid_leave: "paid_leave",
  unpaid_leave: "unpaid_leave",
  sick_leave: "sick_leave",
  holiday_worked: "worked",
  holiday_off: "holiday",
  rest_day_worked: "worked",
  rest_day_off: "holiday",
};

export const payrollFrequencyOptions = ["monthly"] as const;

export function isOneOf<T extends readonly string[]>(
  values: T,
  value: string,
): value is T[number] {
  return values.includes(value);
}

export function toDbAttendanceStatus(value: UiAttendanceStatus): DbAttendanceStatus {
  return attendanceDbStatusByUiStatus[value];
}

export function fromDbAttendanceStatus(value: string): UiAttendanceStatus {
  return uiAttendanceStatusByDbStatus[value] ?? "worked";
}

export function normalizeEmployeeStatus(value: string) {
  return value === "active" ? "active" : "inactive";
}

export function formatEnumLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatShiftSummary(startTime: string, endTime: string, breakMinutes: number) {
  return `${startTime} - ${endTime} · ${breakMinutes} min break`;
}
