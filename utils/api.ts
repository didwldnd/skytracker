import axios from "axios";
import type { FlightSearchRequestDto } from "../types/FlightSearchRequestDto";
import type {
  FlightSearchResponseDto,
  BackendFlightSearchResponseDto,
} from "../types/FlightResultScreenDto";
import { API_BASE } from "../config/env";
import { mapBackendFlightToFrontend } from "./mapBackendFlight";
import { HotRouteSummaryDto } from "../types/HotRouteSummaryDto";

// ================================
// 🔧 공용 Axios 인스턴스
// ================================
const http = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ================================
// ✈️ 항공편 검색 (/api/flights/search)
// ================================
export const searchFlights = async (
  payload: FlightSearchRequestDto
): Promise<FlightSearchResponseDto[]> => {
  const res = await http.post<BackendFlightSearchResponseDto[]>(
    "/api/flights/search",
    payload
  );

  const rawList = res.data ?? [];

  const mapped = rawList.map((item, idx) => {
    const flight = mapBackendFlightToFrontend(item);
    console.log("✅ mapped flight", idx, flight);
    return flight;
  });

  return mapped;
};

// ================================
// 🔥 Hot Routes 가져오기 (/api/flights/hot-routes)
// ================================
export async function fetchHotRoutes(): Promise<HotRouteSummaryDto[]> {
  const res = await http.get<HotRouteSummaryDto[]>("/api/flights/hot-routes");
  return res.data ?? [];
}

// ================================
// 🔄 HotRoute → FlightSearchRequestDto 변환
// ================================
export function buildRequestFromHotRoute(
  item: HotRouteSummaryDto
): FlightSearchRequestDto {
  const isRoundTrip = !!item.arrivalDate;

  return {
    originLocationAirport: item.departureAirportCode,
    destinationLocationAirport: item.arrivalAirportCode,
    departureDate: item.departureDate,
    returnDate: item.arrivalDate ?? undefined, // 편도면 null
    currencyCode: "KRW",
    nonStop: false,
    roundTrip: isRoundTrip,
    travelClass: "ECONOMY",
    adults: 1, // 고정값 1
    max: 10,
  };
}
