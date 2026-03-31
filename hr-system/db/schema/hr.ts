import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

const money = (name: string) => numeric(name, { precision: 12, scale: 2 });
const quantity = (name: string) => numeric(name, { precision: 10, scale: 2 });
const ratio = (name: string) => numeric(name, { precision: 6, scale: 2 });
const dateOnly = (name: string) => date(name, { mode: "string" });
const timestampTz = (name: string) => timestamp(name, { withTimezone: true });

function auditColumns() {
  return {
    createdAt: timestampTz("created_at").defaultNow().notNull(),
    updatedAt: timestampTz("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  };
}

export const employeeStatus = pgEnum("employee_status", [
  "active",
  "inactive",
  "resigned",
  "terminated",
]);
export const payType = pgEnum("pay_type", ["hourly", "monthly"]);
export const overtimeRateMode = pgEnum("overtime_rate_mode", [
  "multiplier",
  "flat_rate",
]);
export const attendanceStatus = pgEnum("attendance_status", [
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
]);
export const approvalStatus = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const leavePortion = pgEnum("leave_portion", [
  "full_day",
  "half_day_am",
  "half_day_pm",
]);
export const leaveRequestStatus = pgEnum("leave_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);
export const leaveBalanceEntryType = pgEnum("leave_balance_entry_type", [
  "grant",
  "usage",
  "adjustment",
  "reversal",
  "carry_forward",
]);
export const holidayType = pgEnum("holiday_type", [
  "public",
  "company",
  "special",
]);
export const payrollFrequency = pgEnum("payroll_frequency", [
  "monthly",
  "semi_monthly",
  "weekly",
]);
export const monthlyDeductionMethod = pgEnum("monthly_deduction_method", [
  "working_days",
  "calendar_days",
  "scheduled_days",
]);
export const payrollPeriodStatus = pgEnum("payroll_period_status", [
  "draft",
  "processing",
  "finalized",
]);
export const payrollRunStatus = pgEnum("payroll_run_status", [
  "draft",
  "calculated",
  "finalized",
  "superseded",
]);
export const payrollLineType = pgEnum("payroll_line_type", [
  "regular_pay",
  "overtime_pay",
  "paid_leave_pay",
  "sick_leave_pay",
  "holiday_pay",
  "holiday_premium",
  "absence_deduction",
  "unpaid_leave_deduction",
  "late_deduction",
  "manual_adjustment",
  "other",
]);
export const payrollAdjustmentType = pgEnum("payroll_adjustment_type", [
  "earning",
  "deduction",
]);

export const companySettings = pgTable("company_settings", {
  id: text("id").primaryKey().default("main"),
  businessName: text("business_name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  currencyCode: text("currency_code").notNull().default("USD"),
  weekStartsOn: integer("week_starts_on").notNull().default(1),
  ...auditColumns(),
});

export const department = pgTable(
  "department",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("department_code_idx").on(table.code),
    index("department_active_idx").on(table.isActive),
  ],
);

export const employee = pgTable(
  "employee",
  {
    id: text("id").primaryKey(),
    employeeCode: text("employee_code").notNull(),
    fullName: text("full_name").notNull(),
    email: text("email"),
    phoneNumber: text("phone_number"),
    status: employeeStatus("status").notNull().default("active"),
    hireDate: dateOnly("hire_date").notNull(),
    endDate: dateOnly("end_date"),
    departmentId: text("department_id").references(() => department.id, {
      onDelete: "set null",
    }),
    jobTitle: text("job_title").notNull(),
    paymentNotes: text("payment_notes"),
    notes: text("notes"),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("employee_code_idx").on(table.employeeCode),
    uniqueIndex("employee_email_idx").on(table.email),
    uniqueIndex("employee_phone_idx").on(table.phoneNumber),
    index("employee_status_idx").on(table.status),
    index("employee_department_idx").on(table.departmentId),
  ],
);

export const employeeCompensationHistory = pgTable(
  "employee_compensation_history",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    payType: payType("pay_type").notNull(),
    hourlyRate: money("hourly_rate"),
    monthlySalary: money("monthly_salary"),
    overtimeEligible: boolean("overtime_eligible").notNull().default(false),
    overtimeRateMode: overtimeRateMode("overtime_rate_mode"),
    overtimeRate: money("overtime_rate"),
    overtimeMultiplier: ratio("overtime_multiplier"),
    effectiveFrom: dateOnly("effective_from").notNull(),
    effectiveTo: dateOnly("effective_to"),
    changeReason: text("change_reason"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("employee_comp_history_employee_idx").on(
      table.employeeId,
      table.effectiveFrom,
    ),
  ],
);

export const workSchedule = pgTable(
  "work_schedule",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    workDays: jsonb("work_days").$type<number[]>().notNull(),
    plannedStartTime: time("planned_start_time").notNull(),
    plannedEndTime: time("planned_end_time").notNull(),
    defaultBreakMinutes: integer("default_break_minutes").notNull().default(0),
    isDefault: boolean("is_default").notNull().default(false),
    ...auditColumns(),
  },
  (table) => [index("work_schedule_default_idx").on(table.isDefault)],
);

export const employeeScheduleAssignment = pgTable(
  "employee_schedule_assignment",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    workScheduleId: text("work_schedule_id")
      .notNull()
      .references(() => workSchedule.id, { onDelete: "restrict" }),
    effectiveFrom: dateOnly("effective_from").notNull(),
    effectiveTo: dateOnly("effective_to"),
    assignedByUserId: text("assigned_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("employee_schedule_assignment_employee_idx").on(
      table.employeeId,
      table.effectiveFrom,
    ),
  ],
);

export const attendanceEntry = pgTable(
  "attendance_entry",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    workDate: dateOnly("work_date").notNull(),
    segmentIndex: integer("segment_index").notNull().default(0),
    shiftLabel: text("shift_label"),
    plannedStartAt: timestampTz("planned_start_at"),
    plannedEndAt: timestampTz("planned_end_at"),
    actualClockInAt: timestampTz("actual_clock_in_at"),
    actualClockOutAt: timestampTz("actual_clock_out_at"),
    breakMinutes: integer("break_minutes").notNull().default(0),
    status: attendanceStatus("status").notNull(),
    approvalStatus: approvalStatus("approval_status")
      .notNull()
      .default("pending"),
    source: text("source").notNull().default("manual"),
    remarks: text("remarks"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("attendance_entry_employee_segment_idx").on(
      table.employeeId,
      table.workDate,
      table.segmentIndex,
    ),
    index("attendance_entry_work_date_idx").on(table.workDate),
    index("attendance_entry_approval_idx").on(table.approvalStatus),
  ],
);

export const overtimeEntry = pgTable(
  "overtime_entry",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    attendanceEntryId: text("attendance_entry_id").references(
      () => attendanceEntry.id,
      { onDelete: "set null" },
    ),
    workDate: dateOnly("work_date").notNull(),
    requestedMinutes: integer("requested_minutes").notNull().default(0),
    approvedMinutes: integer("approved_minutes").notNull().default(0),
    status: approvalStatus("status").notNull().default("pending"),
    rateMode: overtimeRateMode("rate_mode"),
    customRate: money("custom_rate"),
    customMultiplier: ratio("custom_multiplier"),
    remarks: text("remarks"),
    approvedByUserId: text("approved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("overtime_entry_employee_idx").on(table.employeeId, table.workDate),
    index("overtime_entry_status_idx").on(table.status),
  ],
);

export const leaveType = pgTable(
  "leave_type",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    payable: boolean("payable").notNull().default(true),
    consumesBalance: boolean("consumes_balance").notNull().default(true),
    supportsHalfDay: boolean("supports_half_day").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("leave_type_code_idx").on(table.code),
    index("leave_type_active_idx").on(table.isActive),
  ],
);

