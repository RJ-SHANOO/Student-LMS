# SOIL — Multi-Tenant Institute Management System

## Project Overview

**Product Name:** SOIL (tagline: "The Innovators")

This is a **multi-tenant SaaS platform** for educational institutes (coaching centers, training institutes, academies). Multiple institutes (target: 20–30+ tenants) can register independently and use their own isolated instance of the system — their own students, employees, attendance, fees, and settings — all running on a single shared codebase and database (logical multi-tenancy, not separate deployments).

Think of it like: one platform, many institutes, each institute's data completely isolated from others, each institute admin only sees their own data.

---

## 1. Multi-Tenancy Architecture

- **Model:** Shared database, shared schema, tenant isolation via `tenantId` (or `instituteId`) field on every collection/table.
- **Tenant Registration Flow:**
  1. A new institute owner visits the platform and registers (Institute Name, Owner Name, Email, Phone, Password).
  2. On registration, a new **Tenant** record is created with a unique `tenantId`.
  3. This registering user becomes that tenant's **Admin**.
  4. The tenant gets their own workspace — all subsequent data (students, employees, attendance, fees, tasks) is scoped to their `tenantId`.
- **Data Isolation Rules:**
  - Every query MUST filter by `tenantId`. No cross-tenant data leakage under any circumstance.
  - Every collection (Users, Students, Employees, Attendance, Fees, Tasks, Settings, ActivityLog) must include a `tenantId` field.
  - Authentication tokens (JWT) must encode `tenantId` + `role` + `userId`, and every protected API route must verify the requester's `tenantId` matches the resource being accessed.
- **Super Admin (Platform Owner) Role:**
  - A separate top-level role above tenant Admins — this is SOIL's own team (you).
  - Can view list of all registered institutes/tenants, activate/deactivate a tenant, and see basic platform-wide stats.
  - Does NOT see individual students/employees' private data by default — only tenant management.
- **Settings are per-tenant:** Institute Name, attendance rules (late time cutoff, QR/GPS radius), branding preferences (if any per-tenant customization is added later) all live under that tenant's own Settings document.

---

## 2. Branding & Theming

- **Product Name:** SOIL
- **Tagline:** "The Innovators"
- **Logo:** Provided by user (light-themed logo — blue/gray swirl design with wordmark "SOIL / THE INNOVATORS"). Logo file will be supplied separately and placed in `/assets/branding/logo.png` (and an SVG version if available).
- **Splash Screen (Mobile App):**
  - On app launch, show a **2-second animated splash screen** featuring the SOIL logo.
  - Animation: simple fade-in + slight scale-up (logo appears from 80% to 100% scale while fading in), then holds, then transitions to the login/dashboard screen.
  - Background should adapt to system theme (white/light background for light mode, dark background for dark mode) — but note the logo itself is designed for light backgrounds, so on dark mode splash, place the logo on a light rounded card/container OR use a subtle light-colored backdrop behind the logo so it remains legible. Do not distort or recolor the logo.
