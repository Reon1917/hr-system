# Small Business HR System Specification

## 1. Overview

A simple HR and payroll support system for small businesses that want to stop tracking employees, attendance, leave, and salary in spreadsheets, Google Docs, or chat messages.

The system is designed for **small business owners and admins** who need a lightweight way to manage:

* employee records
* attendance and shifts
* leave tracking
* salary calculation
* overtime tracking
* holiday-aware payroll rules
* basic HR operations

This system is **not** intended to be a full enterprise HRMS. It focuses on practical day-to-day operations for smaller teams.

---

## 2. Goals

### 2.1 Primary Goals

* Let admin log in securely using email and password
* Let admin create and manage employee records
* Let admin record employee shifts and attendance
* Let admin manage leave balances and leave events
* Let system calculate payroll based on attendance, pay type, overtime, leave, and holidays
* Reduce manual payroll mistakes
* Replace spreadsheet-based tracking with a structured system

### 2.2 Non-Goals

* No recruitment module
* No performance review system
* No benefits enrollment
* No tax filing automation
* No advanced multi-country payroll engine
* No deep compliance engine for every labor law variation

---

## 3. User Roles

## 3.1 Admin

Admin can:

* log in with email and password
* create, edit, deactivate employee records
* define pay type and compensation settings
* set leave quotas
* record or edit employee shifts
* approve or reject leave requests
* define company holidays
* view payroll summaries
* export payroll and attendance records
* adjust payroll manually with reason logging

## 3.2 Employee

Employee access can be minimal or optional in version 1.

If employee-facing access exists, employee can:

* log in
* view profile
* view attendance history
* view leave balances
* view payslip summary
* request leave

For a very small first version, employee access may be skipped and admin handles everything.

---

## 4. Core Modules

## 4.1 Authentication

### Business Requirements

* Admin must log in using email and password
* Only authenticated admins can access HR management features
* Admin passwords must be stored securely
* Admin can log out
* Admin can reset password by email

### Business Rules

* Email must be unique per admin account
* Password must meet minimum security rules
* Inactive admin accounts cannot log in

### Edge Cases

* wrong password entered multiple times
* reset email requested for non-existent admin
* admin account disabled while logged in
* duplicate admin email during creation

---

## 4.2 Employee Management

### Business Requirements

Admin can create and manage employee records with fields such as:

* employee ID
* full name
* email
* phone number
* employment status
* hire date
* department or team
* position
* pay type: hourly or monthly
* base hourly rate or monthly salary
* overtime eligibility
* overtime rate or overtime multiplier
* paid leave quota
* sick leave quota
* default work schedule if needed
* bank/payment note fields if needed

### Business Rules

* Every employee must have exactly one active pay type at a time:

  * hourly
  * monthly
* Hourly employees use hourly rate for salary calculation
* Monthly employees use monthly salary as base salary
* Employee can be marked active, inactive, resigned, or terminated
* Inactive employees should not appear in active payroll runs unless there is unpaid final settlement work
* Employee record changes affecting payroll must be audit logged

### Edge Cases

* employee created without pay rate
* employee switched from hourly to monthly mid-period
* employee has multiple rate changes in same payroll period
* employee resigned mid-month
* employee rehired after being inactive
* employee duplicate with same email or phone
* employee has no leave quota set
* employee is created after payroll period already started

---

## 4.3 Shift and Attendance Tracking

### Business Requirements

Admin can record employee work shifts with:

* date
* shift type
* planned start time
* planned end time
* actual clock-in time
* actual clock-out time
* break duration
* attendance status
* overtime hours
* remarks

Attendance status may include:

* present
* late
* absent
* paid leave
* unpaid leave
* sick leave
* holiday worked
* holiday off
* rest day worked
* rest day off

### Business Rules

* A shift belongs to one employee and one work date
* Salary calculation must be based on approved attendance data
* Shift duration = clock-out - clock-in - unpaid break
* System should prevent impossible durations
* Attendance can be edited only by authorized admin
* If no clock-in/clock-out exists, shift may still be recorded manually by admin
* A shift may be marked as non-working due to leave or holiday

