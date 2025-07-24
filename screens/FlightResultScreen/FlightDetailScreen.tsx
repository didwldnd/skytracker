import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
type DetailRouteProp = RouteProp<RootStackParamList, "FlightDetail">;

const FlightDetailScreen = () => {
  const route = useRoute<DetailRouteProp>();
  const flight = route.params.flight;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{flight.airlineName} ({flight.airlineCode})</Text>
      <Text>비행기 번호: {flight.flightNumber}</Text>
      <Text>출발 공항: {flight.departureAirport}</Text>
      <Text>출발 시간: {flight.departureTime}</Text>
      <Text>도착 공항: {flight.arrivalAirport}</Text>
      <Text>도착 시간: {flight.arrivalTime}</Text>
      <Text>비행 시간: {flight.duration}</Text>
      <Text>좌석 등급: {flight.travelClass}</Text>
      <Text>예약 가능 좌석 수: {flight.numberOfBookableSeats}</Text>
      <Text>수하물 포함: {flight.hasCheckedBags ? "예" : "아니오"}</Text>
      <Text>환불 가능: {flight.isRefundable ? "예" : "아니오"}</Text>
      <Text>변경 가능: {flight.isChangeable ? "예" : "아니오"}</Text>
      <Text>가격: {flight.price.toLocaleString()} {flight.currency}</Text>
    </ScrollView>
  );
};

export default FlightDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
