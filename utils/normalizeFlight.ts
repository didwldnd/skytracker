import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export type NormalizedFlight = FlightSearchResponseDto & {
  outboundDepartureTime: string;
  outboundArrivalTime: string;
  outboundDuration: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  returnDuration: string;
  // 빈 문자열이라도 항상 존재하도록

  currency?: string;
  airlineName?: string;
  // 값 없으면 기본값 대입됨
};

const toMaybeString = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v : undefined;

const toMaybeNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

/** 검색 결과(응답)를 화면/키 계산에 적합하게 정규화 */
export const normalizeFlightData = (raw: FlightSearchResponseDto): NormalizedFlight => {
  const outboundDepartureTime =
    toMaybeString((raw as any).outboundDepartureTime) ?? toMaybeString((raw as any).departureTime) ?? "";

  const outboundArrivalTime =
    toMaybeString((raw as any).outboundArrivalTime) ?? toMaybeString((raw as any).arrivalTime) ?? "";

  const outboundDuration =
    toMaybeString((raw as any).outboundDuration) ?? toMaybeString((raw as any).duration) ?? "";

  // 왕복이 아닐 수도 있으니 빈 문자열 허용
  const returnDepartureTime = toMaybeString((raw as any).returnDepartureTime) ?? "";
  const returnArrivalTime   = toMaybeString((raw as any).returnArrivalTime) ?? "";
  const returnDuration      = toMaybeString((raw as any).returnDuration) ?? "";

  const price    = toMaybeNumber((raw as any).price);
  const currency = toMaybeString((raw as any).currency) ?? "KRW";
  const airlineName =
    toMaybeString((raw as any).airlineName) ?? toMaybeString((raw as any).carrierName);

  return {
    ...raw,
    outboundDepartureTime,
    outboundArrivalTime,
    outboundDuration,
    returnDepartureTime,
    returnArrivalTime,
    returnDuration,
    price,
    currency,
    airlineName,
  } as NormalizedFlight;
};