// types/FlightResultScreenDto.ts

export interface FlightSearchResponseDto {
  airlineCode: string;
  airlineName: string;
  flightNumber: string | number;

  departureAirport: string;
  arrivalAirport: string;

  // 편도/왕복 공통: "가는 편"
  outboundDepartureTime: string;
  outboundArrivalTime: string;
  outboundDuration: string;

  // 왕복일 때만 채워지는 "오는 편"
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

  origin: string;
  destination: string;

  tripType?: "ONE_WAY" | "ROUND_TRIP";
}

/* ===========================
   🔹 여기부터 백엔드 "원본" 타입
   =========================== */

export type TripType = "ONE_WAY" | "ROUND_TRIP";

export type TravelClass =
  | "ECONOMY"
  | "BUSINESS"
  | "FIRST"
  | "PREMIUM_ECONOMY"; // 백엔드 enum 맞춰서

export interface BackendLegDto {
  airlineCode: string;
  airlineName: string;

  flightNumber: string;

  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;

  duration: string; // "PT14H25M"

  travelClass: TravelClass;
  numberOfBookableSeats: number;

  nonStop: boolean;
  numberOfStops: number;
}

export interface BackendFlightSearchResponseDto {
  tripType: TripType;

  currency: string;
  totalPrice: number;

  hasCheckedBags: boolean;
  isRefundable: boolean;
  isChangeable: boolean;

  legs: BackendLegDto[]; // ONE_WAY면 1개, ROUND_TRIP면 2개
}
