import React, { createContext, useContext, useState } from "react";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

type FavoriteContextType = {
  favorites: FlightSearchResponseDto[];
  toggleFavorite: (flight: FlightSearchResponseDto) => void;
  isFavorite: (flight: FlightSearchResponseDto) => boolean;
};
// 타입 정의

const FavoriteContext = createContext<FavoriteContextType | undefined>(
  undefined
);
// createContext -> 전역 상태로 만드는 함수, FavotireContext라는 새로운 Context를 만듦

export const FavoriteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavorites] = useState<FlightSearchResponseDto[]>([]);

  const isSameFlight = (
    a: FlightSearchResponseDto,
    b: FlightSearchResponseDto
  ) =>
    a.flightNumber === b.flightNumber &&
    a.departureAirport === b.departureAirport &&
    a.arrivalAirport === b.arrivalAirport &&
    a.departureTime === b.departureTime;
  // 즐겨찾기 중복방지

  const isFavorite = (flight: FlightSearchResponseDto) =>
    favorites.some((f) => isSameFlight(f, flight));
  // favorites 배열 중 하나라도 isSameFlight 조건 만족 시 true 변환

  const toggleFavorite = (flight: FlightSearchResponseDto) => {
    if (isFavorite(flight)) {
      setFavorites((prev) => prev.filter((f) => !isSameFlight(f, flight)));
    } else {
      setFavorites((prev) => [...prev, flight]);
    }
  };
  // 즐찾 토글

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
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
