import Link from "next/link";
import { QrDisplay } from "./qr-display";

export default function AttendanceDisplayPage() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/admin/attendance" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to attendance
        </Link>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Scan to Check In</h1>
      <div className="mt-6 rounded-lg border border-border bg-surface p-8">
        <QrDisplay />
      </div>
    </div>
  );
}
