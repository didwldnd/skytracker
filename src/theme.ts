// theme.ts

export type ThemeMode = "light" | "dark";
export type ThemePreference = "system" | ThemeMode;

export type AppTheme = {
  primary: string;
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  muted: string;
  danger: string;
  success: string;
  placeholder: string;
};

export const lightTheme: AppTheme = {
  primary: "#6ea1d4",
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: "#111827",
  subText: "#6B7280",
  border: "#E5E7EB",
  muted: "#F3F4F6",
  danger: "#EF4444",
  success: "#10B981",
  placeholder: "#999999"
};

export const darkTheme: AppTheme = {
  primary: "#6ea1d4",
  background: "#020617",
  card: "#0f172a",
  text: "#F9FAFB",
  subText: "#9CA3AF",
  border: "#1e293b",
  muted: "#0f172a",
  danger: "#F97373",
  success: "#34D399",
  placeholder: "#999999"
};
