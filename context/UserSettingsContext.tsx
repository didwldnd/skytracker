import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserSettings = {
  preferredDepartureAirport: string | null; // IATA 코드 (예: "ICN")
};

type Ctx = {
  preferredDepartureAirport: string | null;
  setPreferredDepartureAirport: (code: string | null) => Promise<void>;
  loading: boolean;
};

const UserSettingsContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "@user_settings";

export const UserSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [preferredDepartureAirport, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 저장소 로드
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: UserSettings = JSON.parse(raw);
          setCode(parsed.preferredDepartureAirport ?? null);
        }
      } catch (e) {
        // noop: 실패해도 기본값 사용
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: string | null) => {
    const payload: UserSettings = { preferredDepartureAirport: next };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, []);

  const setPreferredDepartureAirport = useCallback(
    async (code: string | null) => {
      setCode(code);
      try {
        await persist(code);
      } catch {}
    },
    [persist]
  );

  return (
    <UserSettingsContext.Provider
      value={{
        preferredDepartureAirport,
        setPreferredDepartureAirport,
        loading,
      }}
    >
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const ctx = useContext(UserSettingsContext);
  if (!ctx)
    throw new Error("useUserSettings must be used within UserSettingsProvider");
  return ctx;
};
