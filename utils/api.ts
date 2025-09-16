import axios from "axios";
import type { FlightSearchRequestDto } from "../types/FlightSearchRequestDto";
import type { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

// Wi-Fi 바뀔 때 바꿔야 하는 기존 베이스
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://10.200.98.137:8080/api";

// 인기도시 → 항공편 DTO 배열 엔드포인트(오버라이드 가능)
const POPULAR_BASE =
  process.env.EXPO_PUBLIC_POPULAR_FLIGHTS_URL ??
  `${API_BASE_URL}/flights/popular`; // 예: GET /api/flights/popular?city=Tokyo

// 공용 axios 인스턴스(타임아웃/기본 헤더)
const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ===== 기존 검색 =====
export async function searchFlights(request: FlightSearchRequestDto) {
  // POST /api/flights/search
  const { data } = await http.post<FlightSearchResponseDto[]>(
    "/flights/search",
    request
  );
  // return data.map(normalizeFlightData); // 정규화 쓰면 이 라인으로
  return data;
}

// ===== 인기도시 → 항공편 DTO[] (카드 탭 시 호출) =====
// 백엔드가 “도시 기준으로 가격 추적 결과 DTO[] 반환”이라고 했으니 그대로 받아서 Result 화면으로 넘기면 됨.
export async function getTrackedFlightsByCity(
  cityEn: string
): Promise<FlightSearchResponseDto[]> {
  // GET {POPULAR_BASE}?city=Tokyo
  const url = `${POPULAR_BASE}?city=${encodeURIComponent(cityEn)}`;
  const { data } = await axios.get<FlightSearchResponseDto[]>(url, {
    timeout: 15_000,
  });
  // return data.map(normalizeFlightData); // 정규화 쓰면 이 라인으로
  return data;
}
