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
  try {
    const res = await http.post<FlightSearchResponseDto[]>(
      "/api/flights/search",
      request
    );

    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const cfg = err.config;

      // 🔵 최종 URL 로그 찍기
      console.log(
        "🔵 FINAL URL:",
        `${cfg?.baseURL || ""}${cfg?.url || ""}`
      );

      console.log("🔴 AXIOS ERROR:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
      });
    } else {
      console.log("🔴 UNKNOWN ERROR:", err);
    }

    throw err;
  }
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
