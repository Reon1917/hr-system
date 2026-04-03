ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "paid_leave_quota" numeric(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "sick_leave_quota" numeric(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "default_shift_label" text NOT NULL DEFAULT 'Day shift';

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "default_shift_start_time" time NOT NULL DEFAULT '09:00';

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "default_shift_end_time" time NOT NULL DEFAULT '18:00';

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "default_shift_break_minutes" integer NOT NULL DEFAULT 60;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum enum
    JOIN pg_type type ON type.oid = enum.enumtypid
    WHERE type.typname = 'pay_type'
      AND enum.enumlabel = 'daily'
  ) THEN
    ALTER TYPE "pay_type" ADD VALUE 'daily';
  END IF;
END $$;

UPDATE "employee_compensation_history"
SET "pay_type" = 'daily'
WHERE "pay_type" = 'hourly';
