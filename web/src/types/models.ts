import type { ObjectId } from "mongodb";

export type UserRole = "superadmin" | "admin" | "employee" | "student";
export type TenantStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "late" | "absent";
export type FeeStatus = "paid" | "partial" | "unpaid";
export type TaskSubmissionStatus = "submitted" | "reviewed";
export type ThemePreference = "light" | "dark" | "system";

// SOIL's own team — platform-wide, not scoped to any tenant, kept in its own
// collection rather than Users (which is always tenantId-scoped by design).
export interface SuperAdmin {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  themePreference?: ThemePreference;
}

export interface Tenant {
  _id?: ObjectId;
  name: string;
  // Short unique uppercase abbreviation derived from `name` at registration (e.g. "NVTTC").
  // Used as the first segment of auto-generated student IDs.
  code: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: Date;
  status: TenantStatus;
}

export interface User {
  _id?: ObjectId;
  tenantId: ObjectId;
  name: string;
  // Admins authenticate with email+password. Employees/students authenticate with cnic+dob.
  cnic?: string;
  dob?: string;
  role: UserRole;
  department?: string;
  batch?: string;
  // Students only — the single course they're enrolled in.
  courseId?: ObjectId;
  // Employees only.
  designation?: string;
  // Employees only — the course(s) this employee is assigned to. Drives which
  // courses they're allowed to assign tasks to.
  courseIds?: ObjectId[];
  status: "active" | "inactive";
  // Auto-generated for students as {tenantCode}-{department}-{course}-{batch}-{year}-{seq}.
  uniqueId?: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
}

export interface Course {
  _id?: ObjectId;
  tenantId: ObjectId;
  name: string;
  // Short unique-per-tenant uppercase code, e.g. "NAV" — also used as the
  // course segment of a student's auto-generated unique ID.
  code: string;
  duration?: string;
  status: "active" | "inactive";
  createdAt: Date;
}

export interface Attendance {
  _id?: ObjectId;
  tenantId: ObjectId;
  userId: ObjectId;
  date: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  qrTokenUsed?: string;
  status: AttendanceStatus;
}

export interface Fee {
  _id?: ObjectId;
  tenantId: ObjectId;
  studentId: ObjectId;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  status: FeeStatus;
  dueDate: Date;
}

// An Employee creates a task for one course they're assigned to — every
// student enrolled in that course can see it and submit a file. Individual
// submissions live separately in TaskSubmission, one per (task, student).
export interface Task {
  _id?: ObjectId;
  tenantId: ObjectId;
  courseId: ObjectId;
  createdBy: ObjectId; // the employee who created/owns this task
  title: string;
  description?: string;
  dueDate?: Date;
  // Optional reference material the employee attaches at creation (e.g. instructions).
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: Date;
}

export interface TaskSubmission {
  _id?: ObjectId;
  tenantId: ObjectId;
  taskId: ObjectId;
  studentId: ObjectId;
  fileUrl: string;
  fileName: string;
  submittedAt: Date;
  status: TaskSubmissionStatus;
  remarks?: string;
  marks?: number;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
}

export interface ActivityLog {
  _id?: ObjectId;
  tenantId: ObjectId;
  userId: ObjectId;
  action: string;
  description?: string;
  timestamp: Date;
}

export interface Settings {
  _id?: ObjectId;
  tenantId: ObjectId;
  instituteName: string;
  officeLat?: number;
  officeLng?: number;
  officeRadius?: number;
  lateAfterTime?: string;
  themePreference?: ThemePreference;
}

export interface JwtPayload {
  userId: string;
  tenantId: string | null;
  role: UserRole;
}
