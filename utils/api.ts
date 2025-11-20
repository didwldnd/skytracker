import axios from "axios";
import type { FlightSearchRequestDto } from "../types/FlightSearchRequestDto";
import type { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { API_BASE } from "../config/env";

// Wi-Fi 바뀔 때 바꿔야 하는 기존 베이스
const API_BASE_URL =
  API_BASE;

// const POPULAR_BASE =
//   process.env.EXPO_PUBLIC_POPULAR_FLIGHTS_URL ??
//   `${API_BASE_URL}/flights/popular`; // 연결 실패 (미완) - 우선 가짜 데이터 사용

// 공용 axios 인스턴스(타임아웃/기본 헤더)
const http = axios.create({
  baseURL: API_BASE_URL, // 모든 요청 앞에 자동으로 붙는 주소
  timeout: 15_000, // 요청 15초동안 응답없으면 실패처리
  headers: { "Content-Type": "application/json" }, // 모든 요청은 JSON으로 처리
});

// ===== 기존 검색 =====
export async function searchFlights(request: FlightSearchRequestDto) {
  console.log("[searchFlights] POST /api/flights/search");

  const { data } = await http.post<FlightSearchResponseDto[]>(
    "/api/flights/search",   // 백엔드 컨트롤러 경로 그대로
    request
  );

  return data;
}

// // ===== 인기도시 → 항공편 DTO[] (카드 탭 시 호출) =====
// // 연동 실패, 네트워크 이슈 mock 데이터 사용
// export async function getTrackedFlightsByCity(
//   cityEn: string
// ): Promise<FlightSearchResponseDto[]> {
//   // GET {POPULAR_BASE}?city=Tokyo
//   const url = `${POPULAR_BASE}?city=${encodeURIComponent(cityEn)}`;
//   const { data } = await axios.get<FlightSearchResponseDto[]>(url, {
//     timeout: 15_000,
//   });
//   // return data.map(normalizeFlightData); // 정규화 쓰면 이 라인으로
//   return data;
// }
