import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { Buffer } from "buffer";

const dateToKey = (s?: string | null) => {
  if (!s) return "";
  // "2025-11-28T09:10:00" -> "2025-11-28"
  const [d] = s.split("T");
  return d ?? "";
};

export const generateAlertKey = (f: FlightSearchResponseDto): string => {
  const parts = [
    f.airlineCode ?? "",
    String(f.flightNumber ?? ""),
    f.departureAirport ?? "",
    f.arrivalAirport ?? "",

    // 🔥 시간 대신 "날짜"만 키로 사용
    dateToKey(
      f.outboundDepartureTime ?? (f as any).departureTime ?? (f as any).departureDate
    ),
    dateToKey(
      f.returnDepartureTime ?? (f as any).returnDepartureTime ?? (f as any).arrivalDate
    ),

    f.travelClass ?? "",
  ];

  return Buffer.from(parts.join("|")).toString("base64");
};
