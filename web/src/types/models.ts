import type { ObjectId } from "mongodb";

export type UserRole = "superadmin" | "admin" | "employee" | "student";
export type TenantStatus = "active" | "inactive";
export type AttendanceStatus = "present" | "late" | "absent";
export type FeeStatus = "paid" | "partial" | "unpaid";
export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskAudienceType = "course" | "department";
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
  course?: string;
  batch?: string;
  // Employees only.
  designation?: string;
  // Employees only — course codes (matches Student.course) this employee teaches.
  // Drives which courses they're allowed to assign tasks to.
  coursesTaught?: string[];
  status: "active" | "inactive";
  // Auto-generated for students as {tenantCode}-{department}-{course}-{batch}-{year}-{seq}.
  uniqueId?: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
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

// A task now targets a whole course or department, not one person — every
// student in that course (or employee in that department) sees it. Individual
// progress lives separately in TaskCompletion, one per (task, user).
export interface Task {
  _id?: ObjectId;
  tenantId: ObjectId;
  audienceType: TaskAudienceType;
  audienceValue: string;
  title: string;
  description?: string;
  dueDate?: Date;
  createdBy: ObjectId;
  createdAt: Date;
}

export interface TaskCompletion {
  _id?: ObjectId;
  tenantId: ObjectId;
  taskId: ObjectId;
  userId: ObjectId;
  status: TaskStatus;
  note?: string;
  updatedAt: Date;
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
