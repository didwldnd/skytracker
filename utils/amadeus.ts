import axios, { AxiosError } from "axios";

const AMADEUS_API_BASE = "https://test.api.amadeus.com/v1";

function getAmadeusAccessToken(): string | undefined {
  const t = process.env.EXPO_PUBLIC_AMADEUS_ACCESS_TOKEN?.trim();
  return t || undefined;
}

/** 공항 자동완성용. 토큰은 .env의 EXPO_PUBLIC_AMADEUS_ACCESS_TOKEN (번들에 포함되므로 운영은 백엔드 프록시 권장). */
export async function fetchAirports(keyword: string) {
  if (keyword.trim().length < 2) return [];

  const token = getAmadeusAccessToken();
  if (!token) {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(
        "[amadeus] EXPO_PUBLIC_AMADEUS_ACCESS_TOKEN 없음 — 공항 검색 스킵 (.env 참고)"
      );
    }
    return [];
  }

  try {
    const response = await axios.get(`${AMADEUS_API_BASE}/reference-data/locations`, {
      params: {
        subType: "AIRPORT,CITY",
        keyword,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return (response.data.data || []).map((item: any) => ({
      city: item.address?.cityName ?? item.name,
      airport: item.name,
      code: item.iataCode,
    }));
  } catch (err) {
    const error = err as AxiosError;
    console.error("❌ Amadeus 공항 검색 실패:", error.response?.data || error.message);
    return [];
  }
}
