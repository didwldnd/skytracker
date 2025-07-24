import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

// 1. 타입 정의 (실제 백엔드 DTO 기준)
interface FlightSearchResponseDto {
  airlineCode: string;
  airlineName: string;
  flightNumber: string | number;
  departureAirport: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalTime: string;
  duration: string;
  travelClass: string;
  numberOfBookableSeats: number;
  hasCheckedBags: boolean;
  isRefundable: boolean;
  isChangeable: boolean;
  currency: string;
  price: number;
}

// 2. 가짜 데이터 생성
const mockFlights: FlightSearchResponseDto[] = [
  {
    airlineCode: "KE",
    airlineName: "KOREAN AIR",
    flightNumber: 907,
    departureAirport: "ICN",
    departureTime: "2025-07-25T10:00:00",
    arrivalAirport: "LHR",
    arrivalTime: "2025-07-25T17:20:00",
    duration: "PT14H25M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 9,
    hasCheckedBags: true,
    isRefundable: false,
    isChangeable: false,
    currency: "KRW",
    price: 1118800,
  },
  {
    airlineCode: "OZ",
    airlineName: "ASIANA AIRLINES",
    flightNumber: 203,
    departureAirport: "ICN",
    departureTime: "2025-07-25T14:30:00",
    arrivalAirport: "LHR",
    arrivalTime: "2025-07-25T22:40:00",
    duration: "PT14H10M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 5,
    hasCheckedBags: true,
    isRefundable: true,
    isChangeable: true,
    currency: "KRW",
    price: 1180000,
  },
  {
    airlineCode: "JL",
    airlineName: "JAPAN AIRLINES",
    flightNumber: 52,
    departureAirport: "GMP",
    departureTime: "2025-07-25T08:15:00",
    arrivalAirport: "HND",
    arrivalTime: "2025-07-25T11:00:00",
    duration: "PT2H45M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 3,
    hasCheckedBags: false,
    isRefundable: true,
    isChangeable: false,
    currency: "KRW",
    price: 450000,
  },
  {
    airlineCode: "AA",
    airlineName: "AMERICAN AIRLINES",
    flightNumber: 81,
    departureAirport: "ICN",
    departureTime: "2025-07-25T18:00:00",
    arrivalAirport: "JFK",
    arrivalTime: "2025-07-25T20:00:00",
    duration: "PT14H",
    travelClass: "BUSINESS",
    numberOfBookableSeats: 2,
    hasCheckedBags: true,
    isRefundable: true,
    isChangeable: true,
    currency: "KRW",
    price: 3200000,
  },
  {
    airlineCode: "BA",
    airlineName: "BRITISH AIRWAYS",
    flightNumber: 18,
    departureAirport: "ICN",
    departureTime: "2025-07-25T23:45:00",
    arrivalAirport: "LHR",
    arrivalTime: "2025-07-26T05:50:00",
    duration: "PT13H5M",
    travelClass: "PREMIUM_ECONOMY",
    numberOfBookableSeats: 4,
    hasCheckedBags: true,
    isRefundable: false,
    isChangeable: true,
    currency: "KRW",
    price: 1520000,
  },
];

// 3. 화면 구성
const FakeFlightResultScreen = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockFlights}
        keyExtractor={(item, idx) => `${item.airlineCode}-${item.flightNumber}-${idx}`}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>
              {item.airlineName} ({item.airlineCode}) {item.flightNumber}
            </Text>
            <Text>{item.departureAirport} → {item.arrivalAirport}</Text>
            <Text>출발: {item.departureTime}</Text>
            <Text>도착: {item.arrivalTime}</Text>
            <Text>소요 시간: {formatDuration(item.duration)}</Text>
            <Text>좌석 클래스: {item.travelClass}</Text>
            <Text>남은 좌석 수: {item.numberOfBookableSeats}</Text>
            <Text>수하물: {item.hasCheckedBags ? "포함" : "미포함"}</Text>
            <Text>환불 가능: {item.isRefundable ? "가능" : "불가"}</Text>
            <Text>변경 가능: {item.isChangeable ? "가능" : "불가"}</Text>
            <Text>가격: {item.price.toLocaleString()} {item.currency}</Text>
          </View>
        )}
      />
    </View>
  );
};

// 4. duration 파싱
const formatDuration = (iso: string) => {
  const match = iso.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1]?.replace("H", "") ?? "0";
  const minutes = match?.[2]?.replace("M", "") ?? "0";
  return `${hours}시간 ${minutes}분`;
};

export default FakeFlightResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
