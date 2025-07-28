// FlightResultScreen.tsx (디자인 카드 영역 중심)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import FlightResultHeader from "../../components/FlightResultHeader";
import { formatKoreanDate } from "../../utils/formatDate";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import FlightLoadingModal from "../../components/FlightLoadingModal";

type FlightResultRouteProp = RouteProp<RootStackParamList, "FlightResult">;

// 가짜 데이터 예시
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

const THEME_COLOR = "#0be5ecd7";

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
    stopover,
    results,
  } = route.params;

  const [loading, setLoading] = useState(false);

  const handleCardPress = (flight: FlightSearchResponseDto) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("FlightDetail", { flight });
    }, 1555); // 1.555초 로딩 스피너 표시 후 이동
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

      {/* 로딩 스피너 모달 */}
      <FlightLoadingModal visible={loading} />

      {/* 항공편 리스트 */}
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={mockFlights}
        keyExtractor={(item, idx) =>
          `${item.airlineCode}-${item.flightNumber}-${idx}`
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCardPress(item)}>
            <View style={styles.card}>
              {/* 상단 시간/공항 정보 */}
              <View style={styles.row}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>
                    {formatTime(item.departureTime)}
                  </Text>
                  <Text style={styles.airportText}>
                    {item.departureAirport}
                  </Text>
                </View>

                <View style={styles.centerColumn}>
                  <View style={styles.line} />
                  <Text style={styles.durationText}>
                    {formatDuration(item.duration)}
                  </Text>
                  <View style={styles.line} />
                </View>

                <View style={styles.timeColumn}>
                  <Text style={styles.timeText}>
                    {formatTime(item.arrivalTime)}
                  </Text>
                  <Text style={styles.airportText}>{item.arrivalAirport}</Text>
                </View>
              </View>

              {/* 가격 + 항공사 */}
              <View style={styles.bottomRow}>
                <Text style={styles.priceText}>
                  {item.price.toLocaleString()} KRW
                </Text>
                <Text style={styles.carrierText}>{item.airlineName}</Text>
              </View>

              {/* 하단 아이콘 */}
              <View style={styles.iconRow}>
                <TouchableOpacity>
                  <Entypo name="heart-outlined" size={20} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity>
                  <MaterialIcons name="ios-share" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default FlightResultScreen;

// ===== 유틸 =====
const formatTime = (iso: string) => {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const formatDuration = (iso: string) => {
  const match = iso.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1]?.replace("H", "") ?? "0";
  const minutes = match?.[2]?.replace("M", "") ?? "0";
  return `${hours}시간 ${minutes}분`;
};

// ===== 스타일 =====
const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeColumn: {
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  airportText: {
    fontSize: 13,
    color: THEME_COLOR,
    marginTop: 4,
  },
  centerColumn: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  line: {
    width: "100%",
    height: 1,
    backgroundColor: "#ccc",
  },
  durationText: {
    fontSize: 12,
    color: "#555",
    marginVertical: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  carrierText: {
    fontSize: 13,
    color: "#666",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 12,
  },
});
