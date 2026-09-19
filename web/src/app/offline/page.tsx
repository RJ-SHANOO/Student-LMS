import { Logo } from "@/components/logo";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Logo size={72} />
      <h1 className="text-lg font-semibold text-foreground">You&apos;re offline</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        SOIL needs a connection to load this page. Reconnect and try again.
      </p>
    </main>
  );
}
