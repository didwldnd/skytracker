export type HotRouteSummaryDto = {
  rank: number;                 // 1~10
  uniqueKey: string;            // "YVR:ICN:2025-11-02:2025-11-29:1"
  departureAirportCode: string; // 예: "PUS"
  arrivalAirportCode: string;   // 예: "FUK"
  departureDate: string;        // 예: "2025-12-02"
  arrivalDate: string | null;   // 편도면 null
  adults: number;
  minPrice: number;
};