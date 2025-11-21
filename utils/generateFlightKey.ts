// utils/generateFlightKey.ts
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

// 안전 파서
const toMs = (iso?: string | null) => {
  if (!iso) return 0;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
};


/**
 * 항공편 고유 키
 * - 왕복/편도 모두 커버
 * - 같은 편명이라도 시간/공항/클래스가 다르면 다른 키
 * - 시간은 epoch(ms)로 통일해 타임존/밀초 차이 제거
 */
export function generateFlightKey(f: FlightSearchResponseDto): string {
  const depMs =
    toMs(f.outboundDepartureTime) || toMs((f as any).departureTime);
  const arrMs =
    toMs(f.outboundArrivalTime) || toMs((f as any).arrivalTime);

  const retDepMs = toMs(f.returnDepartureTime);
  const retArrMs = toMs(f.returnArrivalTime);

  const airlineCode = f.airlineCode ?? "";
  const flightNumber = String(f.flightNumber ?? "").trim();
  const depApt = f.departureAirport ?? "";
  const arrApt = f.arrivalAirport ?? "";
  const tclass = f.travelClass ?? "";

  // 왕복 구분을 위해 복귀편 시간도 포함(편도면 0)
  return [
    "FLIGHT",
    airlineCode,
    flightNumber,
    depApt,
    arrApt,
    depMs,
    arrMs,
    retDepMs,
    retArrMs,
    tclass,
  ].join("|");
}
