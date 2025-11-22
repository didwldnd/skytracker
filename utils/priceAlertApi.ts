// utils/priceAlertApi.ts
import { apiFetch } from "./apiClient";

/* =========================================================
   1) 요청 DTO (백엔드 기준으로 전체 재작성)
   ========================================================= */
export interface FlightAlertRequestDto {
  flightId?: number | null;
  airlineCode: string;
  flightNumber: string;
  originLocationAirport: string;
  destinationLocationAirport: string;
  departureDate: string;
  returnDate?: string | null;
  nonStop: boolean;
  roundTrip: boolean;
  travelClass: string;
  currency: string;
  adults: number;
  lastCheckedPrice: number;
  newPrice?: number | null;
}


/* =========================================================
   2) 응답 DTO 1:1 매칭
   ========================================================= */
export interface FlightAlertItem {
  alertId: number;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;

  airlineCode: string;
  flightNumber: string;
  travelClass: string;
  currency: string;

  targetPrice: number | null;
  lastCheckedPrice: number;
  isActive: boolean;
  nonStop: boolean;
  roundTrip: boolean;
}


/* =========================================================
   3) 알림 목록 조회 (GET)
   ========================================================= */
export async function fetchFlightAlerts(): Promise<FlightAlertItem[]> {
  const res = await apiFetch("/api/flights/alerts", { method: "GET" });

  console.log("[fetchFlightAlerts] status:", res.status);

  if (!res.ok) {
    const text = await res.text();
    console.log("[fetchFlightAlerts] error:", res.status, text);
    throw new Error("알림 목록 조회에 실패했어요.");
  }

  const raw = await res.json();
  console.log(
    "🔵 [DEBUG] RAW ALERT JSON FROM SERVER:",
    JSON.stringify(raw, null, 2)
  );

  const list = Array.isArray(raw) ? raw : [];

  const normalized: FlightAlertItem[] = list.map((item: any) => ({
    alertId: item.alertId,
    origin: item.origin,
    destination: item.destination,
    departureDate: item.departureDate,
    returnDate: item.returnDate ?? null,

    airlineCode: item.airlineCode,
    flightNumber: String(item.flightNumber),
    travelClass: item.travelClass,
    currency: item.currency ?? "KRW",

    targetPrice:
      typeof item.targetPrice === "number" ? item.targetPrice : null,
    lastCheckedPrice:
      typeof item.lastCheckedPrice === "number"
        ? item.lastCheckedPrice
        : 0,

    isActive:
      typeof item.isActive === "boolean" ? item.isActive : true,
    nonStop: !!item.nonStop,
    roundTrip: !!item.roundTrip,
  }));

  console.log(
    "🟢 [DEBUG] NORMALIZED ALERTS:",
    JSON.stringify(normalized, null, 2)
  );

  return normalized;
}



/* =========================================================
   4) 알림 등록 (POST)
   ========================================================= */
export async function registerFlightAlert(dto: FlightAlertRequestDto) {
  const res = await apiFetch("/api/flights/alerts", {
    method: "POST",
    body: JSON.stringify(dto),
  });

  const rawText = await res.text();
  console.log("[registerFlightAlert] status:", res.status);
  console.log("[registerFlightAlert] raw:", rawText.slice(0, 200));

  if (!res.ok) {
    throw new Error(`ALERT_REGISTER_FAILED_${res.status}`);
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}


/* =========================================================
   5) 알림 토글 (PATCH)
   ========================================================= */
export async function toggleFlightAlert(alertId: number) {
  const res = await apiFetch(`/api/flights/alerts/${alertId}/toggle`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("[toggleFlightAlert] error:", res.status, text);
    throw new Error("알림 설정 변경에 실패했어요.");
  }
}


/* =========================================================
   6) 알림 삭제 (DELETE)
   ========================================================= */
export async function deleteFlightAlert(alertId: number) {
  const res = await apiFetch(`/api/flights/alerts/${alertId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("[deleteFlightAlert] error:", res.status, text);
    throw new Error("알림 삭제에 실패했어요.");
  }
}
