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
  isRefundable: boolean;   // or refundable
  isChangeable: boolean;   // or changeable
  currency: string;
  price: number;           // ✅ 왕복이면 왕복 전체 가격, 편도면 편도 가격

  origin: string;
  destination: string;

  tripType?:"ONE_WAY" | "ROUND_TRIP";
}
