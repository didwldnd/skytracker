import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

export const generateFlightKey = (flight: FlightSearchResponseDto): string => {
  const raw = JSON.stringify({
    flightNumber: flight.flightNumber,
    airlineCode: flight.airlineCode,
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    outboundDepartureTime: flight.outboundDepartureTime,
    returnDepartureTime: flight.returnDepartureTime,
    price: flight.price,
  });
  return Buffer.from(raw).toString("base64"); 
};
