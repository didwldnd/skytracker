import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import FlightResultHeader from "../../components/FlightResultHeader";
import { formatKoreanDate } from "../../utils/formatDate";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FlightLoadingModal from "../../components/FlightLoadingModal";
import FlightCard from "../../components/FlightCard";

type FlightResultRouteProp = RouteProp<RootStackParamList, "FlightResult">;

// mock 데이터
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

const FlightResultScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<FlightResultRouteProp>();
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults,
    travelClass,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const handleCardPress = (flight: FlightSearchResponseDto) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("FlightDetail", { flight });
    }, 1555);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlightResultHeader
        origin={originLocationCode}
        destination={destinationLocationCode}
        departureDate={formatKoreanDate(departureDate)}
        returnDate={formatKoreanDate(returnDate)}
        passengerCount={adults}
        seatClass={travelClass}
      />

      <FlightLoadingModal visible={loading} />

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={mockFlights}
        keyExtractor={(item, idx) =>
          `${item.airlineCode}-${item.flightNumber}-${idx}`
        }
        renderItem={({ item }) => (
          <FlightCard flight={item} onPress={() => handleCardPress(item)} />
        )}
      />
    </View>
  );
};

export default FlightResultScreen;

// ===== 스타일 =====
const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
});
