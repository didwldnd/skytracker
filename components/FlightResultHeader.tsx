import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengerCount: number;
  seatClass: string;
}

const FlightResultHeader = ({
  origin,
  destination,
  departureDate,
  returnDate,
  passengerCount,
  seatClass,
}: Props) => {
  const navigation = useNavigation();

  // 날짜 표시 returnDate 있으면 왕복 없으면 편도로 처리
  const dateText = returnDate
    ? `${departureDate} – ${returnDate}`
    : `${departureDate} · 편도`;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.topRow}>
          <Ionicons
            name="airplane"
            size={16}
            color="#666"
            style={styles.icon}
          />
          <Text style={styles.routeText}>
            {origin} – {destination} · {dateText}
          </Text>
        </View>

        <Text style={styles.subText}>
          여행객 {passengerCount}명 · {seatClass}
        </Text>
      </View>
    </View>
  );
};

export default FlightResultHeader;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  backBtn: {
    paddingRight: 6,
    paddingTop: 10,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  routeText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
  },
  subText: {
    fontSize: 14,
    color: "#666",
  },
});
