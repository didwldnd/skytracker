import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

const timeToKey = (s?: string) => {
  if (!s) return "";
  const t = new Date(s).getTime();
  if (!Number.isFinite(t)) return s; // 파싱 실패 시 원본 유지
  return Math.floor(t / 60000).toString(); // 분 단위
};

export const generateAlertKey = (f: FlightSearchResponseDto): string => {
  const parts = [
    f.airlineCode,
    String(f.flightNumber),
    f.departureAirport,
    f.arrivalAirport,
    timeToKey(f.outboundDepartureTime),
    timeToKey(f.returnDepartureTime ?? ""), // 편도면 빈값
    f.travelClass,
  ];
  return Buffer.from(parts.join("|")).toString("base64");
};

// price 제외한 알리미