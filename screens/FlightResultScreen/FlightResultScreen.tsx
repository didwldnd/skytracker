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
    results = [],
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
        data={results}
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