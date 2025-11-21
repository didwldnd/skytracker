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
  /**
   * 서버에서 가져온 알림 목록을 기준으로
   * 로컬 스냅샷에 "부족한 것만" 채워 넣는 용도
   * (이미 있는 알림은 덮어쓰지 않음)
   */
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

  // ---------- persist ----------
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

  // ---------- 알림 로컬 추가(검색 결과에서 알림 켤 때) ----------
  const addAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (alerts[key]) return;
    const next = { ...alerts, [key]: flight };
    persist(next);
  };

  // ---------- 알림 로컬 삭제(알림 끌 때/삭제할 때) ----------
  const removeAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (!alerts[key]) return;
    const next = { ...alerts };
    delete next[key];
    persist(next);
  };

  /**
   * 🔥 서버 기준으로 전체 동기화
   *
   * - 이미 로컬에 있는 알림(snapshots)은 유지
   * - 서버에서 새로 생긴 알림만 mapAlertToFlightDto 결과로 채워넣기
   * - 즉 "머지"만 하고, 기존 데이터는 절대 덮어쓰지 않는다
   */
  const resetAlertsFromServer = useCallback(
    (flights: FlightSearchResponseDto[]) => {
      const next: Record<string, FlightSearchResponseDto> = { ...alerts };

      for (const f of flights) {
        const key = generateAlertKey(f);
        if (!next[key]) {
          next[key] = f; // 로컬에 없을 때만 서버 데이터를 저장
        }
      }

      persist(next);
    },
    [alerts, persist]
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
