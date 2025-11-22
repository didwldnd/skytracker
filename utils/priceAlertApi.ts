// utils/priceAlertApi.ts
import { apiFetch } from "./apiClient";

/**
 * 백엔드에서 내려오는 원본 응답 타입
 * (isActive / active 둘 다 케이스 대비)
 */
// 알림 등록 요청
export interface FlightAlertRequestDto {
  flightId?: number | null;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;   // Java: departureDate
  arrivalDate?: string | null;    // Java: arrivalDate (왕복일 때만)
  travelClass: string;
  currency: string;
  adults: number;
  lastCheckedPrice: number;
  newPrice?: number | null;
}

// 백엔드 응답 기준 Alert 아이템 타입
export interface FlightAlertItem {
  alertId: number;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;   // ✅ origin 대신
  arrivalAirport: string;     // ✅ destination 대신
  departureDate: string;
  arrivalDate: string | null; // ✅ returnDate 대신
  travelClass: string;
  currency: string;
  adults: number;
  lastCheckedPrice: number;
  newPrice: number | null;
  active: boolean;
}


/**
 * 내 알림 목록 조회
 * GET /api/flights/alerts
 */
// utils/priceAlertApi.ts
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

  const normalized: FlightAlertItem[] = list.map((item: any) => {
    // ✅ active / isActive 둘 다 대응
    const active =
      typeof item.active === "boolean"
        ? item.active
        : typeof item.isActive === "boolean"
        ? item.isActive
        : true;

    // ✅ 서버는 origin / destination 을 주고 있음
    const departureAirport = item.departureAirport ?? item.origin ?? "";
    const arrivalAirport = item.arrivalAirport ?? item.destination ?? "";

    // ✅ 왕복이면 arrivalDate 또는 returnDate 로 들어올 수 있음
    const arrivalDate = item.arrivalDate ?? item.returnDate ?? null;

    return {
      alertId: item.alertId,
      airlineCode: item.airlineCode,
      flightNumber: String(item.flightNumber),

      departureAirport,
      arrivalAirport,
      departureDate: item.departureDate,
      arrivalDate,

      travelClass: item.travelClass,
      currency: item.currency ?? "KRW",
      adults: typeof item.adults === "number" ? item.adults : 1,

      lastCheckedPrice:
        typeof item.lastCheckedPrice === "number"
          ? item.lastCheckedPrice
          : 0,
      newPrice:
        typeof item.newPrice === "number" ? item.newPrice : null,

      active,
    } as FlightAlertItem;
  });

  console.log(
    "🟢 [DEBUG] NORMALIZED ALERTS:",
    JSON.stringify(normalized, null, 2)
  );

  return normalized;
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


