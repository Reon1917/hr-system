ALTER TABLE "employee_compensation_history" ALTER COLUMN "pay_type" SET DATA TYPE text;--> statement-breakpoint
UPDATE "employee_compensation_history" SET "pay_type" = 'daily' WHERE "pay_type" = 'hourly';--> statement-breakpoint
DROP TYPE "public"."pay_type";--> statement-breakpoint
CREATE TYPE "public"."pay_type" AS ENUM('daily', 'monthly');--> statement-breakpoint
ALTER TABLE "employee_compensation_history" ALTER COLUMN "pay_type" SET DATA TYPE "public"."pay_type" USING "pay_type"::"public"."pay_type";--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "default_shift_label" text DEFAULT 'Day shift' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "default_shift_start_time" time DEFAULT '09:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "default_shift_end_time" time DEFAULT '18:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "default_shift_break_minutes" integer DEFAULT 60 NOT NULL;
