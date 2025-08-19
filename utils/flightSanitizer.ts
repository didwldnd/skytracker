// utils/flightSanitizer.ts
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

// 안전 파서
const isIso = (s?: string) => !!s && !Number.isNaN(Date.parse(s!));
const isFiniteNum = (n: any) => Number.isFinite(Number(n));

const makeDurationISO = (start?: string, end?: string) => {
  if (!isIso(start) || !isIso(end)) return "";
  const diffMs = Math.max(0, new Date(end!).getTime() - new Date(start!).getTime());
  const mins = Math.round(diffMs / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` || "PT0M";
};

// 어떤 입력이 와도 Flight 배열로 "강제 변환"
function coerceToArray(input: unknown): FlightSearchResponseDto[] {
  // 1) 이미 배열이면 그대로
  if (Array.isArray(input)) return input as FlightSearchResponseDto[];

  // 2) axios 스타일 { data: [...] }
  const data = (input as any)?.data;
  if (Array.isArray(data)) return data as FlightSearchResponseDto[];

  // 3) { results: [...] } 스타일
  const results = (input as any)?.results;
  if (Array.isArray(results)) return results as FlightSearchResponseDto[];

  // 4) 객체 속성들 중 배열인 것 하나라도 있으면 사용 (백엔드 불안정 대비)
  if (input && typeof input === "object") {
    for (const v of Object.values(input as Record<string, unknown>)) {
      if (Array.isArray(v)) return v as FlightSearchResponseDto[];
    }
  }

  // 5) 그 외에는 빈 배열
  return [];
}

// 화면용 정규화
export const normalizeForDisplay = (f: FlightSearchResponseDto): FlightSearchResponseDto => {
  const outboundDepartureTime = f.outboundDepartureTime || (f as any).departureTime || "";
  const outboundArrivalTime   = f.outboundArrivalTime   || (f as any).arrivalTime   || "";
  const outboundDuration      =
    f.outboundDuration || (f as any).duration || makeDurationISO(outboundDepartureTime, outboundArrivalTime);

  const returnDepartureTime = f.returnDepartureTime || "";
  const returnArrivalTime   = f.returnArrivalTime   || "";
  const returnDuration      = f.returnDuration || (returnDepartureTime && returnArrivalTime
    ? makeDurationISO(returnDepartureTime, returnArrivalTime)
    : "");

  return {
    ...f,
    outboundDepartureTime,
    outboundArrivalTime,
    outboundDuration,
    returnDepartureTime,
    returnArrivalTime,
    returnDuration,
    currency: f.currency || "KRW",
  };
};

// “화면에 보여줄 수 있는 항공편” 판정
export const isDisplayableFlight = (f: FlightSearchResponseDto) => {
  const okAirports = !!f.departureAirport && !!f.arrivalAirport;
  const okTimes    = isIso(f.outboundDepartureTime) && isIso(f.outboundArrivalTime);
  const okPrice    = isFiniteNum(f.price); // 가격 없으면 제외
  return okAirports && okTimes && okPrice;
};

// 결과 정리: 정규화 + 표시 가능만 남김
export const sanitizeResults = (input: unknown) => {
  const arr = coerceToArray(input); // ★ 여기서 안전하게 배열로 강제
  const normalized = arr.map(normalizeForDisplay);
  const valid = normalized.filter(isDisplayableFlight);
  const invalid = normalized.filter(f => !isDisplayableFlight(f));
  return { valid, invalid };
};
