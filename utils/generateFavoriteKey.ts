import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export const generateFavoriteKey = (f: FlightSearchResponseDto): string => {
  const parts = [
    f.airlineCode,
    String(f.flightNumber),

    f.departureAirport,
    f.arrivalAirport,

    f.outboundDepartureTime,
    f.returnDepartureTime ?? "",

    // 운임 조건
    f.travelClass,
    String(f.hasCheckedBags),
    String(f.isRefundable),
    String(f.isChangeable),

    // 가격 정보 포함 (favorite는 가격 포함)
    f.currency,
    String(f.price),
    String(f.numberOfBookableSeats),
  ];

  return Buffer.from(parts.join("|")).toString("base64");
};
