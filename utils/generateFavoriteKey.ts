import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export const generateFavoriteKey = (flight: FlightSearchResponseDto): string => {
  const parts = [
    flight.airlineCode,
    String(flight.flightNumber),
    flight.departureAirport,
    flight.arrivalAirport,
    flight.outboundDepartureTime,
    flight.returnDepartureTime,

    // 운임 조건
    flight.travelClass,
    String(flight.hasCheckedBags),
    String(flight.isRefundable),
    String(flight.isChangeable),
    flight.currency,
    String(flight.price),
    String(flight.numberOfBookableSeats),
  ];

    return Buffer.from(parts.join("|")).toString("base64");
};