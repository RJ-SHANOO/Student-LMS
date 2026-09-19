import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { SplashScreen } from "@/components/splash-screen";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOIL — The Innovators",
  description: "Multi-tenant institute management platform",
  appleWebApp: {
    capable: true,
    title: "SOIL",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2e5fa3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeScript forced="light" />
        <RegisterServiceWorker />
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
