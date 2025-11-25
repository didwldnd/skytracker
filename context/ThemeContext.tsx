// context/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, lightTheme, darkTheme, ThemePreference } from "../src/theme";

type ThemeContextValue = {
  theme: AppTheme;
  resolvedMode: "light" | "dark";      // 실제 적용 모드
  themePreference: ThemePreference;    // 시스템/라이트/다크 설정
  setThemePreference: (mode: ThemePreference) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "APP_THEME_PREFERENCE";

// ⭐ 전역에서 접근 가능한 현재 테마 저장용
let _currentTheme: AppTheme = lightTheme;

// 외부(예: patchStyleSheet)에서 쓰는 getter
export function getCurrentTheme(): AppTheme {
  return _currentTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // 시스템 다크모드 변경 감지
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  // 저장된 테마 로드
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemePreferenceState(saved);
        }
      } catch (e) {
        console.log("Theme load error", e);
      }
    })();
  }, []);

  // 실제 적용 모드 계산
  const resolvedMode: "light" | "dark" = useMemo(() => {
    if (themePreference === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return themePreference;
  }, [themePreference, systemScheme]);
const isDark = resolvedMode === "dark";

  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  // ⭐ 매 렌더마다 전역 theme 갱신
  _currentTheme = theme;

  const setThemePreference = async (mode: ThemePreference) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.log("Theme save error", e);
    }
    setThemePreferenceState(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedMode,
        themePreference,
        setThemePreference,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
