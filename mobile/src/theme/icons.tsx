import { Circle, Line, Path, Rect, Svg } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
}

const common = {
  fill: "none",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconQrScan({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M3 8V5a2 2 0 0 1 2-2h3" />
      <Path d="M21 8V5a2 2 0 0 1-2-2h-3" />
      <Path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <Path d="M21 16v3a2 2 0 0 1-2 2h-3" />
      <Line x1="3" y1="12" x2="21" y2="12" />
    </Svg>
  );
}

export function IconTasks({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Rect x="6" y="4" width="12" height="17" rx="2" />
      <Rect x="9" y="2" width="6" height="4" rx="1" />
      <Path d="M9 11h6M9 15h6M9 19h3" />
    </Svg>
  );
}

export function IconLogOut({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <Path d="M16 17l5-5-5-5" />
      <Path d="M21 12H9" />
    </Svg>
  );
}

export function IconChevronLeft({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function IconCheckCircle({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8.5 12.5l2.3 2.3L16 9.5" />
    </Svg>
  );
}

export function IconAlertCircle({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="12" cy="12" r="9" />
      <Line x1="12" y1="8" x2="12" y2="13" />
      <Circle cx="12" cy="16.5" r="0.9" fill={color} stroke="none" />
    </Svg>
  );
}

export function IconCamera({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
      <Circle cx="12" cy="12.5" r="3.5" />
    </Svg>
  );
}

export function IconClipboardList({ size = 24, color = "#000" }: IconProps) {
  return <IconTasks size={size} color={color} />;
}

export function IconUser({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="12" cy="8" r="3.5" />
      <Path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </Svg>
  );
}

export function IconClock({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...common} stroke={color}>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3.5 2" />
    </Svg>
  );
}
