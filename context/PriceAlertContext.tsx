import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { generateAlertKey } from "../utils/generateAlertKey";

const ALERT_STORAGE_KEY = "price_alerts_V3";

interface PriceAlertContextProps {
  alerts: Record<string, FlightSearchResponseDto>;
  addAlert: (flight: FlightSearchResponseDto) => void;
  removeAlert: (flight: FlightSearchResponseDto) => void;
  isAlerted: (flight: FlightSearchResponseDto) => boolean;
  resetAlertsFromServer: (flights: FlightSearchResponseDto[]) => void;
}

const PriceAlertContext = createContext<PriceAlertContextProps | undefined>(
  undefined
);

export const PriceAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Record<string, FlightSearchResponseDto>>(
    {}
  );

  // ---------- 초기 로드 ----------
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(ALERT_STORAGE_KEY);
        if (json) {
          const arr: FlightSearchResponseDto[] = JSON.parse(json);
          const map: Record<string, FlightSearchResponseDto> = {};
          for (const f of arr) {
            map[generateAlertKey(f)] = f;
          }
          setAlerts(map);
        }
      } catch (e) {
        console.error("알림 불러오기 실패", e);
      }
    })();
  }, []);

  // ---------- persist 함수(★ reset에서 호출됨) ----------
  const persist = useCallback(
    async (map: Record<string, FlightSearchResponseDto>) => {
      setAlerts(map);
      try {
        await AsyncStorage.setItem(
          ALERT_STORAGE_KEY,
          JSON.stringify(Object.values(map))
        );
      } catch (e) {
        console.error("알림 저장 실패", e);
      }
    },
    []
  );

  // ---------- 알리미 로컬 추가 ----------
  const addAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (alerts[key]) return;
    const next = { ...alerts, [key]: flight };
    persist(next);
  };

  // ---------- 알리미 로컬 삭제 ----------
  const removeAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (!alerts[key]) return;
    const next = { ...alerts };
    delete next[key];
    persist(next);
  };

  // ---------- 서버 기준으로 전체 동기화 (여기에서 persist 사용 가능) ----------
  const resetAlertsFromServer = useCallback(
    (flights: FlightSearchResponseDto[]) => {
      const map: Record<string, FlightSearchResponseDto> = {};
      for (const f of flights) {
        map[generateAlertKey(f)] = f;
      }
      persist(map);
    },
    [persist]
  );

  const isAlerted = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    return !!alerts[key];
  };

  return (
    <PriceAlertContext.Provider
      value={{
        alerts,
        addAlert,
        removeAlert,
        isAlerted,
        resetAlertsFromServer,
      }}
    >
      {children}
    </PriceAlertContext.Provider>
  );
};

export const usePriceAlert = () => {
  const ctx = useContext(PriceAlertContext);
  if (!ctx) {
    throw new Error("usePriceAlert must be used within PriceAlertProvider");
  }
  return ctx;
};
