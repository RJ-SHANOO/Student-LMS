export const brand = {
  primaryBlue: "#2E5FA3",
  accentSkyBlue: "#5AB3E0",
  neutralGray: "#8A8A8A",
};

export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#1A1A1A",
  textMuted: brand.neutralGray,
  primary: brand.primaryBlue,
  accent: brand.accentSkyBlue,
  border: "#E0E0E0",
};

export const darkTheme = {
  background: "#121212",
  surface: "#1E1E1E",
  text: "#F5F5F5",
  textMuted: brand.neutralGray,
  primary: brand.accentSkyBlue,
  accent: brand.accentSkyBlue,
  border: "#2C2C2C",
};

export type Theme = typeof lightTheme;
