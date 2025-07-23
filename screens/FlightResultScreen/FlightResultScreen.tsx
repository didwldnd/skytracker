import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type FlightResultRouteProp = RouteProp<RootStackParamList, "FlightResult">;

const FlightResultScreen = () => {
  const route = useRoute<FlightResultRouteProp>();
  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults,
    travelClass,
    stopover,
  } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>출발지: {originLocationCode}</Text>
      <Text style={styles.text}>도착지: {destinationLocationCode}</Text>
      <Text style={styles.text}>출발 날짜: {departureDate}</Text>
      <Text style={styles.text}>귀국 날짜: {returnDate}</Text>
      <Text style={styles.text}>탑승객 수: {adults}</Text>
      <Text style={styles.text}>좌석 클래스: {travelClass}</Text>
      <Text style={styles.text}>경유 여부: {stopover}</Text>
    </View>
  );
};

export default FlightResultScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
