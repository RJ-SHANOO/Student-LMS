export const brand = {
  primaryBlue: "#2E5FA3",
  accentSkyBlue: "#5AB3E0",
  neutralGray: "#8A8A8A",
};

export const lightTheme = {
  background: "#F3F6FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF3FA",
  text: "#101828",
  textMuted: "#64748B",
  primary: brand.primaryBlue,
  primaryPressed: "#24487F",
  accent: brand.accentSkyBlue,
  accentSoft: "#EAF4FC",
  border: "#E2E8F0",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

export const darkTheme = {
  background: "#121212",
  surface: "#1E1E1E",
  surfaceAlt: "#262626",
  text: "#F5F5F5",
  textMuted: "#9CA3AF",
  primary: brand.accentSkyBlue,
  primaryPressed: "#7CC4E8",
  accent: brand.accentSkyBlue,
  accentSoft: "rgba(90, 179, 224, 0.15)",
  border: "#2C2C2C",
  success: "#22C55E",
  successSoft: "rgba(34, 197, 94, 0.15)",
  danger: "#F87171",
  dangerSoft: "rgba(248, 113, 113, 0.15)",
};

export type Theme = typeof lightTheme;

// A shared card elevation — iOS reads the shadow* properties, Android reads
// elevation; defining both here keeps every card consistent without each
// screen re-deriving platform-specific shadow values.
export const cardShadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
} as const;
