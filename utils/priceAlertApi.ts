// utils/priceAlertApi.ts
import { apiFetch } from "./apiClient";

/**
 * 백엔드에서 내려오는 원본 응답 타입
 * (isActive / active 둘 다 케이스 대비)
 */
export interface FlightAlertRequestDto {
  flightId?: number | null;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  travelClass: string;
  currency: string;
  adults: number;
  lastCheckedPrice: number;
  newPrice?: number | null;
}

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
  targetPrice: number;
  lastCheckedPrice: number;
  active: boolean;
}

/**
 * 내 알림 목록 조회
 * GET /api/flights/alerts
 */
export async function fetchFlightAlerts(): Promise<FlightAlertItem[]> {
  const res = await apiFetch("/api/flights/alerts", { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    console.log("[fetchFlightAlerts] error:", res.status, text);
    throw new Error("알림 목록 조회에 실패했어요.");
  }

  const data: FlightAlertItem[] = await res.json();

  return data.map((item) => {
    const active =
      typeof item.active === "boolean"
        ? item.active
        : typeof item.active === "boolean"
        ? item.active
        : true;

    return {
      alertId: item.alertId,
      origin: item.origin,
      destination: item.destination,
      departureDate: item.departureDate,
      returnDate: item.returnDate,
      airlineCode: item.airlineCode,
      flightNumber: item.flightNumber,
      travelClass: item.travelClass,
      currency: item.currency,
      targetPrice: item.targetPrice,
      lastCheckedPrice: item.lastCheckedPrice,
      active,
    };
  });
}

/**
 * 알림 등록
 * POST /api/flights/alerts
 */
export async function registerFlightAlert(dto: FlightAlertRequestDto) {
  const res = await apiFetch("/api/flights/alerts", {
    method: "POST",
    body: JSON.stringify(dto),
  });

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  console.log("[registerFlightAlert] status:", res.status);
  console.log(
    "[registerFlightAlert] raw body (앞 200자):",
    rawText.slice(0, 200)
  );

  // 응답 코드가 200번대가 아니면 에러로 처리
  if (!res.ok) {
    throw new Error(`ALERT_REGISTER_FAILED_${res.status}`);
  }

  // JSON이면 파싱 시도, 아니면 그냥 null 반환 (더 이상 SyntaxError 안 남)
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(rawText);
    } catch (e) {
      console.log("[registerFlightAlert] JSON parse error:", e);
      return null;
    }
  }

  // JSON 아닌 응답(문자열/HTML)인 경우
  return null;
}

/**
 * 알림 on/off 토글
 * PATCH /api/flights/alerts/{alertId}/toggle
 */
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

/**
 * 알림 삭제
 * DELETE /api/flights/alerts/{alertId}
 */
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
