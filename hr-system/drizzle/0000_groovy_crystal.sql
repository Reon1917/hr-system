CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'late', 'absent', 'paid_leave', 'unpaid_leave', 'sick_leave', 'holiday_worked', 'holiday_off', 'rest_day_worked', 'rest_day_off');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('active', 'inactive', 'resigned', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."holiday_type" AS ENUM('public', 'company', 'special');--> statement-breakpoint
CREATE TYPE "public"."leave_balance_entry_type" AS ENUM('grant', 'usage', 'adjustment', 'reversal', 'carry_forward');--> statement-breakpoint
CREATE TYPE "public"."leave_portion" AS ENUM('full_day', 'half_day_am', 'half_day_pm');--> statement-breakpoint
CREATE TYPE "public"."leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."monthly_deduction_method" AS ENUM('working_days', 'calendar_days', 'scheduled_days');--> statement-breakpoint
CREATE TYPE "public"."overtime_rate_mode" AS ENUM('multiplier', 'flat_rate');--> statement-breakpoint
CREATE TYPE "public"."pay_type" AS ENUM('hourly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."payroll_adjustment_type" AS ENUM('earning', 'deduction');--> statement-breakpoint
CREATE TYPE "public"."payroll_frequency" AS ENUM('monthly', 'semi_monthly', 'weekly');--> statement-breakpoint
CREATE TYPE "public"."payroll_line_type" AS ENUM('regular_pay', 'overtime_pay', 'paid_leave_pay', 'sick_leave_pay', 'holiday_pay', 'holiday_premium', 'absence_deduction', 'unpaid_leave_deduction', 'late_deduction', 'manual_adjustment', 'other');--> statement-breakpoint
CREATE TYPE "public"."payroll_period_status" AS ENUM('draft', 'processing', 'finalized');--> statement-breakpoint
CREATE TYPE "public"."payroll_run_status" AS ENUM('draft', 'calculated', 'finalized', 'superseded');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'admin',
	"is_active" boolean DEFAULT true,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"work_date" date NOT NULL,
	"segment_index" integer DEFAULT 0 NOT NULL,
	"shift_label" text,
	"planned_start_at" timestamp with time zone,
	"planned_end_at" timestamp with time zone,
	"actual_clock_in_at" timestamp with time zone,
	"actual_clock_out_at" timestamp with time zone,
	"break_minutes" integer DEFAULT 0 NOT NULL,
	"status" "attendance_status" NOT NULL,
	"approval_status" "approval_status" DEFAULT 'pending' NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"remarks" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"before_json" jsonb,
	"after_json" jsonb,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"business_name" text NOT NULL,
	"timezone" text DEFAULT 'Asia/Bangkok' NOT NULL,
	"currency_code" text DEFAULT 'THB' NOT NULL,
	"week_starts_on" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "department" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_code" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone_number" text,
	"status" "employee_status" DEFAULT 'active' NOT NULL,
	"hire_date" date NOT NULL,
	"end_date" date,
	"department_id" text,
	"job_title" text NOT NULL,
	"paid_leave_quota" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sick_leave_quota" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_notes" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_compensation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"pay_type" "pay_type" NOT NULL,
	"hourly_rate" numeric(12, 2),
	"monthly_salary" numeric(12, 2),
	"overtime_eligible" boolean DEFAULT false NOT NULL,
	"overtime_rate_mode" "overtime_rate_mode",
	"overtime_rate" numeric(12, 2),
	"overtime_multiplier" numeric(6, 2),
	"effective_from" date NOT NULL,
	"effective_to" date,
	"change_reason" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_schedule_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"work_schedule_id" text NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"assigned_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "holiday" (
	"id" text PRIMARY KEY NOT NULL,
	"holiday_date" date NOT NULL,
	"name" text NOT NULL,
	"type" "holiday_type" DEFAULT 'public' NOT NULL,
	"business_closed" boolean DEFAULT true NOT NULL,
	"work_allowed" boolean DEFAULT false NOT NULL,
	"is_paid_holiday" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_balance_ledger" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"leave_type_id" text NOT NULL,
	"entry_type" "leave_balance_entry_type" NOT NULL,
	"units_delta" numeric(10, 2) NOT NULL,
	"effective_date" date NOT NULL,
	"reference_type" text,
	"reference_id" text,
	"reason" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_request" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"leave_type_id" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_portion" "leave_portion" DEFAULT 'full_day' NOT NULL,
	"end_portion" "leave_portion" DEFAULT 'full_day' NOT NULL,
	"requested_units" numeric(10, 2) NOT NULL,
	"approved_units" numeric(10, 2),
	"status" "leave_request_status" DEFAULT 'pending' NOT NULL,
	"requested_reason" text,
	"decision_note" text,
	"requested_by_user_id" text,
	"approved_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_type" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"payable" boolean DEFAULT true NOT NULL,
	"consumes_balance" boolean DEFAULT true NOT NULL,
	"supports_half_day" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "overtime_entry" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"attendance_entry_id" text,
	"work_date" date NOT NULL,
	"requested_minutes" integer DEFAULT 0 NOT NULL,
	"approved_minutes" integer DEFAULT 0 NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"rate_mode" "overtime_rate_mode",
	"custom_rate" numeric(12, 2),
	"custom_multiplier" numeric(6, 2),
	"remarks" text,
	"approved_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_adjustment" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_id" text NOT NULL,
	"payroll_period_id" text,
	"payroll_run_id" text,
	"adjustment_type" "payroll_adjustment_type" NOT NULL,
	"label" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"reason" text NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_period" (
	"id" text PRIMARY KEY NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"frequency" "payroll_frequency" NOT NULL,
	"status" "payroll_period_status" DEFAULT 'draft' NOT NULL,
	"locked_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_policy_version" (
	"id" text PRIMARY KEY NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"payroll_frequency" "payroll_frequency" DEFAULT 'monthly' NOT NULL,
	"overtime_multiplier_default" numeric(6, 2) DEFAULT '1.50' NOT NULL,
	"paid_leave_payable" boolean DEFAULT true NOT NULL,
	"sick_leave_payable" boolean DEFAULT true NOT NULL,
	"holidays_paid" boolean DEFAULT true NOT NULL,
	"holiday_work_multiplier" numeric(6, 2) DEFAULT '2.00' NOT NULL,
	"late_grace_minutes" integer DEFAULT 0 NOT NULL,
	"unpaid_break_required" boolean DEFAULT true NOT NULL,
	"default_work_minutes_per_day" integer DEFAULT 480 NOT NULL,
	"monthly_deduction_method" "monthly_deduction_method" DEFAULT 'scheduled_days' NOT NULL,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_result" (
	"id" text PRIMARY KEY NOT NULL,
	"payroll_run_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"payable_minutes" integer DEFAULT 0 NOT NULL,
	"overtime_minutes" integer DEFAULT 0 NOT NULL,
	"unpaid_leave_units" numeric(10, 2) DEFAULT '0' NOT NULL,
	"regular_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"overtime_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"paid_leave_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"sick_leave_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"holiday_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"deductions_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"adjustments_total" numeric(12, 2) DEFAULT '0' NOT NULL,
	"net_pay" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"snapshot_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_result_line" (
	"id" text PRIMARY KEY NOT NULL,
	"payroll_result_id" text NOT NULL,
	"line_type" "payroll_line_type" NOT NULL,
	"label" text NOT NULL,
	"quantity" numeric(10, 2),
	"rate" numeric(12, 2),
	"amount" numeric(12, 2) NOT NULL,
	"source_type" text,
	"source_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payroll_run" (
	"id" text PRIMARY KEY NOT NULL,
	"payroll_period_id" text NOT NULL,
	"payroll_policy_version_id" text NOT NULL,
	"run_number" integer DEFAULT 1 NOT NULL,
	"status" "payroll_run_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"calculated_at" timestamp with time zone,
	"finalized_at" timestamp with time zone,
	"triggered_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"work_days" jsonb NOT NULL,
	"planned_start_time" time NOT NULL,
	"planned_end_time" time NOT NULL,
	"default_break_minutes" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_entry" ADD CONSTRAINT "attendance_entry_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_entry" ADD CONSTRAINT "attendance_entry_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_compensation_history" ADD CONSTRAINT "employee_compensation_history_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_compensation_history" ADD CONSTRAINT "employee_compensation_history_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_schedule_assignment" ADD CONSTRAINT "employee_schedule_assignment_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_schedule_assignment" ADD CONSTRAINT "employee_schedule_assignment_work_schedule_id_work_schedule_id_fk" FOREIGN KEY ("work_schedule_id") REFERENCES "public"."work_schedule"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_schedule_assignment" ADD CONSTRAINT "employee_schedule_assignment_assigned_by_user_id_user_id_fk" FOREIGN KEY ("assigned_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balance_ledger" ADD CONSTRAINT "leave_balance_ledger_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balance_ledger" ADD CONSTRAINT "leave_balance_ledger_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balance_ledger" ADD CONSTRAINT "leave_balance_ledger_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_leave_type_id_leave_type_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_type"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_requested_by_user_id_user_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_entry" ADD CONSTRAINT "overtime_entry_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_entry" ADD CONSTRAINT "overtime_entry_attendance_entry_id_attendance_entry_id_fk" FOREIGN KEY ("attendance_entry_id") REFERENCES "public"."attendance_entry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "overtime_entry" ADD CONSTRAINT "overtime_entry_approved_by_user_id_user_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_adjustment" ADD CONSTRAINT "payroll_adjustment_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_adjustment" ADD CONSTRAINT "payroll_adjustment_payroll_period_id_payroll_period_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_period"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_adjustment" ADD CONSTRAINT "payroll_adjustment_payroll_run_id_payroll_run_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payroll_run"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_adjustment" ADD CONSTRAINT "payroll_adjustment_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_period" ADD CONSTRAINT "payroll_period_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_policy_version" ADD CONSTRAINT "payroll_policy_version_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_result" ADD CONSTRAINT "payroll_result_payroll_run_id_payroll_run_id_fk" FOREIGN KEY ("payroll_run_id") REFERENCES "public"."payroll_run"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_result" ADD CONSTRAINT "payroll_result_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_result_line" ADD CONSTRAINT "payroll_result_line_payroll_result_id_payroll_result_id_fk" FOREIGN KEY ("payroll_result_id") REFERENCES "public"."payroll_result"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_run" ADD CONSTRAINT "payroll_run_payroll_period_id_payroll_period_id_fk" FOREIGN KEY ("payroll_period_id") REFERENCES "public"."payroll_period"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_run" ADD CONSTRAINT "payroll_run_payroll_policy_version_id_payroll_policy_version_id_fk" FOREIGN KEY ("payroll_policy_version_id") REFERENCES "public"."payroll_policy_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payroll_run" ADD CONSTRAINT "payroll_run_triggered_by_user_id_user_id_fk" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_entry_employee_segment_idx" ON "attendance_entry" USING btree ("employee_id","work_date","segment_index");--> statement-breakpoint
CREATE INDEX "attendance_entry_work_date_idx" ON "attendance_entry" USING btree ("work_date");--> statement-breakpoint
CREATE INDEX "attendance_entry_approval_idx" ON "attendance_entry" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_actor_idx" ON "audit_log" USING btree ("actor_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "department_code_idx" ON "department" USING btree ("code");--> statement-breakpoint
CREATE INDEX "department_active_idx" ON "department" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_code_idx" ON "employee" USING btree ("employee_code");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_email_idx" ON "employee" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "employee_phone_idx" ON "employee" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "employee_status_idx" ON "employee" USING btree ("status");--> statement-breakpoint
CREATE INDEX "employee_department_idx" ON "employee" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "employee_comp_history_employee_idx" ON "employee_compensation_history" USING btree ("employee_id","effective_from");--> statement-breakpoint
CREATE INDEX "employee_schedule_assignment_employee_idx" ON "employee_schedule_assignment" USING btree ("employee_id","effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "holiday_date_idx" ON "holiday" USING btree ("holiday_date");--> statement-breakpoint
CREATE INDEX "leave_balance_ledger_employee_idx" ON "leave_balance_ledger" USING btree ("employee_id","leave_type_id","effective_date");--> statement-breakpoint
CREATE INDEX "leave_request_employee_idx" ON "leave_request" USING btree ("employee_id","start_date");--> statement-breakpoint
CREATE INDEX "leave_request_status_idx" ON "leave_request" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_type_code_idx" ON "leave_type" USING btree ("code");--> statement-breakpoint
CREATE INDEX "leave_type_active_idx" ON "leave_type" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "overtime_entry_employee_idx" ON "overtime_entry" USING btree ("employee_id","work_date");--> statement-breakpoint
CREATE INDEX "overtime_entry_status_idx" ON "overtime_entry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payroll_adjustment_employee_idx" ON "payroll_adjustment" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_adjustment_period_idx" ON "payroll_adjustment" USING btree ("payroll_period_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_period_dates_idx" ON "payroll_period" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "payroll_policy_version_effective_idx" ON "payroll_policy_version" USING btree ("effective_from");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_result_run_employee_idx" ON "payroll_result" USING btree ("payroll_run_id","employee_id");--> statement-breakpoint
CREATE INDEX "payroll_result_employee_idx" ON "payroll_result" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "payroll_result_line_result_idx" ON "payroll_result_line" USING btree ("payroll_result_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payroll_run_period_number_idx" ON "payroll_run" USING btree ("payroll_period_id","run_number");--> statement-breakpoint
CREATE INDEX "work_schedule_default_idx" ON "work_schedule" USING btree ("is_default");