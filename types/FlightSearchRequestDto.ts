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