- **Theme Support — Light & Dark Mode (Both Web and Mobile):**
  - The entire system (Web Admin Panel + Mobile App) must support both Light and Dark themes.
  - Provide a theme toggle in Settings (and remember user's preference — respect system preference by default, allow manual override).
  - Since the logo is light-themed (works best on light backgrounds), when in Dark Mode, render the logo inside a small light-colored container/badge wherever it appears in headers/sidebars, rather than placing it directly on a dark background.
  - Use a consistent design token system (CSS variables / theme object) for colors, so switching themes is centralized, not hardcoded per component.
  - Reference color palette (from logo): Primary Blue (#2E5FA3-ish dark blue), Accent Sky Blue (#5AB3E0-ish), Neutral Gray (#8A8A8A-ish). Use these as brand accent colors in both themes; adjust backgrounds/surfaces per theme (light: white/light gray surfaces, dark: near-black/dark gray surfaces, e.g. `#121212`, `#1E1E1E`).

---

## 3. Tech Stack (Finalized — Zero Hosting Cost Priority)

| Layer | Technology |
|---|---|
| Web Frontend + Backend API | **Next.js** (React-based, API routes serve as backend) |
| Mobile App | **React Native (via Expo)** |
| Database | **MongoDB Atlas** (Free Tier) |
| Web Hosting / Backend Hosting | **Vercel** (Free Tier — Next.js deploys natively) |
| Auth | JWT-based sessions, tenant-aware |
| Domain | Optional — system must work fully on Vercel's free `.vercel.app` subdomain with no purchased domain required |
| Mobile Distribution | Expo-built APK, distributed directly (not necessarily published to Play Store initially) |

**Cost constraint (hard requirement):** The entire system — hosting, database, all core features (QR, GPS, Camera) — must run on **$0/month**, using only free tiers. Do not introduce any paid API/service (e.g., no Google Maps API, no paid SMS/OTP gateway, no paid cloud storage) unless explicitly approved later.

---

## 4. User Roles

| Role | Scope | Platform |
|---|---|---|
| **Super Admin** | Platform-wide (SOIL team) | Web |
| **Tenant Admin** | One institute, full control within it | Web |
| **Employee** (Teacher/Staff) | One institute, self-service | Mobile App |
| **Student / Intern** | One institute, self-service | Mobile App |

---

## 5. Core Modules

1. **Tenant Registration & Onboarding** — new institute signs up, creates their workspace.
2. **Auth** — Login for all roles. Tenant Admin/Employee/Student login via **CNIC + Date of Birth** (as in reference system). Super Admin login via standard email/password.
3. **Students & Interns Management** (Tenant Admin) — Add/View/Deactivate, auto-generated unique ID per tenant (e.g. `{TENANT}-DM-NAV-A-2026-001`), fields: Name, CNIC, DOB, Course/Dept, Batch, Status.
4. **Employees Management** (Tenant Admin) — Add/View employees, fields: Name, CNIC, Department, Designation, Status.
5. **Attendance Module** — see Section 6 below (QR + GPS + Camera).
6. **Fees Management** (Tenant Admin) — Generate fee record per student, track Total/Paid/Remaining, Status (Paid/Partial/Unpaid).
7. **Tasks Module** — Tenant Admin assigns tasks to Employees/Students; they view and mark complete.
8. **Activity Log** — Per-tenant log of key actions (logins, record changes) with timestamp.
9. **Settings** (Tenant Admin) — Institute Name, Late-After-Time cutoff, Office GPS coordinates + allowed radius (meters), theme preference.
10. **Super Admin Panel** — List all tenants, activate/deactivate a tenant, basic usage stats (tenant count, total users, etc.)

---

## 6. Attendance System — QR + GPS + Camera (Final Design)

This is the most critical and security-sensitive module. Combine three verification layers to prevent proxy/fraudulent attendance:

### Flow:
1. **QR Code (Rotating):** A QR code is displayed at the institute (e.g., on a screen/tablet at reception) and **regenerates every 30–60 seconds** with a new signed token (server-generated, short expiry). Student/Employee scans this QR using the mobile app.
2. **GPS Check (Fixed Radius):** Immediately after a successful QR scan, the app silently captures the device's current GPS coordinates and calculates distance from the institute's registered office coordinates (Haversine formula) — no external map API needed, just math. If outside the configured radius (e.g. 100m, configurable per tenant in Settings), reject the attendance attempt even if QR was valid.
3. **Camera (Auto-Selfie):** If GPS check passes, the app automatically triggers the front camera to capture a live selfie (no manual photo selection/upload — must be a live camera capture) and attaches it to that attendance record.
4. **Backend Validation:** The backend only marks attendance as valid if ALL THREE checks pass: (a) QR token is valid and not expired, (b) GPS coordinates within radius, (c) photo successfully captured and stored. Store: `userId`, `tenantId`, `date`, `checkInTime`, `checkOutTime`, `latitude`, `longitude`, `photoUrl`, `status` (present/late/absent), computed against the tenant's `lateAfterTime` setting.

### Implementation Notes (all free, no paid APIs):
- QR generation/scanning: `react-native-qrcode-svg` (generate) + `expo-barcode-scanner` or `expo-camera`'s barcode scanning (scan).
- GPS: `expo-location` — free, uses device's native GPS chip.
- Camera: `expo-camera` — free, uses device's native camera.
- Distance calculation: plain JS Haversine formula function — no external service.
- Photo storage: store as base64/binary in MongoDB initially (small images, keep size reasonable — compress before upload), or use a free-tier object storage later if needed (not required for MVP).

### Development Order for this module (build incrementally, test each layer before adding the next):
1. Phase 1: Static QR + basic scan-to-mark-attendance flow (no rotation yet).
2. Phase 2: Add QR rotation/expiry (time-based token).
3. Phase 3: Add GPS radius check.
4. Phase 4: Add camera auto-selfie capture.
5. Phase 5: Combine and test all three together end-to-end.

---

## 7. Database Schema (Guideline — adjust as needed during implementation)

All collections include `tenantId` except the top-level `Tenants` collection itself.

```
Tenants
├── _id, name, ownerName, ownerEmail, createdAt, status (active/inactive)

Users (Admin, Employee, Student — role field distinguishes)
├── _id, tenantId, name, cnic, dob, role, department, batch, status, uniqueId

Attendance
├── _id, tenantId, userId, date, checkInTime, checkOutTime,
│   latitude, longitude, photoUrl, qrTokenUsed, status

Fees
├── _id, tenantId, studentId, totalFee, paidAmount, remainingAmount, status, dueDate

Tasks
├── _id, tenantId, assignedTo, title, description, status, dueDate

ActivityLog
├── _id, tenantId, userId, action, description, timestamp

Settings
├── _id, tenantId, instituteName, officeLat, officeLng, officeRadius,
│   lateAfterTime, themePreference
```

---

## 8. Development Approach & Priorities

- Build **incrementally, module by module**. Do not attempt to scaffold the entire system in one go.
- Suggested build order:
  1. Project setup (Next.js + MongoDB connection + folder structure for web, mobile as separate Expo project)
  2. Multi-tenant data model + Tenant registration + Auth (CNIC+DOB login, JWT with tenantId/role)
  3. Tenant Admin Web Panel: Students & Interns module (CRUD)
  4. Employees module (CRUD)
  5. Attendance module — backend API first (mark/list attendance), then Web "All Attendance" view for Admin
  6. Mobile App (Expo): Splash screen with logo animation → Login → Attendance screen (QR scan + GPS + Camera flow, built in the phased order from Section 6)
  7. Fees module
  8. Tasks module
  9. Activity Log
  10. Settings (including theme toggle, office GPS/radius config, late-time config)
  11. Super Admin Panel (tenant list, activate/deactivate)
  12. Light/Dark theme pass across both Web and Mobile (if not already handled per-component during build)
- After each module: test it in isolation before moving to the next.
- Keep secrets (DB connection string, JWT secret) in environment variables (`.env.local` for Next.js, never commit to git).
- Favor free/open-source libraries throughout — no paid SDKs or APIs without explicit confirmation.

---

## 9. Assets Provided by User

- SOIL logo image (light-themed, blue/gray swirl design) — to be placed in project assets and used in: Web header/sidebar, Mobile splash screen, Mobile app icon.
- Additional company logo assets may be provided — check `/assets/branding/` folder once supplied.

---

## 10. Out of Scope (for now — do not build unless asked)

- Payment gateway integration for fee collection (fees module is just tracking/record-keeping for now, not online payment processing).
- SMS/Email notifications (no paid gateway budget).
- Play Store / App Store publishing (APK distribution only, for now).
- Per-tenant custom domain or white-labeling beyond logo/theme.

---

**Instruction to Claude Code:** Read this entire file before starting. Confirm understanding of the multi-tenant architecture and the phased attendance module approach before writing code. Work module-by-module per Section 8's order, and pause for review/testing after each module rather than building everything at once.