### Edge Cases

* clock-out earlier than clock-in
* overnight shift crossing midnight
* missing clock-in or missing clock-out
* duplicate shifts on same date
* employee marked both present and on leave
* break longer than shift duration
* admin enters future shift accidentally
* employee works on holiday
* employee works on rest day
* employee absent but later corrected to sick leave
* employee has multiple split shifts in one day

---

## 4.4 Leave Management

### Business Requirements

System must support at minimum:

* paid leave
* sick leave
* unpaid leave

Admin can:

* assign leave quotas
* record leave usage
* approve leave
* reject leave
* manually adjust balances with reason

If employee portal exists, employee can submit leave request.

### Business Rules

* Paid leave reduces paid leave quota
* Sick leave reduces sick leave quota
* Unpaid leave does not reduce salary quota balance but reduces payable amount where applicable
* Leave cannot exceed available balance unless admin override is allowed
* Half-day leave should be supported if business needs it
* Approved leave affects payroll
* Leave on public holiday should not double deduct quota unless business policy says otherwise

### Edge Cases

* leave request overlaps public holiday
* leave request overlaps weekend or rest day
* leave exceeds remaining quota
* leave entered after payroll already processed
* half-day leave with half-day attendance
* sick leave without remaining balance
* unpaid leave for monthly employee
* backdated leave correction
* leave request spanning multiple payroll periods

---

## 4.5 Holiday Management

### Business Requirements

Admin can define company-observed holidays:

* holiday name
* holiday date
* holiday type
* whether business is closed
* whether employees can still work on that day

### Business Rules

* Holiday dates affect attendance and payroll calculation
* If employee does not work on a recognized paid holiday, handling depends on company policy and employee pay type
* If employee works on a holiday, additional pay or alternate rule may apply
* Holiday settings should be reusable for payroll calculations

### Edge Cases

* holiday added after shifts already recorded
* holiday falls on employee leave day
* holiday falls on employee rest day
* holiday changed or removed after payroll draft generated
* regional or special one-time holiday

---

## 4.6 Payroll Calculation

### Business Requirements

System must calculate payroll for a selected pay period using:

* employee pay type
* hourly rate or monthly salary
* worked shifts
* overtime
* paid leave
* sick leave
* unpaid leave
* holiday rules
* manual adjustments if allowed

System should produce:

* payroll summary per employee
* total regular pay
* overtime pay
* leave deductions or paid leave effects
* holiday pay effects
* final payable amount

### Business Rules

#### For Hourly Employees

* Salary is based on approved payable hours
* Payable hours may include:

  * normal worked hours
  * paid leave hours if company policy allows
  * sick leave hours if company policy allows
* Unpaid leave hours are not payable
* Overtime is paid separately based on overtime rule

#### For Monthly Employees

* Base monthly salary is fixed for payroll period
* Deductions may apply for:

  * unpaid leave
  * unapproved absence
  * late penalties if business chooses to implement
* Paid leave and approved sick leave may not reduce salary if within quota
* Overtime may be added if employee is OT-eligible

#### Overtime

* Overtime must be calculated only for approved OT time
* OT may use:

  * fixed multiplier over hourly rate
  * custom OT rate
* Monthly employees may derive effective hourly rate from monthly salary if OT needs hourly conversion

#### Leave and Payroll Interaction

* Paid leave within available quota should remain payable
* Sick leave within available quota should remain payable if policy says so
* Unpaid leave reduces payable amount
* Once quota is exhausted, excess leave may convert to unpaid leave based on policy

#### Holiday Interaction

* Holiday worked may pay extra
* Holiday off may remain paid or unpaid depending on company policy and pay type
* Rules must be configurable because businesses differ

### Edge Cases

* employee has no attendance records in payroll period
* employee joins mid-period
* employee leaves mid-period
* employee has both hourly work and monthly arrangement due to migration
* payroll rerun after attendance edits
* OT approved after payroll draft created
* leave approved after payroll finalized
* negative payroll due to excessive deductions
* payroll period includes 28, 29, 30, or 31 days
* rounding issues in hours, OT, or salary
* employee works multiple rates in same period
* manual adjustments cause mismatch with raw calculated values

