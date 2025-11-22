// utils/mapBackendFlight.ts

import {
  BackendFlightSearchResponseDto,
  FlightSearchResponseDto,
} from "../types/FlightResultScreenDto";

export const mapBackendFlightToFrontend = (
  raw: BackendFlightSearchResponseDto
): FlightSearchResponseDto => {
  const [outbound, inbound] = raw.legs;

  // 여러 leg가 생길 수 있으니, 좌석 수는 최소값을 대표로 사용
  const numberOfBookableSeats = raw.legs.reduce(
    (min, leg) =>
      Math.min(min, leg.numberOfBookableSeats ?? Number.MAX_SAFE_INTEGER),
    Number.MAX_SAFE_INTEGER
  );

  return {
    airlineCode: outbound.airlineCode,
    airlineName: outbound.airlineName,
    flightNumber: outbound.flightNumber, // string이지만 기존 타입이 string | number라 문제 없음

    departureAirport: outbound.departureAirport,
    arrivalAirport: outbound.arrivalAirport,

    // 가는 편
    outboundDepartureTime: outbound.departureTime,
    outboundArrivalTime: outbound.arrivalTime,
    outboundDuration: outbound.duration,

    // 오는 편 (왕복일 때만)
    returnDepartureTime: inbound ? inbound.departureTime : null,
    returnArrivalTime: inbound ? inbound.arrivalTime : null,
    returnDuration: inbound ? inbound.duration : null,

    // 여정 전체 기준
    travelClass: outbound.travelClass, // string으로 들어갈 것
    numberOfBookableSeats:
      numberOfBookableSeats === Number.MAX_SAFE_INTEGER
        ? outbound.numberOfBookableSeats
        : numberOfBookableSeats,

    hasCheckedBags: raw.hasCheckedBags,
    isRefundable: raw.isRefundable,
    isChangeable: raw.isChangeable,

    currency: raw.currency,
    price: raw.totalPrice, // ✅ 편도면 편도, 왕복이면 왕복 전체 가격

    // origin / destination은 가는 편 기준으로
    origin: outbound.departureAirport,
    destination: outbound.arrivalAirport,

    tripType: raw.tripType,
  };
};
