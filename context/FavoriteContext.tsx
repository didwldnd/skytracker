import React, { createContext, useContext, useEffect, useState } from "react";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoriteContextType = {
  favorites: FlightSearchResponseDto[];
  toggleFavorite: (flight: FlightSearchResponseDto) => void;
  isFavorite: (flight: FlightSearchResponseDto) => boolean;
  isLoaded: boolean;
};
// 타입 정의

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);
// createContext -> 전역 상태로 만드는 함수, FavotireContext라는 새로운 Context를 만듦
const FAVORITE_KEY = "FAVORITE_FLIGHTS";

export const FavoriteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<FlightSearchResponseDto[]>([]);

const getFlightKey = (flight: FlightSearchResponseDto) =>
  `${flight.airlineCode}-${flight.flightNumber}-${flight.departureAirport}-${flight.arrivalAirport}-${flight.outboundDepartureTime}-${flight.returnDepartureTime}`;

  const isSameFlight = (
    a: FlightSearchResponseDto,
    b: FlightSearchResponseDto
  ) => getFlightKey(a) === getFlightKey(b);

  // 즐겨찾기 중복방지

  const isFavorite = (flight: FlightSearchResponseDto) =>
    favorites.some((f) => isSameFlight(f, flight));
  // favorites 배열 중 하나라도 isSameFlight 조건 만족 시 true 변환

  const saveToStorage = async (data: FlightSearchResponseDto[]) => {
    try {
      await AsyncStorage.setItem(FAVORITE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("즐겨찾기 저장 실패:", e);
    }
  };

  const [isLoaded, setIsLoaded] = useState(false);

  const toggleFavorite = (flight: FlightSearchResponseDto) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => isSameFlight(f, flight));
      // some 메서드 => 조건 만족하는 요소 하나라도 있으면 true, 아니면 false 반환
      const updated = exists
        ? prev.filter((f) => !isSameFlight(f, flight))
        : [...prev, flight];
      saveToStorage(updated);
      return updated;
    });
  };
  // 즐찾 토글 (추가 또는 삭제)

  useEffect(() => {
    const loadFromStorage = async () => {
      const saved = await AsyncStorage.getItem(FAVORITE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
      setIsLoaded(true); 
    };
    loadFromStorage();
  }, []);

  return (
    <FavoriteContext.Provider
      value={{ favorites, toggleFavorite, isFavorite, isLoaded }}
    >
      {children}
    </FavoriteContext.Provider>
  );
  // context에 기능 제공
};

export const useFavorite = () => {
  const context = useContext(FavoriteContext);
  if (!context)
    throw new Error("useFavorite must be used within FavoriteProvider");
  return context;
};