---

## 4.7 Payroll Rules Configuration

### Business Requirements

Admin should be able to define simple business rules such as:

* payroll frequency

  * monthly
  * semi-monthly
  * weekly
* overtime multiplier
* whether paid leave is payable
* whether sick leave is payable
* whether holidays are paid
* whether holiday work gets extra pay
* late tolerance rules
* unpaid break rules
* default working hours per day
* monthly salary deduction logic for unpaid leave

### Business Rules

* Rules should be centralized so payroll is consistent
* Rule changes should affect future payroll only unless admin intentionally recalculates old payroll
* Important rule changes must be audit logged

### Edge Cases

* rules changed in middle of payroll period
* old payroll viewed after rule updates
* company changes from 6-day week to 5-day week
* different departments use different schedules
* business wants holiday pay only for monthly employees

---

## 4.8 Basic HR Operations

### Business Requirements

System should support common scaled-down HR tasks:

* employee directory
* employment status tracking
* attendance overview
* leave balances
* holiday calendar
* payroll history
* notes or remarks on employee record
* basic document placeholders if needed
* deactivation instead of hard deletion

### Business Rules

* Important records should not be fully deleted once used in payroll
* Employee history should remain viewable for reporting
* Deactivated employees should remain in historical records

### Edge Cases

* admin tries to delete employee with payroll history
* employee record edited after resignation
* employee restored from inactive state
* old leave data missing from earlier periods

---

## 4.9 Reports and Exports

### Business Requirements

System should provide simple reports:

* attendance report
* leave usage report
* payroll summary report
* employee list
* overtime report
* holiday calendar report

Admin should be able to export data in a simple format such as CSV.

### Business Rules

* Reports should reflect approved data
* Draft payroll and finalized payroll should be distinguishable
* Exports should match what is visible in the system

### Edge Cases

* payroll report exported before final approval
* filtered report excludes inactive employees unexpectedly
* report totals mismatch due to unapproved shifts
* exported values differ from screen due to rounding

---

## 4.10 Audit and Change Tracking

### Business Requirements

System should log important changes such as:

* employee created or edited
* pay rate changed
* leave balance adjusted
* shift edited
* payroll recalculated
* manual payroll adjustment made
* holiday rule changed

### Business Rules

* Sensitive payroll-related changes must be traceable
* Each change should store:

  * who made the change
  * when it was made
  * what was changed
  * optional reason

### Edge Cases

* admin accidentally edits past payroll data
* conflicting edits by two admins
* payroll changes after export
* leave balance edited without explanation

---

## 5. Detailed Business Rules

## 5.1 Employee Pay Type Rules

* Employee must have one current pay model
* Hourly employees are paid based on approved payable hours
* Monthly employees are paid based on base monthly salary, subject to deduction rules
* OT eligibility can be true or false regardless of pay type
* Pay changes should have effective dates

## 5.2 Attendance Status Rules

Only one primary attendance status should apply per employee per shift segment unless split-day handling exists.

Examples:

* Present
* Paid Leave
* Sick Leave
* Unpaid Leave
* Absent
* Holiday Off
* Rest Day Off

If split-day handling is supported, one date can contain multiple entries, such as:

* half-day present
* half-day sick leave

## 5.3 Leave Balance Rules

* Leave balances are assigned per employee
* Leave balance can be annual or manually set
* Leave usage cannot reduce below zero unless admin override is allowed
* Leave carry-forward is optional and out of scope unless explicitly added

## 5.4 Payroll Finalization Rules

* Payroll should first exist as draft
* Draft payroll can be recalculated
* Finalized payroll should be locked from normal edits
* Any post-finalization change should require:

  * explicit override
  * audit note
  * possible payroll rerun or adjustment record

---

## 6. Important Edge Cases

## 6.1 Attendance and Shift Edge Cases

* overnight shifts crossing two dates
* missing clock-out
* accidental duplicate shift entry
* employee clocks in on holiday
* employee shift overlaps approved leave
* break time missing
* late entry of shifts after payroll cutoff

## 6.2 Leave Edge Cases