export const leaveRequest = pgTable(
  "leave_request",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    leaveTypeId: text("leave_type_id")
      .notNull()
      .references(() => leaveType.id, { onDelete: "restrict" }),
    startDate: dateOnly("start_date").notNull(),
    endDate: dateOnly("end_date").notNull(),
    startPortion: leavePortion("start_portion").notNull().default("full_day"),
    endPortion: leavePortion("end_portion").notNull().default("full_day"),
    requestedUnits: quantity("requested_units").notNull(),
    approvedUnits: quantity("approved_units"),
    status: leaveRequestStatus("status").notNull().default("pending"),
    requestedReason: text("requested_reason"),
    decisionNote: text("decision_note"),
    requestedByUserId: text("requested_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    approvedByUserId: text("approved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("leave_request_employee_idx").on(table.employeeId, table.startDate),
    index("leave_request_status_idx").on(table.status),
  ],
);

export const leaveBalanceLedger = pgTable(
  "leave_balance_ledger",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    leaveTypeId: text("leave_type_id")
      .notNull()
      .references(() => leaveType.id, { onDelete: "restrict" }),
    entryType: leaveBalanceEntryType("entry_type").notNull(),
    unitsDelta: quantity("units_delta").notNull(),
    effectiveDate: dateOnly("effective_date").notNull(),
    referenceType: text("reference_type"),
    referenceId: text("reference_id"),
    reason: text("reason"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("leave_balance_ledger_employee_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.effectiveDate,
    ),
  ],
);

