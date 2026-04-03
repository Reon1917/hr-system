# Small Business Staff Manager (v1) — Product Specification

## 1. Overview

This system is a lightweight staff attendance, leave, and payroll tracker designed for small businesses such as:

- convenience stores
- coffee shops
- salons
- small retail shops
- family-run businesses

The system replaces manual tracking in Excel or notebooks with a simple, structured workflow.

Version 1 is intentionally minimal and assumes:

- 1–2 admins (owner or manager)
- no employee self-service
- manual data entry (no automation, no hardware integration)

---

## 2. Product Scope (v1)

### Included

- Admin authentication
- Employee management
- Daily attendance recording
- Leave tracking (paid, sick, unpaid)
- Holiday definition
- Payroll calculation (hourly + monthly)
- Basic summaries

### Not Included

- Employee login
- Approval workflows
- Automated clock-in systems
- Advanced HR features (recruitment, performance, etc.)
- Tax and compliance automation
- Multi-branch or multi-company support

---

## 3. User Roles

## 3.1 Admin

Single role used by:

- owner
- manager

### Capabilities

- log in and access system
- manage employees
- record attendance
- manage leave
- define holidays
- calculate payroll
- view summaries

---

## 4. Core Modules

---

## 4.1 Authentication

### Features

- Admin login via email and password
- Session-based authentication
- Password reset (optional in v1)

### Rules

- Email must be unique
- Only active admin accounts can log in

### Edge Cases

- invalid login credentials
- duplicate admin email
- disabled admin account

---

## 4.2 Employee Management

### Features

Admin can:

- create employee
- edit employee
- deactivate employee

### Employee Fields

- name
- phone (optional)
- position (optional)
- status (active / inactive)
- hire date (optional)

### Pay Settings

- pay type: `hourly` or `monthly`
- hourly rate (if hourly)
- monthly salary (if monthly)
- overtime enabled (yes/no)
- overtime rate or multiplier

### Leave Settings

- paid leave quota
- sick leave quota

### Rules

- employee must have exactly one pay type
- inactive employees are excluded from new payroll calculations
- pay settings must exist before payroll

### Edge Cases

- employee without pay rate
- switching pay type mid-period
- employee resigns mid-month
- duplicate employee entries

---

## 4.3 Daily Attendance

### Features

Admin records one entry per employee per day.

### Attendance Record Fields

- date
- employee
- status
- start time (optional)
- end time (optional)
- break duration (optional)
- overtime hours (optional)
- note (optional)

### Status Types

- worked
- paid_leave
- sick_leave
- unpaid_leave
- holiday
- absent

### Rules

- one primary status per employee per day
- if status = worked:
  - working hours may be calculated from time inputs
- if not worked:
  - working hours = 0
- overtime is manually entered
- attendance can be edited anytime

### Edge Cases

- missing time values
- end time before start time
- duplicate entries for same date
- worked + leave conflict
- partial day (handled via manual adjustment or note)

---

## 4.4 Leave Tracking

### Features

Leave is recorded directly by admin.

### Leave Types

- paid leave
- sick leave
- unpaid leave

### Rules

- paid leave reduces paid leave quota
- sick leave reduces sick leave quota
- unpaid leave has no quota
- leave affects payroll

### Behavior

- leave is recorded as attendance status per day
- no approval workflow in v1

### Edge Cases

- leave exceeds quota
- leave entered after payroll calculated
- overlapping leave with holiday
- half-day leave (manual handling)

---

## 4.5 Holiday Management

### Features

Admin defines holidays:

- name
- date

### Rules

- holiday is treated as special attendance status
- behavior depends on payroll logic

### Edge Cases

- holiday added after attendance exists
- employee works on holiday
- holiday overlaps with leave

---

## 4.6 Payroll Calculation

### Features

Admin selects:

- payroll period (e.g. monthly)

System calculates per employee:

- base pay
- overtime pay
- leave deductions
- final salary

---

### Payroll Logic

## Hourly Employees

- total hours = sum of worked hours
- pay = total hours × hourly rate
- overtime pay = overtime hours × OT rate
- paid leave:
  - payable or not depending on business setting
- sick leave:
  - payable or not depending on business setting
- unpaid leave:
  - no pay

## Monthly Employees

- base salary = fixed monthly salary

### Deductions

- unpaid leave reduces salary proportionally
- absent may reduce salary if treated as unpaid

### Leave Impact

- paid leave within quota → no deduction
- sick leave within quota → no deduction (if policy allows)

### Overtime

- optional
- calculated using derived hourly rate or fixed OT rate

---

### Final Output Per Employee

- total worked days
- total leave days
- overtime hours
- base pay
- deductions
- overtime pay
- final payable amount

---

### Rules

- payroll is calculated on demand (no draft/final states)
- recalculation overwrites previous result
- calculations depend only on current data

---

### Edge Cases

- no attendance data
- employee joins mid-period
- employee leaves mid-period
- leave added after payroll viewed
- overtime added later
- negative salary (should be clamped or flagged)
- rounding differences

---

## 4.7 Summaries

### Features

Simple views only:

## Employee Summary

- total days worked
- leave used
- overtime hours

## Payroll Summary

- per employee total pay
- total payroll cost

## Attendance Overview

- daily or monthly view of status

### Rules

- summaries reflect latest data
- no historical locking in v1

---

## 5. System-Wide Rules

### Data Consistency

- employee must exist before attendance
- attendance drives payroll
- leave is represented via attendance

### Simplicity First

- no approval flows
- no multi-step workflows
- admin directly edits all data

### Manual Override Philosophy

- admin is source of truth
- system does not block most actions
- system may warn but not enforce strictly

---

## 6. Key Edge Cases

### Attendance

- missing days in period
- duplicate entries
- invalid time ranges
- manual corrections after payroll view

### Leave

- quota exceeded
- leave overlaps holiday
- leave after payroll calculation

### Payroll

- mixed hourly and monthly employees
- employee inactive mid-period
- no data for employee
- overtime added after calculation
- rounding issues

### Data

- employee deleted vs deactivated
- edits to past records
- inconsistent data due to manual entry

---

## 7. Assumptions

- small team (3–30 employees)
- single location business
- payroll done monthly
- admin is trusted actor
- compliance handled outside system
- calculations are simple and understandable

---

## 8. Product Positioning

This system is:

> A simple, owner-managed staff attendance, leave, and payroll tracker for small businesses.

It prioritizes:

- ease of use
- low setup effort
- flexibility over strict enforcement

It intentionally avoids:

- enterprise HR complexity
- heavy workflows
- automation dependencies

---

## 9. Future Expansion (Out of Scope for v1)

- employee self-service portal
- leave request + approval
- payslip generation (PDF)
- tax and social security support
- multi-branch support
- role-based permissions
- audit logs
- shift scheduling
- mobile app
- integration with POS or biometric devices

