import Image from "next/image";

export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/branding/logo.png"
      alt="SOIL — The Innovators"
      width={size}
      height={size}
      className={`rounded-md dark:bg-white dark:p-0.5 ${className}`}
      priority
    />
  );
}
