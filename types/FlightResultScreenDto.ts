// API에서 받은 항공편 검색 결과 데이터 형식
export interface FlightSearchResponseDto {
  airlineCode: string;
  airlineName: string;
  flightNumber: string | number;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  duration: string;
  travelClass: string;
  numberOfBookableSeats: number;
  hasCheckedBags: boolean;
  isRefundable: boolean;
  isChangeable: boolean;
  currency: string;
  price: number;

  outboundDepartureTime: string;
  outboundArrivalTime: string;
  outboundDuration: string;
  returnDepartureTime: string;
  returnArrivalTime: string;
  returnDuration: string;

  // 추가
  nonStop?: boolean | "true" | "false" | 1 | 0;
}
