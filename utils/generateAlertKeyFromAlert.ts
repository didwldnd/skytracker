// utils/generateAlertKeyFromAlert.ts
import { Buffer } from "buffer";
import { FlightAlertItem } from "../utils/priceAlertApi";

const timeToKeyFromDate = (date?: string | null) => {
  if (!date) return "";
  const t = new Date(date + "T00:00:00").getTime();
  return Number.isFinite(t) ? Math.floor(t / 60000).toString() : date;
};

export const generateAlertKeyFromAlert = (a: FlightAlertItem): string => {
  const parts = [
    a.airlineCode ?? "",
    String(a.flightNumber ?? ""),
    a.departureAirport,
    a.arrivalAirport,
    timeToKeyFromDate(a.departureDate),
    timeToKeyFromDate(a.arrivalDate ?? null),
    a.travelClass ?? "",
  ];

  // ⚠️ 여기 인코딩은 generateAlertKey 에서 쓰는 거랑 똑같이 맞춰줘야 함
  return Buffer.from(parts.join("|")).toString("base64");
};
