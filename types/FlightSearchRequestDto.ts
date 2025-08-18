// 사용자가 검색할때 API로 보내는 요청 데이터 방식 (검색 조건 필터)
export interface FlightSearchRequestDto {
  originLocationAirport: string;
  destinationLocationAirPort: string;
  departureDate: string;      // YYYY-MM-DD
  returnDate?: string;        // 왕복일 경우
  currencyCode?: string;
  nonStop?: boolean;
  travelClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
  adults: number;
  maxNumberOfConnections?: number;
  max?: number;
}
