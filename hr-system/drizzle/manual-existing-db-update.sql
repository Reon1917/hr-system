ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "paid_leave_quota" numeric(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE "employee"
ADD COLUMN IF NOT EXISTS "sick_leave_quota" numeric(10, 2) NOT NULL DEFAULT 0;
