import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ALERT_STORAGE_KEY = "price_alerts";

interface PriceAlertContextProps {
  alerts: FlightSearchResponseDto[];
  addAlert: (flight: FlightSearchResponseDto) => void;
  removeAlert: (flight: FlightSearchResponseDto) => void;
  isAlerted: (flight: FlightSearchResponseDto) => boolean;
}

const PriceAlertContext = createContext<PriceAlertContextProps | undefined>(
  undefined
);

export const PriceAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<FlightSearchResponseDto[]>([]);

  // 알림 식별 키 생성 (왕복 여부 포함)
  const getFlightKey = (flight: FlightSearchResponseDto) =>
    `${flight.airlineCode}-${flight.flightNumber}-${flight.departureAirport}-${
      flight.arrivalAirport
    }-${flight.outboundDepartureTime}-${
      flight.returnDepartureTime ?? "ONEWAY"
    }-${flight.travelClass}`;

  // 두 항공편이 동일한지 판단
  const isSameFlight = (
    a: FlightSearchResponseDto,
    b: FlightSearchResponseDto
  ) => getFlightKey(a) === getFlightKey(b);

  // 초기 AsyncStorage 로딩
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(ALERT_STORAGE_KEY);
        if (json) {
          const parsed: FlightSearchResponseDto[] = JSON.parse(json);
          setAlerts(parsed);
        }
      } catch (e) {
        console.error("알림 불러오기 실패", e);
      }
    })();
  }, []);

  // 저장 함수
  const saveToStorage = async (updated: FlightSearchResponseDto[]) => {
    try {
      setAlerts(updated);
      await AsyncStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("알림 저장 실패", e);
    }
  };

  // 알림 추가
  const addAlert = (flight: FlightSearchResponseDto) => {
    const alreadyExists = alerts.some((f) => isSameFlight(f, flight));
    if (!alreadyExists) {
      const updated = [...alerts, flight];
      saveToStorage(updated);
    }
  };

  // 알림 제거
  const removeAlert = (flight: FlightSearchResponseDto) => {
    const updated = alerts.filter((f) => !isSameFlight(f, flight));
    saveToStorage(updated);
  };

  // 알림 여부 확인
  const isAlerted = (flight: FlightSearchResponseDto) =>
    alerts.some((f) => isSameFlight(f, flight));

  return (
    <PriceAlertContext.Provider
      value={{ alerts, addAlert, removeAlert, isAlerted }}
    >
      {children}
    </PriceAlertContext.Provider>
  );
};

export const usePriceAlert = () => {
  const context = useContext(PriceAlertContext);
  if (!context) {
    throw new Error("usePriceAlert must be used within PriceAlertProvider");
  }
  return context;
};