* leave overlaps with holiday
* leave overlaps with rest day
* sick leave quota exhausted
* paid leave approved after absence already recorded
* unpaid leave for salaried employee partial day
* leave spans two different months

## 6.3 Payroll Edge Cases

* employee joins in middle of payroll cycle
* employee resigns before period ends
* salary rate updated mid-cycle
* OT approved after payroll draft
* payroll rerun causes different amount
* monthly employee with multiple unpaid leave days
* hourly employee with no shifts but with paid leave
* negative or zero payroll
* rounding at minute or decimal hour level

## 6.4 Admin / Data Edge Cases

* two admins editing same record at same time
* payroll generated using incomplete attendance data
* holiday created after payroll draft
* employee deactivated while active payroll exists
* wrong employee assigned to shift
* admin manually overrides calculated salary without reason

---

## 7. Recommended Simplifications for Small Business Version

To keep the system realistic and easy for small business owners:

* one company only
* one currency only
* simple admin role only at first
* employee self-service optional
* no automatic biometric clock-in integration
* no tax engine in v1
* no complex benefits deductions in v1
* no multi-branch payroll logic in v1 unless required
* no advanced legal workflow engine

---

## 8. Suggested Functional Requirements

## FR-1 Authentication

The system shall allow admin users to log in using email and password.

## FR-2 Admin Account Security

The system shall support password reset and secure session handling for admin accounts.

## FR-3 Employee Creation

The system shall allow admin to create employee profiles with personal, employment, and pay details.

## FR-4 Employee Update

The system shall allow admin to edit employee data and mark employees as inactive.

## FR-5 Pay Type Assignment

The system shall allow admin to assign either hourly pay or monthly pay to each employee.

## FR-6 Leave Quota Setup

The system shall allow admin to assign paid leave and sick leave quotas to employees.

## FR-7 Shift Recording

The system shall allow admin to create and manage employee shift records.

## FR-8 Attendance Recording

The system shall allow admin to record actual clock-in and clock-out times or manually mark attendance status.

## FR-9 Leave Recording

The system shall allow admin to create, approve, reject, and edit leave entries.

## FR-10 Holiday Setup

The system shall allow admin to define company holidays and their payroll effects.

## FR-11 Overtime Recording

The system shall allow admin to record and approve overtime hours for eligible employees.

## FR-12 Payroll Calculation

The system shall calculate payroll based on employee pay type, shifts, leave, overtime, holidays, and company rules.

## FR-13 Payroll Draft and Finalize

The system shall support draft payroll generation and final payroll finalization.

## FR-14 Payroll Summary

The system shall show per-employee payroll breakdowns for a selected period.

## FR-15 Reporting

The system shall provide attendance, leave, overtime, payroll, and employee summary reports.

## FR-16 Export

The system shall allow admin to export selected reports and payroll summaries.

## FR-17 Audit Log

The system shall record critical actions affecting payroll, leave, and employee compensation data.

---

## 9. Suggested Non-Functional Requirements

## NFR-1 Usability

The system should be simple enough for non-technical small business owners or office admins.

## NFR-2 Accuracy

Payroll calculations must be deterministic and consistent for the same input data.

## NFR-3 Security

Passwords and sensitive employee compensation data must be protected.

## NFR-4 Reliability

The system should prevent accidental data loss and support safe editing of important records.

## NFR-5 Traceability

Important payroll-impacting changes must be auditable.

## NFR-6 Performance

The system should handle small business scale smoothly, for example tens to a few hundred employees.

---

## 10. Acceptance Logic Summary

A payroll result should only be considered valid when:

* employee pay settings are complete
* relevant attendance data exists or is intentionally marked
* leave data is approved or confirmed
* holiday rules are available
* overtime entries are approved
* payroll rules are defined
* calculations are generated for the correct period

---

## 11. Final Product Positioning

This HR system is best described as:

> A lightweight small-business HR and payroll operations system for managing employees, shifts, leave, holidays, overtime, and salary calculations without relying on spreadsheets.

It is focused on **clarity, simple operations, and payroll correctness** rather than enterprise complexity.

