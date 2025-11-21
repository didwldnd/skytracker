// utils/normalizeFlight.ts (파일 이름은 네가 쓰는 거 유지)

import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export interface AlertResponseDto {
  alertId: number;

  airlineCode: string;
  airlineName: string;
  flightNumber: string | number;

  departureAirport: string;
  arrivalAirport: string;

  outboundDepartureTime?: string | null;
  outboundArrivalTime?: string | null;
  outboundDuration?: string | null;

  returnDepartureTime?: string | null;
  returnArrivalTime?: string | null;
  returnDuration?: string | null;

  travelClass: string;

  numberOfBookableSeats: number;
  hasCheckedBags: boolean;

  isRefundable: boolean;
  isChangeable: boolean;

  currency: string;
  price: number;

  departureDate?: string; // 백엔드에서 줄 수도 있음
  returnDate?: string | null;
}

export type NormalizedFlight = FlightSearchResponseDto & {
  outboundDepartureTime: string;
  outboundArrivalTime: string;
  outboundDuration: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  returnDuration: string;
  airlineName: string;
  currency: string;
  tripType?: "ONE_WAY" | "ROUND_TRIP";
};

// 🔥 공통 Normalize (검색/알리미 상관없이 전부 거쳐가게)
export const normalizeFlightData = (
  raw: FlightSearchResponseDto
): NormalizedFlight => {
  return {
    ...raw,

    outboundDepartureTime: raw.outboundDepartureTime || "",
    outboundArrivalTime: raw.outboundArrivalTime || "",
    outboundDuration: raw.outboundDuration || "",

    returnDepartureTime: raw.returnDepartureTime || "",
    returnArrivalTime: raw.returnArrivalTime || "",
    returnDuration: raw.returnDuration || "",

    airlineName: raw.airlineName || raw.airlineCode || "",
    currency: raw.currency || "KRW",

    tripType:
      raw.tripType ||
      (raw.returnDepartureTime ? "ROUND_TRIP" : "ONE_WAY"),
  };
};

// 🔥 알리미 응답 → FlightSearchResponseDto 변환
export const mapAlertToFlight = (
  alert: AlertResponseDto
): FlightSearchResponseDto => {
  const isRound = !!alert.returnDepartureTime || !!alert.returnDate;

  return {
    airlineCode: alert.airlineCode,
    airlineName: alert.airlineName,
    flightNumber: alert.flightNumber,

    departureAirport: alert.departureAirport,
    arrivalAirport: alert.arrivalAirport,

    outboundDepartureTime:
      alert.outboundDepartureTime ||
      (alert.departureDate ? `${alert.departureDate}T00:00:00` : ""),
    outboundArrivalTime:
      alert.outboundArrivalTime ||
      (alert.departureDate ? `${alert.departureDate}T00:00:00` : ""),
    outboundDuration: alert.outboundDuration || "",

    returnDepartureTime:
      isRound && alert.returnDepartureTime
        ? alert.returnDepartureTime
        : "",
    returnArrivalTime:
      isRound && alert.returnArrivalTime
        ? alert.returnArrivalTime
        : "",
    returnDuration:
      isRound && alert.returnDuration ? alert.returnDuration : "",

    travelClass: alert.travelClass,

    numberOfBookableSeats: alert.numberOfBookableSeats ?? 0,
    hasCheckedBags: alert.hasCheckedBags ?? false,

    isRefundable: alert.isRefundable,
    isChangeable: alert.isChangeable,

    currency: alert.currency || "KRW",
    price: alert.price || 0,

    tripType: isRound ? "ROUND_TRIP" : "ONE_WAY",
  };
};
