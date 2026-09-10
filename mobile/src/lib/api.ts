// Base URL of the Next.js backend. Update for your dev machine's LAN IP
// when testing on a physical device (localhost won't resolve from the phone).
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

interface LoginMemberResult {
  token: string;
  user: {
    id: string;
    name: string;
    role: "employee" | "student";
    uniqueId?: string;
    coursesTaught?: string[];
  };
}

export function loginMember(cnic: string, dob: string): Promise<LoginMemberResult> {
  return apiFetch("/api/auth/login/member", {
    method: "POST",
    body: JSON.stringify({ cnic, dob }),
  });
}

export function getThemePreference(token: string): Promise<{ themePreference: "light" | "dark" | "system" }> {
  return apiFetch("/api/settings/theme", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

interface MarkAttendanceInput {
  qrToken: string;
  latitude: number;
  longitude: number;
  photo: string;
}

interface MarkAttendanceResult {
  date: string;
  checkInTime: string;
  status: "present" | "late";
}

export function markAttendance(token: string, input: MarkAttendanceInput): Promise<MarkAttendanceResult> {
  return apiFetch("/api/attendance/mark", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

export type TaskStatus = "pending" | "in-progress" | "completed";
export type TaskAudienceType = "course" | "department";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  note?: string;
  dueDate?: string;
}

export async function getMyTasks(token: string): Promise<Task[]> {
  const { tasks } = await apiFetch("/api/tasks/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return tasks;
}

export function updateTaskCompletion(
  token: string,
  id: string,
  input: { status: TaskStatus; note?: string }
): Promise<{ status: TaskStatus; note?: string }> {
  return apiFetch(`/api/tasks/${id}/complete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}

interface CreateTaskInput {
  audienceType: TaskAudienceType;
  audienceValue: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export function createTask(token: string, input: CreateTaskInput): Promise<{ id: string }> {
  return apiFetch("/api/tasks", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
}
