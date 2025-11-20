import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

const timeToKey = (s?: string | null) => {
  if (!s) return ""; 
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? Math.floor(t / 60000).toString() : s;
};

export const generateAlertKey = (f: FlightSearchResponseDto): string => {
  const parts = [
    f.airlineCode,
    String(f.flightNumber),

    // 출발/도착 공항
    f.departureAirport,
    f.arrivalAirport,

    // 시간 (분 단위, return은 편도면 빈 문자열)
    timeToKey(f.outboundDepartureTime),
    timeToKey(f.returnDepartureTime ?? ""),

    // 운임 조건
    f.travelClass,
  ];

  return Buffer.from(parts.join("|")).toString("base64");
};
