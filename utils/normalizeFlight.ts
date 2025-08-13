// utils/normalizeFlight.ts
import { FlightSearchRequestDto } from "../types/FlightSearchRequestDto";

// 원본의 필수 표시 필드들을 Omit하고, optional로 재선언
export type NormalizedFlight = Omit<
  FlightSearchRequestDto,
  | "departureTime" | "arrivalTime" | "duration"
  | "returnDepartureTime" | "returnArrivalTime" | "returnDuration"
  | "price" | "currency" | "airlineName"
> & {
  // 표준 표시 필드(선택)
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;

  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;

  // 표시/계산을 위한 보강
  price?: number;
  currency?: string;
  airlineName?: string;
};

const toMaybeString = (v: unknown): string | undefined => {
  if (typeof v === "string" && v.trim().length > 0) return v;
  return undefined;
};

const toMaybeNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (v != null && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
};

export const normalizeFlightData = (flight: FlightSearchRequestDto): NormalizedFlight => {
  const departureTime =
    toMaybeString((flight as any).departureTime) ??
    toMaybeString((flight as any).outboundDepartureTime);

  const arrivalTime =
    toMaybeString((flight as any).arrivalTime) ??
    toMaybeString((flight as any).outboundArrivalTime);

  const duration =
    toMaybeString((flight as any).duration) ??
    toMaybeString((flight as any).outboundDuration);

  const returnDepartureTime = toMaybeString((flight as any).returnDepartureTime);
  const returnArrivalTime = toMaybeString((flight as any).returnArrivalTime);
  const returnDuration = toMaybeString((flight as any).returnDuration);

  const price = toMaybeNumber((flight as any).price);
  const currency = toMaybeString((flight as any).currency) ?? "KRW";

  const airlineName =
    toMaybeString((flight as any).airlineName) ??
    toMaybeString((flight as any).carrierName);

  return {
    ...flight, // 원본 보존
    departureTime,
    arrivalTime,
    duration,
    returnDepartureTime,
    returnArrivalTime,
    returnDuration,
    price,
    currency,
    airlineName,
  };
};
