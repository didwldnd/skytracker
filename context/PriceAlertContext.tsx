import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { generateAlertKey } from "../utils/generateAlertKey";

// ★ 키 스키마 변경 → 기존 저장본과 구분하기 위해 V2로 버전업
const ALERT_STORAGE_KEY = "price_alerts_V2";

interface PriceAlertContextProps {
  alerts: Record<string, FlightSearchResponseDto>; // 키-값 맵으로 관리 → 조회 O(1)
  addAlert: (flight: FlightSearchResponseDto) => void;
  removeAlert: (flight: FlightSearchResponseDto) => void;
  isAlerted: (flight: FlightSearchResponseDto) => boolean;
}

const PriceAlertContext = createContext<PriceAlertContextProps | undefined>(undefined);

export const PriceAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<Record<string, FlightSearchResponseDto>>({});

  // 초기 로드(중복 있으면 키 기준으로 자동 dedup)
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

  const persist = async (map: Record<string, FlightSearchResponseDto>) => {
    setAlerts(map);
    try {
      await AsyncStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(Object.values(map)));
    } catch (e) {
      console.error("알림 저장 실패", e);
    }
  };

  const addAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (alerts[key]) return; // 이미 존재
    const next = { ...alerts, [key]: flight };
    persist(next);
  };

  const removeAlert = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    if (!alerts[key]) return;
    const next = { ...alerts };
    delete next[key];
    persist(next);
  };

  const isAlerted = (flight: FlightSearchResponseDto) => {
    const key = generateAlertKey(flight);
    return !!alerts[key];
  };

  return (
    <PriceAlertContext.Provider value={{ alerts, addAlert, removeAlert, isAlerted }}>
      {children}
    </PriceAlertContext.Provider>
  );
};

export const usePriceAlert = () => {
  const ctx = useContext(PriceAlertContext);
  if (!ctx) throw new Error("usePriceAlert must be used within PriceAlertProvider");
  return ctx;
};
