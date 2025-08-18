import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { generateFavoriteKey } from "../utils/generateFavoriteKey"; // ★ 즐겨찾기용 키 (가격 포함)

type FavoriteContextType = {
  favorites: FlightSearchResponseDto[];
  toggleFavorite: (flight: FlightSearchResponseDto) => void;
  isFavorite: (flight: FlightSearchResponseDto) => boolean;
  isLoaded: boolean;
};

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

// ★ V2로 바꿔서 예전 저장값과 구분 (키 스키마 변경)
const FAVORITE_KEY = "FAVORITE_FLIGHTS_V2";

export const FavoriteProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<FlightSearchResponseDto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ★ 동일 운임(=가격 포함)인지 판단: generateFavoriteKey 사용
  const sameFavorite = (a: FlightSearchResponseDto, b: FlightSearchResponseDto) =>
    generateFavoriteKey(a) === generateFavoriteKey(b);

  const isFavorite = (flight: FlightSearchResponseDto) =>
    favorites.some((f) => sameFavorite(f, flight));

  const saveToStorage = async (data: FlightSearchResponseDto[]) => {
    try {
      await AsyncStorage.setItem(FAVORITE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("즐겨찾기 저장 실패:", e);
    }
  };

  const toggleFavorite = (flight: FlightSearchResponseDto) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => sameFavorite(f, flight));
      const next = exists ? prev.filter((f) => !sameFavorite(f, flight)) : [...prev, flight];
      // 저장은 비동기지만 상태는 즉시 반영
      saveToStorage(next);
      return next;
    });
  };

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(FAVORITE_KEY);
        if (saved) {
          // 혹시 중복이 있으면 키 기준으로 정리
          const arr: FlightSearchResponseDto[] = JSON.parse(saved);
          const seen = new Set<string>();
          const dedup = arr.filter((f) => {
            const k = generateFavoriteKey(f);
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          });
          setFavorites(dedup);
        }
      } catch (e) {
        console.error("즐겨찾기 로드 실패:", e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoaded }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => {
  const ctx = useContext(FavoriteContext);
  if (!ctx) throw new Error("useFavorite must be used within FavoriteProvider");
  return ctx;
};
