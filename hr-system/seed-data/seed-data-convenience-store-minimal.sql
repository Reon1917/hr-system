-- Minimal convenience store reset seed
-- Clears any failed transaction state, then loads a fresh dev dataset.
--
-- Admin login:
--   email: linmyatphyo03@gmail.com
--   password: CoffeeShopAdmin123!
--
-- Usage:
--   psql "$DATABASE_URL" -f seed-data/seed-data-convenience-store-minimal.sql
--
-- Note:
--   Run the latest schema migration first if your database has not been updated
--   for the monthly + daily pay model and employee default shifts.

ROLLBACK;

BEGIN;

TRUNCATE TABLE
  "payroll_result_line",
  "payroll_result",
  "payroll_adjustment",
  "payroll_run",
  "payroll_period",
  "overtime_entry",
  "attendance_entry",
  "leave_balance_ledger",
  "leave_request",
  "leave_type",
  "employee_schedule_assignment",
  "work_schedule",
  "employee_compensation_history",
  "holiday",
  "employee",
  "department",
  "payroll_policy_version",
  "audit_log",
  "account",
  "session",
  "verification",
  "user",
  "company_settings"
RESTART IDENTITY CASCADE;

INSERT INTO "user" (
  id,
  name,
  email,
  email_verified,
  created_at,
  updated_at,
  role,
  is_active
) VALUES (
  'seed-admin-baanjai',
  'Lin Myat Phyo',
  'linmyatphyo03@gmail.com',
  TRUE,
  NOW(),
  NOW(),
  'admin',
  TRUE
);

INSERT INTO "account" (
  id,
  account_id,
  provider_id,
  user_id,
  password,
  created_at,
  updated_at
) VALUES (
  'seed-account-baanjai-admin',
  'seed-admin-baanjai',
  'credential',
  'seed-admin-baanjai',
  '2fa791c90e7044cdc6ce26b3d0e6eae5:41919d97f74f0e253ab9dd9727cb3847be8d3c6f95acfd08c23a643acda4c145ef46147b856b42cab23db6a75bae04cb51d2f5392d54ab71ba91a8577d07a963',
  NOW(),
  NOW()
);

INSERT INTO "company_settings" (
  id,
  business_name,
  timezone,
  currency_code,
  week_starts_on,
  created_at,
  updated_at
) VALUES (
  'main',
  'Baan Jai Convenience Store',
  'Asia/Bangkok',
  'THB',
  1,
  NOW(),
  NOW()
);

INSERT INTO "payroll_policy_version" (
  id,
  effective_from,
  payroll_frequency,
  overtime_multiplier_default,
  paid_leave_payable,
  sick_leave_payable,
  holidays_paid,
  default_work_minutes_per_day,
  monthly_deduction_method,
  notes,
  created_at,
  updated_at
) VALUES (
  'policy-default',
  '2026-01-01',
  'monthly',
  '1.50',
  TRUE,
  TRUE,
  TRUE,
  480,
  'calendar_days',
  'Minimal monthly payroll policy for a Thai convenience store.',
  NOW(),
  NOW()
);

INSERT INTO "employee" (
  id,
  employee_code,
  full_name,
  phone_number,
  hire_date,
  job_title,
  default_shift_label,
  default_shift_start_time,
  default_shift_end_time,
  default_shift_break_minutes,
  paid_leave_quota,
  sick_leave_quota
) VALUES
  (
    'emp-manager-001',
    'EMP-001',
    'Lin Myat Phyo',
    '+66810000001',
    '2026-01-01',
    'Manager',
    'Manager shift',
    '08:00',
    '17:30',
    60,
    '6.00',
    '6.00'
  ),
  (
    'emp-cashier-001',
    'EMP-002',
    'Mali Srisai',
    '+66810000002',
    '2026-01-01',
    'Cashier',
    'Morning cashier',
    '06:30',
    '15:00',
    60,
    '6.00',
    '6.00'
  ),
  (
    'emp-cashier-002',
    'EMP-003',
    'Pimlada Chaiyo',
    '+66810000003',
    '2026-01-01',
    'Cashier',
    'Evening cashier',
    '13:00',
    '21:30',
    60,
    '6.00',
    '6.00'
  ),
  (
    'emp-helper-001',
    'EMP-004',
    'Vee Somboon',
    '+66810000004',
    '2026-01-01',
    'Helper',
    'Store helper',
    '08:30',
    '17:30',
    60,
    '6.00',
    '6.00'
  );

INSERT INTO "employee_compensation_history" (
  id,
  employee_id,
  pay_type,
  hourly_rate,
  monthly_salary,
  overtime_eligible,
  overtime_rate_mode,
  overtime_multiplier,
  effective_from,
  change_reason,
  created_at,
  updated_at
) VALUES
  (
    'comp-manager-current',
    'emp-manager-001',
    'monthly',
    NULL,
    '24000.00',
    FALSE,
    NULL,
    NULL,
    '2026-01-01',
    'Initial seeded monthly salary',
    NOW(),
    NOW()
  ),
  (
    'comp-cashier-001-current',
    'emp-cashier-001',
    'daily',
    '480.00',
    NULL,
    TRUE,
    'multiplier',
    '1.50',
    '2026-01-01',
    'Initial seeded daily rate',
    NOW(),
    NOW()
  ),
  (
    'comp-cashier-002-current',
    'emp-cashier-002',
    'daily',
    '500.00',
    NULL,
    TRUE,
    'multiplier',
    '1.50',
    '2026-01-01',
    'Initial seeded daily rate',
    NOW(),
    NOW()
  ),
  (
    'comp-helper-current',
    'emp-helper-001',
    'daily',
    '420.00',
    NULL,
    TRUE,
    'multiplier',
    '1.50',
    '2026-01-01',
    'Initial seeded daily rate',
    NOW(),
    NOW()
  );

INSERT INTO "holiday" (
  id,
  holiday_date,
  name
) VALUES
  (
    'holiday-songkran-2026',
    '2026-04-13',
    'Songkran Holiday'
  ),
  (
    'holiday-labour-day-2026',
    '2026-05-01',
    'Labour Day'
  );

COMMIT;
