export const employeeStatusOptions = [
  "active",
  "inactive",
  "resigned",
  "terminated",
] as const;

export const payTypeOptions = ["hourly", "monthly"] as const;

export const attendanceStatusOptions = [
  "present",
  "late",
  "absent",
  "paid_leave",
  "unpaid_leave",
  "sick_leave",
  "holiday_worked",
  "holiday_off",
  "rest_day_worked",
  "rest_day_off",
] as const;

export const leaveRequestStatusOptions = [
  "pending",
  "approved",
  "rejected",
] as const;

export const leavePortionOptions = [
  "full_day",
  "half_day_am",
  "half_day_pm",
] as const;

export const payrollFrequencyOptions = [
  "monthly",
  "semi_monthly",
  "weekly",
] as const;

export const payrollPeriodStatusOptions = [
  "draft",
  "processing",
  "finalized",
] as const;

export function isOneOf<T extends readonly string[]>(
  values: T,
  value: string,
): value is T[number] {
  return values.includes(value);
}

export function formatEnumLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
