import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export type NormalizedFlight = FlightSearchResponseDto & {
  // 항상 string 보장하고 싶으면 그대로 두고
  outboundDepartureTime: string;
  outboundArrivalTime: string;
  outboundDuration: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  returnDuration: string;
  airlineName: string;
  currency: string;
};

export const normalizeFlightData = (
  raw: FlightSearchResponseDto
): NormalizedFlight => {
  return {
    ...raw,

    // 가는 편: 값 없으면 그냥 빈 문자열
    outboundDepartureTime: raw.outboundDepartureTime || "",
    outboundArrivalTime: raw.outboundArrivalTime || "",
    outboundDuration: raw.outboundDuration || "",

    // 오는 편: 왕복 아닐 땐 빈 문자열
    returnDepartureTime: raw.returnDepartureTime || "",
    returnArrivalTime: raw.returnArrivalTime || "",
    returnDuration: raw.returnDuration || "",

    // 이름/통화 기본값
    airlineName: raw.airlineName || raw.airlineCode || "",
    currency: raw.currency || "KRW",
  };
};
