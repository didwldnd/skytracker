// utils/patchStyleSheet.ts
import { StyleSheet } from "react-native";
import { getCurrentTheme } from "../context/ThemeContext";

function mapColor(value: any) {
  if (typeof value !== "string") return value;
  const lower = value.toLowerCase();
  const theme = getCurrentTheme(); // ⭐ 여기서 현재 테마 가져옴

  // 완전 하얀색 → 카드 배경
  if (["#ffffff", "#fff", "white"].includes(lower)) return theme.card;

  // 완전 검정 → 텍스트
  if (["#000000", "#000", "black"].includes(lower)) return theme.text;

  // 밝은 회색 계열 → 카드
  if (lower.startsWith("#f")) return theme.card;

  // 짙은 계열 → 텍스트
  if (lower.startsWith("#0") || lower.startsWith("#1") || lower.startsWith("#2"))
    return theme.text;

  return value;
}

function deepMap(obj: any): any {
  if (Array.isArray(obj)) return obj.map(deepMap);
  if (typeof obj !== "object" || obj === null) return obj;

  const result: any = {};
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (typeof v === "object") result[key] = deepMap(v);
    else if (["color", "backgroundColor", "borderColor"].includes(key))
      result[key] = mapColor(v);
    else result[key] = v;
  }
  return result;
}

export function patchStyleSheet() {
  const originalCreate = StyleSheet.create;

  StyleSheet.create = (styles: any) => {
    const patched = deepMap(styles);
    return originalCreate(patched);
  };
}
