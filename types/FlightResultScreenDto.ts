// API에서 받은 항공편 검색 결과 데이터 형식
export interface FlightSearchResponseDto {
  airlineCode: string;
  airlineName: string;
  flightNumber: string | number; // Union 타입, 문자열일수도 숫자일수도 "623" or 623
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
  nonStop?: boolean | "true" | "false" | 1 | 0; // api 받을때 안전하게 다 받기 위해
}