export const holiday = pgTable(
  "holiday",
  {
    id: text("id").primaryKey(),
    holidayDate: dateOnly("holiday_date").notNull(),
    name: text("name").notNull(),
    type: holidayType("type").notNull().default("public"),
    businessClosed: boolean("business_closed").notNull().default(true),
    workAllowed: boolean("work_allowed").notNull().default(false),
    isPaidHoliday: boolean("is_paid_holiday").notNull().default(true),
    notes: text("notes"),
    ...auditColumns(),
  },
  (table) => [uniqueIndex("holiday_date_idx").on(table.holidayDate)],
);

export const payrollPolicyVersion = pgTable(
  "payroll_policy_version",
  {
    id: text("id").primaryKey(),
    effectiveFrom: dateOnly("effective_from").notNull(),
    effectiveTo: dateOnly("effective_to"),
    payrollFrequency: payrollFrequency("payroll_frequency")
      .notNull()
      .default("monthly"),
    overtimeMultiplierDefault: ratio("overtime_multiplier_default")
      .notNull()
      .default("1.50"),
    paidLeavePayable: boolean("paid_leave_payable").notNull().default(true),
    sickLeavePayable: boolean("sick_leave_payable").notNull().default(true),
    holidaysPaid: boolean("holidays_paid").notNull().default(true),
    holidayWorkMultiplier: ratio("holiday_work_multiplier")
      .notNull()
      .default("2.00"),
    lateGraceMinutes: integer("late_grace_minutes").notNull().default(0),
    unpaidBreakRequired: boolean("unpaid_break_required")
      .notNull()
      .default(true),
    defaultWorkMinutesPerDay: integer("default_work_minutes_per_day")
      .notNull()
      .default(480),
    monthlyDeductionMethod: monthlyDeductionMethod("monthly_deduction_method")
      .notNull()
      .default("scheduled_days"),
    notes: text("notes"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("payroll_policy_version_effective_idx").on(table.effectiveFrom),
  ],
);

export const payrollPeriod = pgTable(
  "payroll_period",
  {
    id: text("id").primaryKey(),
    startDate: dateOnly("start_date").notNull(),
    endDate: dateOnly("end_date").notNull(),
    frequency: payrollFrequency("frequency").notNull(),
    status: payrollPeriodStatus("status").notNull().default("draft"),
    lockedAt: timestampTz("locked_at"),
    finalizedAt: timestampTz("finalized_at"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [uniqueIndex("payroll_period_dates_idx").on(table.startDate, table.endDate)],
);

export const payrollRun = pgTable(
  "payroll_run",
  {
    id: text("id").primaryKey(),
    payrollPeriodId: text("payroll_period_id")
      .notNull()
      .references(() => payrollPeriod.id, { onDelete: "cascade" }),
    payrollPolicyVersionId: text("payroll_policy_version_id")
      .notNull()
      .references(() => payrollPolicyVersion.id, { onDelete: "restrict" }),
    runNumber: integer("run_number").notNull().default(1),
    status: payrollRunStatus("status").notNull().default("draft"),
    notes: text("notes"),
    calculatedAt: timestampTz("calculated_at"),
    finalizedAt: timestampTz("finalized_at"),
    triggeredByUserId: text("triggered_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("payroll_run_period_number_idx").on(
      table.payrollPeriodId,
      table.runNumber,
    ),
  ],
);

export const payrollResult = pgTable(
  "payroll_result",
  {
    id: text("id").primaryKey(),
    payrollRunId: text("payroll_run_id")
      .notNull()
      .references(() => payrollRun.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "restrict" }),
    payableMinutes: integer("payable_minutes").notNull().default(0),
    overtimeMinutes: integer("overtime_minutes").notNull().default(0),
    unpaidLeaveUnits: quantity("unpaid_leave_units").notNull().default("0"),
    regularPay: money("regular_pay").notNull().default("0"),
    overtimePay: money("overtime_pay").notNull().default("0"),
    paidLeavePay: money("paid_leave_pay").notNull().default("0"),
    sickLeavePay: money("sick_leave_pay").notNull().default("0"),
    holidayPay: money("holiday_pay").notNull().default("0"),
    deductionsTotal: money("deductions_total").notNull().default("0"),
    adjustmentsTotal: money("adjustments_total").notNull().default("0"),
    netPay: money("net_pay").notNull().default("0"),
    notes: text("notes"),
    snapshotJson: jsonb("snapshot_json").$type<Record<string, unknown>>(),
    ...auditColumns(),
  },
  (table) => [
    uniqueIndex("payroll_result_run_employee_idx").on(
      table.payrollRunId,
      table.employeeId,
    ),
    index("payroll_result_employee_idx").on(table.employeeId),
  ],
);

export const payrollResultLine = pgTable(
  "payroll_result_line",
  {
    id: text("id").primaryKey(),
    payrollResultId: text("payroll_result_id")
      .notNull()
      .references(() => payrollResult.id, { onDelete: "cascade" }),
    lineType: payrollLineType("line_type").notNull(),
    label: text("label").notNull(),
    quantity: quantity("quantity"),
    rate: money("rate"),
    amount: money("amount").notNull(),
    sourceType: text("source_type"),
    sourceId: text("source_id"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestampTz("created_at").defaultNow().notNull(),
  },
  (table) => [index("payroll_result_line_result_idx").on(table.payrollResultId)],
);

export const payrollAdjustment = pgTable(
  "payroll_adjustment",
  {
    id: text("id").primaryKey(),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    payrollPeriodId: text("payroll_period_id").references(() => payrollPeriod.id, {
      onDelete: "set null",
    }),
    payrollRunId: text("payroll_run_id").references(() => payrollRun.id, {
      onDelete: "set null",
    }),
    adjustmentType: payrollAdjustmentType("adjustment_type").notNull(),
    label: text("label").notNull(),
    amount: money("amount").notNull(),
    reason: text("reason").notNull(),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    ...auditColumns(),
  },
  (table) => [
    index("payroll_adjustment_employee_idx").on(table.employeeId),
    index("payroll_adjustment_period_idx").on(table.payrollPeriodId),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason"),
    beforeJson: jsonb("before_json").$type<Record<string, unknown>>(),
    afterJson: jsonb("after_json").$type<Record<string, unknown>>(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestampTz("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
    index("audit_log_actor_idx").on(table.actorUserId),
  ],
);

export const departmentRelations = relations(department, ({ many }) => ({
  employees: many(employee),
}));

export const employeeRelations = relations(employee, ({ many, one }) => ({
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  compensationHistory: many(employeeCompensationHistory),
  scheduleAssignments: many(employeeScheduleAssignment),
  attendanceEntries: many(attendanceEntry),
  overtimeEntries: many(overtimeEntry),
  leaveRequests: many(leaveRequest),
  leaveBalanceEntries: many(leaveBalanceLedger),
  payrollResults: many(payrollResult),
  payrollAdjustments: many(payrollAdjustment),
}));

export const employeeCompensationHistoryRelations = relations(
  employeeCompensationHistory,
  ({ one }) => ({
    employee: one(employee, {
      fields: [employeeCompensationHistory.employeeId],
      references: [employee.id],
    }),
    createdByUser: one(user, {
      fields: [employeeCompensationHistory.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const workScheduleRelations = relations(workSchedule, ({ many }) => ({
  assignments: many(employeeScheduleAssignment),
}));

export const employeeScheduleAssignmentRelations = relations(
  employeeScheduleAssignment,
  ({ one }) => ({
    employee: one(employee, {
      fields: [employeeScheduleAssignment.employeeId],
      references: [employee.id],
    }),
    workSchedule: one(workSchedule, {
      fields: [employeeScheduleAssignment.workScheduleId],
      references: [workSchedule.id],
    }),
    assignedByUser: one(user, {
      fields: [employeeScheduleAssignment.assignedByUserId],
      references: [user.id],
    }),
  }),
);

export const attendanceEntryRelations = relations(attendanceEntry, ({ many, one }) => ({
  employee: one(employee, {
    fields: [attendanceEntry.employeeId],
    references: [employee.id],
  }),
  createdByUser: one(user, {
    fields: [attendanceEntry.createdByUserId],
    references: [user.id],
  }),
  overtimeEntries: many(overtimeEntry),
}));

export const overtimeEntryRelations = relations(overtimeEntry, ({ one }) => ({
  employee: one(employee, {
    fields: [overtimeEntry.employeeId],
    references: [employee.id],
  }),
  attendanceEntry: one(attendanceEntry, {
    fields: [overtimeEntry.attendanceEntryId],
    references: [attendanceEntry.id],
  }),
  approvedByUser: one(user, {
    fields: [overtimeEntry.approvedByUserId],
    references: [user.id],
  }),
}));

export const leaveTypeRelations = relations(leaveType, ({ many }) => ({
  leaveRequests: many(leaveRequest),
  balanceEntries: many(leaveBalanceLedger),
}));

export const leaveRequestRelations = relations(leaveRequest, ({ one }) => ({
  employee: one(employee, {
    fields: [leaveRequest.employeeId],
    references: [employee.id],
  }),
  leaveType: one(leaveType, {
    fields: [leaveRequest.leaveTypeId],
    references: [leaveType.id],
  }),
  requestedByUser: one(user, {
    fields: [leaveRequest.requestedByUserId],
    references: [user.id],
  }),
  approvedByUser: one(user, {
    fields: [leaveRequest.approvedByUserId],
    references: [user.id],
  }),
}));

export const leaveBalanceLedgerRelations = relations(
  leaveBalanceLedger,
  ({ one }) => ({
    employee: one(employee, {
      fields: [leaveBalanceLedger.employeeId],
      references: [employee.id],
    }),
    leaveType: one(leaveType, {
      fields: [leaveBalanceLedger.leaveTypeId],
      references: [leaveType.id],
    }),
    createdByUser: one(user, {
      fields: [leaveBalanceLedger.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const payrollPolicyVersionRelations = relations(
  payrollPolicyVersion,
  ({ many, one }) => ({
    createdByUser: one(user, {
      fields: [payrollPolicyVersion.createdByUserId],
      references: [user.id],
    }),
    payrollRuns: many(payrollRun),
  }),
);

export const payrollPeriodRelations = relations(payrollPeriod, ({ many, one }) => ({
  createdByUser: one(user, {
    fields: [payrollPeriod.createdByUserId],
    references: [user.id],
  }),
  payrollRuns: many(payrollRun),
  payrollAdjustments: many(payrollAdjustment),
}));

export const payrollRunRelations = relations(payrollRun, ({ many, one }) => ({
  payrollPeriod: one(payrollPeriod, {
    fields: [payrollRun.payrollPeriodId],
    references: [payrollPeriod.id],
  }),
  payrollPolicyVersion: one(payrollPolicyVersion, {
    fields: [payrollRun.payrollPolicyVersionId],
    references: [payrollPolicyVersion.id],
  }),
  triggeredByUser: one(user, {
    fields: [payrollRun.triggeredByUserId],
    references: [user.id],
  }),
  results: many(payrollResult),
  adjustments: many(payrollAdjustment),
}));

export const payrollResultRelations = relations(payrollResult, ({ many, one }) => ({
  payrollRun: one(payrollRun, {
    fields: [payrollResult.payrollRunId],
    references: [payrollRun.id],
  }),
  employee: one(employee, {
    fields: [payrollResult.employeeId],
    references: [employee.id],
  }),
  lines: many(payrollResultLine),
}));

export const payrollResultLineRelations = relations(payrollResultLine, ({ one }) => ({
  payrollResult: one(payrollResult, {
    fields: [payrollResultLine.payrollResultId],
    references: [payrollResult.id],
  }),
}));

export const payrollAdjustmentRelations = relations(
  payrollAdjustment,
  ({ one }) => ({
    employee: one(employee, {
      fields: [payrollAdjustment.employeeId],
      references: [employee.id],
    }),
    payrollPeriod: one(payrollPeriod, {
      fields: [payrollAdjustment.payrollPeriodId],
      references: [payrollPeriod.id],
    }),
    payrollRun: one(payrollRun, {
      fields: [payrollAdjustment.payrollRunId],
      references: [payrollRun.id],
    }),
    createdByUser: one(user, {
      fields: [payrollAdjustment.createdByUserId],
      references: [user.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actorUser: one(user, {
    fields: [auditLog.actorUserId],
    references: [user.id],
  }),
}));
