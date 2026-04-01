-- Seed Data 1
-- Coffee shop sample dataset for the HR system.
--
-- Sample admin login:
--   email: owner@bluecupcoffee.test
--   password: CoffeeShopAdmin123!
--
-- Usage:
--   psql "$DATABASE_URL" -f seed-data/seed-data-1.sql

BEGIN;

INSERT INTO "user" (
  id,
  name,
  email,
  email_verified,
  image,
  created_at,
  updated_at,
  role,
  is_active
) VALUES (
  'seed-admin-bluecup',
  'Maya Lin',
  'owner@bluecupcoffee.test',
  TRUE,
  NULL,
  '2026-03-01 08:00:00+06:30',
  '2026-03-01 08:00:00+06:30',
  'admin',
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  email_verified = EXCLUDED.email_verified,
  updated_at = EXCLUDED.updated_at,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

INSERT INTO account (
  id,
  account_id,
  provider_id,
  user_id,
  password,
  created_at,
  updated_at
) VALUES (
  'seed-account-bluecup-admin',
  'seed-admin-bluecup',
  'credential',
  'seed-admin-bluecup',
  '2fa791c90e7044cdc6ce26b3d0e6eae5:41919d97f74f0e253ab9dd9727cb3847be8d3c6f95acfd08c23a643acda4c145ef46147b856b42cab23db6a75bae04cb51d2f5392d54ab71ba91a8577d07a963',
  '2026-03-01 08:00:00+06:30',
  '2026-03-01 08:00:00+06:30'
)
ON CONFLICT (id) DO UPDATE SET
  account_id = EXCLUDED.account_id,
  provider_id = EXCLUDED.provider_id,
  user_id = EXCLUDED.user_id,
  password = EXCLUDED.password,
  updated_at = EXCLUDED.updated_at;

INSERT INTO company_settings (
  id,
  business_name,
  timezone,
  currency_code,
  week_starts_on,
  created_at,
  updated_at
) VALUES (
  'main',
  'Blue Cup Coffee',
  'Asia/Bangkok',
  'THB',
  1,
  '2026-03-01 08:05:00+06:30',
  '2026-03-01 08:05:00+06:30'
)
ON CONFLICT (id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  timezone = EXCLUDED.timezone,
  currency_code = EXCLUDED.currency_code,
  week_starts_on = EXCLUDED.week_starts_on,
  updated_at = EXCLUDED.updated_at;

INSERT INTO department (
  id,
  code,
  name,
  is_active,
  created_at,
  updated_at
) VALUES
  ('dept-ops', 'OPS', 'Operations', TRUE, '2026-03-01 08:10:00+06:30', '2026-03-01 08:10:00+06:30'),
  ('dept-floor', 'FLOOR', 'Floor Service', TRUE, '2026-03-01 08:10:00+06:30', '2026-03-01 08:10:00+06:30'),
  ('dept-kitchen', 'KITCHEN', 'Kitchen', TRUE, '2026-03-01 08:10:00+06:30', '2026-03-01 08:10:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

INSERT INTO leave_type (
  id,
  code,
  name,
  payable,
  consumes_balance,
  supports_half_day,
  is_active,
  created_at,
  updated_at
) VALUES
  ('leave-paid', 'PAID', 'Paid Leave', TRUE, TRUE, TRUE, TRUE, '2026-03-01 08:12:00+06:30', '2026-03-01 08:12:00+06:30'),
  ('leave-sick', 'SICK', 'Sick Leave', TRUE, TRUE, TRUE, TRUE, '2026-03-01 08:12:00+06:30', '2026-03-01 08:12:00+06:30'),
  ('leave-unpaid', 'UNPAID', 'Unpaid Leave', FALSE, FALSE, TRUE, TRUE, '2026-03-01 08:12:00+06:30', '2026-03-01 08:12:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  payable = EXCLUDED.payable,
  consumes_balance = EXCLUDED.consumes_balance,
  supports_half_day = EXCLUDED.supports_half_day,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

INSERT INTO work_schedule (
  id,
  name,
  description,
  work_days,
  planned_start_time,
  planned_end_time,
  default_break_minutes,
  is_default,
  created_at,
  updated_at
) VALUES
  (
    'schedule-cafe-manager',
    'Manager Schedule',
    'Weekday management schedule for the cafe manager.',
    '[1,2,3,4,5,6]'::jsonb,
    '08:00:00',
    '17:00:00',
    60,
    FALSE,
    '2026-03-01 08:15:00+06:30',
    '2026-03-01 08:15:00+06:30'
  ),
  (
    'schedule-cafe-floor',
    'Floor Service Schedule',
    'Opening-to-afternoon schedule for baristas and servers.',
    '[1,2,3,4,5,6]'::jsonb,
    '06:30:00',
    '15:00:00',
    45,
    TRUE,
    '2026-03-01 08:15:00+06:30',
    '2026-03-01 08:15:00+06:30'
  ),
  (
    'schedule-cafe-kitchen',
    'Kitchen Schedule',
    'Early kitchen prep and service schedule.',
    '[1,2,3,4,5,6]'::jsonb,
    '05:30:00',
    '14:00:00',
    60,
    FALSE,
    '2026-03-01 08:15:00+06:30',
    '2026-03-01 08:15:00+06:30'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  work_days = EXCLUDED.work_days,
  planned_start_time = EXCLUDED.planned_start_time,
  planned_end_time = EXCLUDED.planned_end_time,
  default_break_minutes = EXCLUDED.default_break_minutes,
  is_default = EXCLUDED.is_default,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_policy_version (
  id,
  effective_from,
  effective_to,
  payroll_frequency,
  overtime_multiplier_default,
  paid_leave_payable,
  sick_leave_payable,
  holidays_paid,
  holiday_work_multiplier,
  late_grace_minutes,
  unpaid_break_required,
  default_work_minutes_per_day,
  monthly_deduction_method,
  notes,
  created_by_user_id,
  created_at,
  updated_at
) VALUES (
  'policy-default',
  '2026-01-01',
  NULL,
  'monthly',
  '1.50',
  TRUE,
  TRUE,
  TRUE,
  '2.00',
  10,
  TRUE,
  480,
  'scheduled_days',
  'Default payroll rules for Blue Cup Coffee.',
  'seed-admin-bluecup',
  '2026-03-01 08:18:00+06:30',
  '2026-03-01 08:18:00+06:30'
)
ON CONFLICT (id) DO UPDATE SET
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  payroll_frequency = EXCLUDED.payroll_frequency,
  overtime_multiplier_default = EXCLUDED.overtime_multiplier_default,
  paid_leave_payable = EXCLUDED.paid_leave_payable,
  sick_leave_payable = EXCLUDED.sick_leave_payable,
  holidays_paid = EXCLUDED.holidays_paid,
  holiday_work_multiplier = EXCLUDED.holiday_work_multiplier,
  late_grace_minutes = EXCLUDED.late_grace_minutes,
  unpaid_break_required = EXCLUDED.unpaid_break_required,
  default_work_minutes_per_day = EXCLUDED.default_work_minutes_per_day,
  monthly_deduction_method = EXCLUDED.monthly_deduction_method,
  notes = EXCLUDED.notes,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO employee (
  id,
  employee_code,
  full_name,
  email,
  phone_number,
  status,
  hire_date,
  end_date,
  department_id,
  job_title,
  payment_notes,
  notes,
  created_at,
  updated_at
) VALUES
  (
    'emp-maya-lin',
    'E001',
    'Maya Lin',
    'maya.lin@bluecupcoffee.test',
    '+959421000001',
    'active',
    '2024-06-01',
    NULL,
    'dept-ops',
    'Cafe Manager',
    'Primary payroll account ending 9901.',
    'Oversees rota planning, suppliers, and payroll review.',
    '2026-03-01 08:20:00+06:30',
    '2026-03-01 08:20:00+06:30'
  ),
  (
    'emp-noah-htet',
    'E002',
    'Noah Htet',
    'noah.htet@bluecupcoffee.test',
    '+959421000002',
    'active',
    '2025-01-15',
    NULL,
    'dept-floor',
    'Barista',
    'Weekly transfer to KBZ wallet.',
    'Lead opener for weekday service.',
    '2026-03-01 08:20:00+06:30',
    '2026-03-01 08:20:00+06:30'
  ),
  (
    'emp-ava-soe',
    'E003',
    'Ava Soe',
    'ava.soe@bluecupcoffee.test',
    '+959421000003',
    'active',
    '2025-03-10',
    NULL,
    'dept-floor',
    'Server',
    'Biweekly bank transfer.',
    'Handles floor service and cashier support.',
    '2026-03-01 08:20:00+06:30',
    '2026-03-01 08:20:00+06:30'
  ),
  (
    'emp-liam-zaw',
    'E004',
    'Liam Zaw',
    'liam.zaw@bluecupcoffee.test',
    '+959421000004',
    'active',
    '2024-11-05',
    NULL,
    'dept-kitchen',
    'Cook',
    'Monthly transfer to Aya account.',
    'Prepares breakfast line and pastry warmers.',
    '2026-03-01 08:20:00+06:30',
    '2026-03-01 08:20:00+06:30'
  ),
  (
    'emp-ei-nandar',
    'E005',
    'Ei Nandar',
    'ei.nandar@bluecupcoffee.test',
    '+959421000005',
    'active',
    '2025-05-01',
    NULL,
    'dept-kitchen',
    'Dishwasher',
    'Cash payout every Friday.',
    'Supports dish station and late close cleanup.',
    '2026-03-01 08:20:00+06:30',
    '2026-03-01 08:20:00+06:30'
  )
ON CONFLICT (id) DO UPDATE SET
  employee_code = EXCLUDED.employee_code,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_number = EXCLUDED.phone_number,
  status = EXCLUDED.status,
  hire_date = EXCLUDED.hire_date,
  end_date = EXCLUDED.end_date,
  department_id = EXCLUDED.department_id,
  job_title = EXCLUDED.job_title,
  payment_notes = EXCLUDED.payment_notes,
  notes = EXCLUDED.notes,
  updated_at = EXCLUDED.updated_at;

INSERT INTO employee_compensation_history (
  id,
  employee_id,
  pay_type,
  hourly_rate,
  monthly_salary,
  overtime_eligible,
  overtime_rate_mode,
  overtime_rate,
  overtime_multiplier,
  effective_from,
  effective_to,
  change_reason,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
  ('comp-maya-2026', 'emp-maya-lin', 'monthly', NULL, '1800000.00', FALSE, NULL, NULL, NULL, '2026-01-01', NULL, 'Current manager salary', 'seed-admin-bluecup', '2026-03-01 08:24:00+06:30', '2026-03-01 08:24:00+06:30'),
  ('comp-noah-2026', 'emp-noah-htet', 'hourly', '6500.00', NULL, TRUE, 'multiplier', NULL, '1.50', '2026-01-01', NULL, 'Current barista rate', 'seed-admin-bluecup', '2026-03-01 08:24:00+06:30', '2026-03-01 08:24:00+06:30'),
  ('comp-ava-2026', 'emp-ava-soe', 'hourly', '5500.00', NULL, TRUE, 'multiplier', NULL, '1.50', '2026-01-01', NULL, 'Current server rate', 'seed-admin-bluecup', '2026-03-01 08:24:00+06:30', '2026-03-01 08:24:00+06:30'),
  ('comp-liam-2026', 'emp-liam-zaw', 'monthly', NULL, '1400000.00', TRUE, 'multiplier', NULL, '1.50', '2026-01-01', NULL, 'Current cook salary', 'seed-admin-bluecup', '2026-03-01 08:24:00+06:30', '2026-03-01 08:24:00+06:30'),
  ('comp-ei-2026', 'emp-ei-nandar', 'hourly', '4500.00', NULL, FALSE, NULL, NULL, NULL, '2026-01-01', NULL, 'Current dishwasher rate', 'seed-admin-bluecup', '2026-03-01 08:24:00+06:30', '2026-03-01 08:24:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  pay_type = EXCLUDED.pay_type,
  hourly_rate = EXCLUDED.hourly_rate,
  monthly_salary = EXCLUDED.monthly_salary,
  overtime_eligible = EXCLUDED.overtime_eligible,
  overtime_rate_mode = EXCLUDED.overtime_rate_mode,
  overtime_rate = EXCLUDED.overtime_rate,
  overtime_multiplier = EXCLUDED.overtime_multiplier,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  change_reason = EXCLUDED.change_reason,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO employee_schedule_assignment (
  id,
  employee_id,
  work_schedule_id,
  effective_from,
  effective_to,
  assigned_by_user_id,
  created_at,
  updated_at
) VALUES
  ('assign-maya', 'emp-maya-lin', 'schedule-cafe-manager', '2026-01-01', NULL, 'seed-admin-bluecup', '2026-03-01 08:26:00+06:30', '2026-03-01 08:26:00+06:30'),
  ('assign-noah', 'emp-noah-htet', 'schedule-cafe-floor', '2026-01-01', NULL, 'seed-admin-bluecup', '2026-03-01 08:26:00+06:30', '2026-03-01 08:26:00+06:30'),
  ('assign-ava', 'emp-ava-soe', 'schedule-cafe-floor', '2026-01-01', NULL, 'seed-admin-bluecup', '2026-03-01 08:26:00+06:30', '2026-03-01 08:26:00+06:30'),
  ('assign-liam', 'emp-liam-zaw', 'schedule-cafe-kitchen', '2026-01-01', NULL, 'seed-admin-bluecup', '2026-03-01 08:26:00+06:30', '2026-03-01 08:26:00+06:30'),
  ('assign-ei', 'emp-ei-nandar', 'schedule-cafe-kitchen', '2026-01-01', NULL, 'seed-admin-bluecup', '2026-03-01 08:26:00+06:30', '2026-03-01 08:26:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  work_schedule_id = EXCLUDED.work_schedule_id,
  effective_from = EXCLUDED.effective_from,
  effective_to = EXCLUDED.effective_to,
  assigned_by_user_id = EXCLUDED.assigned_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO leave_balance_ledger (
  id,
  employee_id,
  leave_type_id,
  entry_type,
  units_delta,
  effective_date,
  reference_type,
  reference_id,
  reason,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
  ('grant-paid-maya', 'emp-maya-lin', 'leave-paid', 'grant', '10.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual paid leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-sick-maya', 'emp-maya-lin', 'leave-sick', 'grant', '6.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual sick leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-paid-noah', 'emp-noah-htet', 'leave-paid', 'grant', '10.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual paid leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-sick-noah', 'emp-noah-htet', 'leave-sick', 'grant', '6.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual sick leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-paid-ava', 'emp-ava-soe', 'leave-paid', 'grant', '10.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual paid leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-sick-ava', 'emp-ava-soe', 'leave-sick', 'grant', '6.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual sick leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-paid-liam', 'emp-liam-zaw', 'leave-paid', 'grant', '10.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual paid leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-sick-liam', 'emp-liam-zaw', 'leave-sick', 'grant', '6.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual sick leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-paid-ei', 'emp-ei-nandar', 'leave-paid', 'grant', '10.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual paid leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('grant-sick-ei', 'emp-ei-nandar', 'leave-sick', 'grant', '6.00', '2026-01-01', 'seed', 'seed-data-1', 'Annual sick leave allocation', 'seed-admin-bluecup', '2026-03-01 08:28:00+06:30', '2026-03-01 08:28:00+06:30'),
  ('usage-paid-noah-mar18', 'emp-noah-htet', 'leave-paid', 'usage', '-1.00', '2026-03-18', 'leave_request', 'leave-noah-paid-mar18', 'Approved annual leave', 'seed-admin-bluecup', '2026-03-18 18:00:00+06:30', '2026-03-18 18:00:00+06:30'),
  ('usage-sick-ei-mar12', 'emp-ei-nandar', 'leave-sick', 'usage', '-0.50', '2026-03-12', 'leave_request', 'leave-ei-sick-mar12', 'Approved half-day sick leave', 'seed-admin-bluecup', '2026-03-12 16:00:00+06:30', '2026-03-12 16:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  leave_type_id = EXCLUDED.leave_type_id,
  entry_type = EXCLUDED.entry_type,
  units_delta = EXCLUDED.units_delta,
  effective_date = EXCLUDED.effective_date,
  reference_type = EXCLUDED.reference_type,
  reference_id = EXCLUDED.reference_id,
  reason = EXCLUDED.reason,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO leave_request (
  id,
  employee_id,
  leave_type_id,
  start_date,
  end_date,
  start_portion,
  end_portion,
  requested_units,
  approved_units,
  status,
  requested_reason,
  decision_note,
  requested_by_user_id,
  approved_by_user_id,
  created_at,
  updated_at
) VALUES
  ('leave-noah-paid-mar18', 'emp-noah-htet', 'leave-paid', '2026-03-18', '2026-03-18', 'full_day', 'full_day', '1.00', '1.00', 'approved', 'Family event', 'Approved by manager', 'seed-admin-bluecup', 'seed-admin-bluecup', '2026-03-17 09:30:00+06:30', '2026-03-17 09:30:00+06:30'),
  ('leave-ei-sick-mar12', 'emp-ei-nandar', 'leave-sick', '2026-03-12', '2026-03-12', 'half_day_pm', 'half_day_pm', '0.50', '0.50', 'approved', 'Clinic visit', 'Approved half-day sick leave', 'seed-admin-bluecup', 'seed-admin-bluecup', '2026-03-12 08:30:00+06:30', '2026-03-12 08:30:00+06:30'),
  ('leave-ava-unpaid-apr03', 'emp-ava-soe', 'leave-unpaid', '2026-04-03', '2026-04-03', 'full_day', 'full_day', '1.00', NULL, 'pending', 'Personal errand', NULL, 'seed-admin-bluecup', NULL, '2026-03-29 14:00:00+06:30', '2026-03-29 14:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  leave_type_id = EXCLUDED.leave_type_id,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  start_portion = EXCLUDED.start_portion,
  end_portion = EXCLUDED.end_portion,
  requested_units = EXCLUDED.requested_units,
  approved_units = EXCLUDED.approved_units,
  status = EXCLUDED.status,
  requested_reason = EXCLUDED.requested_reason,
  decision_note = EXCLUDED.decision_note,
  requested_by_user_id = EXCLUDED.requested_by_user_id,
  approved_by_user_id = EXCLUDED.approved_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO holiday (
  id,
  holiday_date,
  name,
  type,
  business_closed,
  work_allowed,
  is_paid_holiday,
  notes,
  created_at,
  updated_at
) VALUES
  ('holiday-founders-day', '2026-03-27', 'Founders'' Day', 'public', TRUE, FALSE, TRUE, 'Public holiday for all staff.', '2026-03-01 08:32:00+06:30', '2026-03-01 08:32:00+06:30'),
  ('holiday-inventory-night', '2026-03-10', 'Inventory Count Day', 'company', FALSE, TRUE, FALSE, 'Store remains open with reduced service.', '2026-03-01 08:32:00+06:30', '2026-03-01 08:32:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  holiday_date = EXCLUDED.holiday_date,
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  business_closed = EXCLUDED.business_closed,
  work_allowed = EXCLUDED.work_allowed,
  is_paid_holiday = EXCLUDED.is_paid_holiday,
  notes = EXCLUDED.notes,
  updated_at = EXCLUDED.updated_at;

INSERT INTO attendance_entry (
  id,
  employee_id,
  work_date,
  segment_index,
  shift_label,
  planned_start_at,
  planned_end_at,
  actual_clock_in_at,
  actual_clock_out_at,
  break_minutes,
  status,
  approval_status,
  source,
  remarks,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
  ('att-maya-mar29', 'emp-maya-lin', '2026-03-29', 0, 'Manager shift', '2026-03-29 08:00:00+06:30', '2026-03-29 17:00:00+06:30', '2026-03-29 08:03:00+06:30', '2026-03-29 17:34:00+06:30', 60, 'present', 'approved', 'seed', 'Late close with supplier count.', 'seed-admin-bluecup', '2026-03-29 18:00:00+06:30', '2026-03-29 18:00:00+06:30'),
  ('att-noah-mar29', 'emp-noah-htet', '2026-03-29', 0, 'Opening floor', '2026-03-29 06:30:00+06:30', '2026-03-29 15:00:00+06:30', '2026-03-29 06:42:00+06:30', '2026-03-29 15:12:00+06:30', 45, 'late', 'approved', 'seed', 'Traffic delay at the market road.', 'seed-admin-bluecup', '2026-03-29 15:30:00+06:30', '2026-03-29 15:30:00+06:30'),
  ('att-ava-mar29', 'emp-ava-soe', '2026-03-29', 0, 'Floor service', '2026-03-29 07:00:00+06:30', '2026-03-29 15:00:00+06:30', '2026-03-29 06:58:00+06:30', '2026-03-29 15:08:00+06:30', 60, 'present', 'approved', 'seed', 'Handled breakfast rush and register close.', 'seed-admin-bluecup', '2026-03-29 15:30:00+06:30', '2026-03-29 15:30:00+06:30'),
  ('att-liam-mar29', 'emp-liam-zaw', '2026-03-29', 0, 'Kitchen prep', '2026-03-29 05:30:00+06:30', '2026-03-29 14:00:00+06:30', '2026-03-29 05:24:00+06:30', '2026-03-29 14:18:00+06:30', 60, 'present', 'approved', 'seed', 'Stayed late for pastry batch handoff.', 'seed-admin-bluecup', '2026-03-29 14:30:00+06:30', '2026-03-29 14:30:00+06:30'),
  ('att-ei-mar29', 'emp-ei-nandar', '2026-03-29', 0, 'Dish station', '2026-03-29 08:30:00+06:30', '2026-03-29 16:30:00+06:30', '2026-03-29 08:29:00+06:30', '2026-03-29 16:26:00+06:30', 45, 'present', 'approved', 'seed', 'Covered late cleanup support.', 'seed-admin-bluecup', '2026-03-29 16:40:00+06:30', '2026-03-29 16:40:00+06:30'),
  ('att-noah-leave-mar18', 'emp-noah-htet', '2026-03-18', 0, 'Annual leave', NULL, NULL, NULL, NULL, 0, 'paid_leave', 'approved', 'seed', 'Approved annual leave day.', 'seed-admin-bluecup', '2026-03-18 18:00:00+06:30', '2026-03-18 18:00:00+06:30'),
  ('att-ei-sick-mar12', 'emp-ei-nandar', '2026-03-12', 0, 'Half-day sick leave', NULL, NULL, NULL, NULL, 0, 'sick_leave', 'approved', 'seed', 'Approved clinic visit during afternoon shift.', 'seed-admin-bluecup', '2026-03-12 16:00:00+06:30', '2026-03-12 16:00:00+06:30'),
  ('att-ava-restday-mar30', 'emp-ava-soe', '2026-03-30', 0, 'Weekend service cover', NULL, NULL, '2026-03-30 08:00:00+06:30', '2026-03-30 12:15:00+06:30', 15, 'rest_day_worked', 'approved', 'seed', 'Filled a last-minute Sunday brunch gap.', 'seed-admin-bluecup', '2026-03-30 12:30:00+06:30', '2026-03-30 12:30:00+06:30'),
  ('att-liam-holiday-mar27', 'emp-liam-zaw', '2026-03-27', 0, 'Holiday prep shift', NULL, NULL, '2026-03-27 05:30:00+06:30', '2026-03-27 11:45:00+06:30', 30, 'holiday_worked', 'approved', 'seed', 'Prepared limited pastry batch before closure.', 'seed-admin-bluecup', '2026-03-27 12:00:00+06:30', '2026-03-27 12:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  work_date = EXCLUDED.work_date,
  segment_index = EXCLUDED.segment_index,
  shift_label = EXCLUDED.shift_label,
  planned_start_at = EXCLUDED.planned_start_at,
  planned_end_at = EXCLUDED.planned_end_at,
  actual_clock_in_at = EXCLUDED.actual_clock_in_at,
  actual_clock_out_at = EXCLUDED.actual_clock_out_at,
  break_minutes = EXCLUDED.break_minutes,
  status = EXCLUDED.status,
  approval_status = EXCLUDED.approval_status,
  source = EXCLUDED.source,
  remarks = EXCLUDED.remarks,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO overtime_entry (
  id,
  employee_id,
  attendance_entry_id,
  work_date,
  requested_minutes,
  approved_minutes,
  status,
  rate_mode,
  custom_rate,
  custom_multiplier,
  remarks,
  approved_by_user_id,
  created_at,
  updated_at
) VALUES
  ('ot-noah-mar29', 'emp-noah-htet', 'att-noah-mar29', '2026-03-29', 45, 45, 'approved', 'multiplier', NULL, '1.50', 'Extra close-down support after morning rush.', 'seed-admin-bluecup', '2026-03-29 15:20:00+06:30', '2026-03-29 15:20:00+06:30'),
  ('ot-ava-mar30', 'emp-ava-soe', 'att-ava-restday-mar30', '2026-03-30', 120, 120, 'approved', 'multiplier', NULL, '1.50', 'Rest day brunch cover.', 'seed-admin-bluecup', '2026-03-30 12:30:00+06:30', '2026-03-30 12:30:00+06:30'),
  ('ot-liam-mar27', 'emp-liam-zaw', 'att-liam-holiday-mar27', '2026-03-27', 60, 60, 'approved', 'multiplier', NULL, '2.00', 'Holiday bakery prep.', 'seed-admin-bluecup', '2026-03-27 12:00:00+06:30', '2026-03-27 12:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  attendance_entry_id = EXCLUDED.attendance_entry_id,
  work_date = EXCLUDED.work_date,
  requested_minutes = EXCLUDED.requested_minutes,
  approved_minutes = EXCLUDED.approved_minutes,
  status = EXCLUDED.status,
  rate_mode = EXCLUDED.rate_mode,
  custom_rate = EXCLUDED.custom_rate,
  custom_multiplier = EXCLUDED.custom_multiplier,
  remarks = EXCLUDED.remarks,
  approved_by_user_id = EXCLUDED.approved_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_period (
  id,
  start_date,
  end_date,
  frequency,
  status,
  locked_at,
  finalized_at,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
  ('period-2026-03', '2026-03-01', '2026-03-31', 'monthly', 'finalized', '2026-03-31 18:00:00+06:30', '2026-03-31 18:30:00+06:30', 'seed-admin-bluecup', '2026-03-01 09:00:00+06:30', '2026-03-31 18:30:00+06:30'),
  ('period-2026-04', '2026-04-01', '2026-04-30', 'monthly', 'draft', NULL, NULL, 'seed-admin-bluecup', '2026-03-31 19:00:00+06:30', '2026-03-31 19:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  frequency = EXCLUDED.frequency,
  status = EXCLUDED.status,
  locked_at = EXCLUDED.locked_at,
  finalized_at = EXCLUDED.finalized_at,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_run (
  id,
  payroll_period_id,
  payroll_policy_version_id,
  run_number,
  status,
  notes,
  calculated_at,
  finalized_at,
  triggered_by_user_id,
  created_at,
  updated_at
) VALUES
  ('run-2026-03-final', 'period-2026-03', 'policy-default', 1, 'finalized', 'March payroll finalized from approved attendance and leave.', '2026-03-31 17:45:00+06:30', '2026-03-31 18:30:00+06:30', 'seed-admin-bluecup', '2026-03-31 17:45:00+06:30', '2026-03-31 18:30:00+06:30'),
  ('run-2026-04-draft', 'period-2026-04', 'policy-default', 1, 'draft', 'April payroll draft initialized.', NULL, NULL, 'seed-admin-bluecup', '2026-03-31 19:00:00+06:30', '2026-03-31 19:00:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  payroll_period_id = EXCLUDED.payroll_period_id,
  payroll_policy_version_id = EXCLUDED.payroll_policy_version_id,
  run_number = EXCLUDED.run_number,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes,
  calculated_at = EXCLUDED.calculated_at,
  finalized_at = EXCLUDED.finalized_at,
  triggered_by_user_id = EXCLUDED.triggered_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_adjustment (
  id,
  employee_id,
  payroll_period_id,
  payroll_run_id,
  adjustment_type,
  label,
  amount,
  reason,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
  ('adj-maya-service-charge', 'emp-maya-lin', 'period-2026-03', 'run-2026-03-final', 'earning', 'Service charge allocation', '100000.00', 'March service charge share.', 'seed-admin-bluecup', '2026-03-31 18:05:00+06:30', '2026-03-31 18:05:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  employee_id = EXCLUDED.employee_id,
  payroll_period_id = EXCLUDED.payroll_period_id,
  payroll_run_id = EXCLUDED.payroll_run_id,
  adjustment_type = EXCLUDED.adjustment_type,
  label = EXCLUDED.label,
  amount = EXCLUDED.amount,
  reason = EXCLUDED.reason,
  created_by_user_id = EXCLUDED.created_by_user_id,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_result (
  id,
  payroll_run_id,
  employee_id,
  payable_minutes,
  overtime_minutes,
  unpaid_leave_units,
  regular_pay,
  overtime_pay,
  paid_leave_pay,
  sick_leave_pay,
  holiday_pay,
  deductions_total,
  adjustments_total,
  net_pay,
  notes,
  snapshot_json,
  created_at,
  updated_at
) VALUES
  ('payres-maya-mar', 'run-2026-03-final', 'emp-maya-lin', 10560, 0, '0.00', '1800000.00', '0.00', '0.00', '0.00', '120000.00', '0.00', '100000.00', '2020000.00', 'March finalized payroll for cafe manager.', '{"seed":"seed-data-1","role":"manager","period":"2026-03"}'::jsonb, '2026-03-31 18:10:00+06:30', '2026-03-31 18:10:00+06:30'),
  ('payres-noah-mar', 'run-2026-03-final', 'emp-noah-htet', 9600, 45, '0.00', '980000.00', '15000.00', '52000.00', '0.00', '26000.00', '0.00', '0.00', '1073000.00', 'March finalized payroll for barista.', '{"seed":"seed-data-1","role":"barista","period":"2026-03"}'::jsonb, '2026-03-31 18:10:00+06:30', '2026-03-31 18:10:00+06:30'),
  ('payres-ava-mar', 'run-2026-03-final', 'emp-ava-soe', 9240, 120, '0.00', '880000.00', '22000.00', '0.00', '0.00', '0.00', '0.00', '0.00', '902000.00', 'March finalized payroll for server.', '{"seed":"seed-data-1","role":"server","period":"2026-03"}'::jsonb, '2026-03-31 18:10:00+06:30', '2026-03-31 18:10:00+06:30'),
  ('payres-liam-mar', 'run-2026-03-final', 'emp-liam-zaw', 10080, 60, '0.00', '1400000.00', '30000.00', '0.00', '0.00', '70000.00', '0.00', '0.00', '1500000.00', 'March finalized payroll for cook.', '{"seed":"seed-data-1","role":"cook","period":"2026-03"}'::jsonb, '2026-03-31 18:10:00+06:30', '2026-03-31 18:10:00+06:30'),
  ('payres-ei-mar', 'run-2026-03-final', 'emp-ei-nandar', 9000, 0, '0.00', '690000.00', '0.00', '0.00', '18000.00', '0.00', '0.00', '0.00', '708000.00', 'March finalized payroll for dishwasher.', '{"seed":"seed-data-1","role":"dishwasher","period":"2026-03"}'::jsonb, '2026-03-31 18:10:00+06:30', '2026-03-31 18:10:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  payroll_run_id = EXCLUDED.payroll_run_id,
  employee_id = EXCLUDED.employee_id,
  payable_minutes = EXCLUDED.payable_minutes,
  overtime_minutes = EXCLUDED.overtime_minutes,
  unpaid_leave_units = EXCLUDED.unpaid_leave_units,
  regular_pay = EXCLUDED.regular_pay,
  overtime_pay = EXCLUDED.overtime_pay,
  paid_leave_pay = EXCLUDED.paid_leave_pay,
  sick_leave_pay = EXCLUDED.sick_leave_pay,
  holiday_pay = EXCLUDED.holiday_pay,
  deductions_total = EXCLUDED.deductions_total,
  adjustments_total = EXCLUDED.adjustments_total,
  net_pay = EXCLUDED.net_pay,
  notes = EXCLUDED.notes,
  snapshot_json = EXCLUDED.snapshot_json,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payroll_result_line (
  id,
  payroll_result_id,
  line_type,
  label,
  quantity,
  rate,
  amount,
  source_type,
  source_id,
  display_order,
  created_at
) VALUES
  ('line-maya-1', 'payres-maya-mar', 'regular_pay', 'Base salary', NULL, '1800000.00', '1800000.00', 'compensation', 'comp-maya-2026', 1, '2026-03-31 18:10:00+06:30'),
  ('line-maya-2', 'payres-maya-mar', 'holiday_pay', 'Paid holiday allowance', NULL, NULL, '120000.00', 'holiday', 'holiday-founders-day', 2, '2026-03-31 18:10:00+06:30'),
  ('line-maya-3', 'payres-maya-mar', 'manual_adjustment', 'Service charge allocation', NULL, NULL, '100000.00', 'adjustment', 'adj-maya-service-charge', 3, '2026-03-31 18:10:00+06:30'),
  ('line-noah-1', 'payres-noah-mar', 'regular_pay', 'Worked hours', '150.77', '6500.00', '980000.00', 'attendance', 'att-noah-mar29', 1, '2026-03-31 18:10:00+06:30'),
  ('line-noah-2', 'payres-noah-mar', 'paid_leave_pay', 'Approved paid leave', '1.00', '52000.00', '52000.00', 'leave_request', 'leave-noah-paid-mar18', 2, '2026-03-31 18:10:00+06:30'),
  ('line-noah-3', 'payres-noah-mar', 'overtime_pay', 'Approved overtime', '0.75', '20000.00', '15000.00', 'overtime', 'ot-noah-mar29', 3, '2026-03-31 18:10:00+06:30'),
  ('line-noah-4', 'payres-noah-mar', 'holiday_pay', 'Holiday support allowance', NULL, NULL, '26000.00', 'holiday', 'holiday-founders-day', 4, '2026-03-31 18:10:00+06:30'),
  ('line-ava-1', 'payres-ava-mar', 'regular_pay', 'Worked hours', '160.00', '5500.00', '880000.00', 'attendance', 'att-ava-mar29', 1, '2026-03-31 18:10:00+06:30'),
  ('line-ava-2', 'payres-ava-mar', 'overtime_pay', 'Rest day overtime', '4.00', '5500.00', '22000.00', 'overtime', 'ot-ava-mar30', 2, '2026-03-31 18:10:00+06:30'),
  ('line-liam-1', 'payres-liam-mar', 'regular_pay', 'Base salary', NULL, '1400000.00', '1400000.00', 'compensation', 'comp-liam-2026', 1, '2026-03-31 18:10:00+06:30'),
  ('line-liam-2', 'payres-liam-mar', 'overtime_pay', 'Approved overtime', '1.00', '30000.00', '30000.00', 'overtime', 'ot-liam-mar27', 2, '2026-03-31 18:10:00+06:30'),
  ('line-liam-3', 'payres-liam-mar', 'holiday_premium', 'Holiday work premium', NULL, NULL, '70000.00', 'attendance', 'att-liam-holiday-mar27', 3, '2026-03-31 18:10:00+06:30'),
  ('line-ei-1', 'payres-ei-mar', 'regular_pay', 'Worked hours', '153.33', '4500.00', '690000.00', 'attendance', 'att-ei-mar29', 1, '2026-03-31 18:10:00+06:30'),
  ('line-ei-2', 'payres-ei-mar', 'sick_leave_pay', 'Approved sick leave', '0.50', '36000.00', '18000.00', 'leave_request', 'leave-ei-sick-mar12', 2, '2026-03-31 18:10:00+06:30')
ON CONFLICT (id) DO UPDATE SET
  payroll_result_id = EXCLUDED.payroll_result_id,
  line_type = EXCLUDED.line_type,
  label = EXCLUDED.label,
  quantity = EXCLUDED.quantity,
  rate = EXCLUDED.rate,
  amount = EXCLUDED.amount,
  source_type = EXCLUDED.source_type,
  source_id = EXCLUDED.source_id,
  display_order = EXCLUDED.display_order,
  created_at = EXCLUDED.created_at;

INSERT INTO audit_log (
  id,
  actor_user_id,
  entity_type,
  entity_id,
  action,
  reason,
  before_json,
  after_json,
  metadata_json,
  created_at
) VALUES
  (
    'audit-employee-noah',
    'seed-admin-bluecup',
    'employee',
    'emp-noah-htet',
    'employee.create',
    'Initial coffee shop sample seed.',
    NULL,
    '{"employeeCode":"E002","fullName":"Noah Htet","jobTitle":"Barista"}'::jsonb,
    '{"seed":"seed-data-1"}'::jsonb,
    '2026-03-01 08:24:10+06:30'
  ),
  (
    'audit-leave-noah',
    'seed-admin-bluecup',
    'leave_request',
    'leave-noah-paid-mar18',
    'leave.create',
    'Approved annual leave during sample setup.',
    NULL,
    '{"employeeCode":"E002","status":"approved","leaveType":"PAID"}'::jsonb,
    '{"seed":"seed-data-1"}'::jsonb,
    '2026-03-17 09:31:00+06:30'
  ),
  (
    'audit-att-liam',
    'seed-admin-bluecup',
    'attendance_entry',
    'att-liam-holiday-mar27',
    'attendance.create',
    'Holiday shift recorded during sample setup.',
    NULL,
    '{"employeeCode":"E004","status":"holiday_worked","workDate":"2026-03-27"}'::jsonb,
    '{"seed":"seed-data-1"}'::jsonb,
    '2026-03-27 12:01:00+06:30'
  ),
  (
    'audit-payroll-mar',
    'seed-admin-bluecup',
    'payroll_period',
    'period-2026-03',
    'payroll_period.create',
    'March payroll seeded as finalized sample.',
    NULL,
    '{"startDate":"2026-03-01","endDate":"2026-03-31","status":"finalized"}'::jsonb,
    '{"seed":"seed-data-1"}'::jsonb,
    '2026-03-31 18:31:00+06:30'
  )
ON CONFLICT (id) DO UPDATE SET
  actor_user_id = EXCLUDED.actor_user_id,
  entity_type = EXCLUDED.entity_type,
  entity_id = EXCLUDED.entity_id,
  action = EXCLUDED.action,
  reason = EXCLUDED.reason,
  before_json = EXCLUDED.before_json,
  after_json = EXCLUDED.after_json,
  metadata_json = EXCLUDED.metadata_json,
  created_at = EXCLUDED.created_at;

COMMIT;
