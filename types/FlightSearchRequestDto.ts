export interface FlightSearchRequestDto {
  originLocationAirport: string;
  destinationLocationAirport: string; 
  departureDate: string;              // YYYY-MM-DD
  returnDate?: string;                // 편도면 미전송
  // currencyCode?: string;           // 현재 미사용이므로 생략 권장 (있어도 무방)
  nonStop?: boolean;                  // 직항만
  travelClass?: "ECONOMY" | "BUSINESS"; // 현재는 이 2개만 지원
  adults: number;                     // UI 값 그대로 전달
  max: number;                        // 호출당 최대 결과 수 (기본 10)
}
