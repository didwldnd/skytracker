import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { usePriceAlert } from "../context/PriceAlertContext";
import { useFavorite } from "../context/FavoriteContext";
import { formatPrice } from "../utils/formatters";

const THEME_COLOR = "#0be5ecd7";

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

const formatDuration = (iso: string | undefined) => {
  if (!iso) return "정보 없음";
  const match = iso.match(/PT(\d+H)?(\d+M)?/);
  const hours = match?.[1]?.replace("H", "") ?? "0";
  const minutes = match?.[2]?.replace("M", "") ?? "0";
  return `${hours}시간 ${minutes}분`;
};

const formatFlightNo = (code?: string, num?: string | number) => {
  const n = (num ?? "").toString().trim();
  if (!code && !n) return "정보 없음";
  return code ? `${code} ${n}` : n;
};

const seatLabel = (cls?: string) =>
  cls === "BUSINESS" ? "비즈니스석" : cls === "ECONOMY" ? "일반석" : undefined;


const FlightCard = ({
  flight,
  onPress,
}: {
  flight: FlightSearchResponseDto;
  onPress?: () => void;
}) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const favorite = isFavorite(flight);

  const { addAlert, removeAlert, isAlerted } = usePriceAlert();
  const alerted = isAlerted(flight);

  const departureTime = flight.outboundDepartureTime ?? flight.departureTime;
  const arrivalTime = flight.outboundArrivalTime ?? flight.arrivalTime;
  const duration = flight.outboundDuration ?? flight.duration;

  const cls = seatLabel(flight.travelClass);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        {/* 상단 시간/공항 */}
        <View style={styles.row}>
          <View style={styles.timeColumn}>
            <Text style={styles.timeText}>
              {formatTime(departureTime ?? "")}
            </Text>
            <Text style={styles.airportText}>{flight.departureAirport}</Text>
          </View>

          <View style={styles.centerColumn}>
            <View style={styles.line} />
            <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.timeColumn}>
            <Text style={styles.timeText}>{formatTime(arrivalTime ?? "")}</Text>
            <Text style={styles.airportText}>{flight.arrivalAirport}</Text>
          </View>
        </View>

        {/* ✅ 항공편/좌석 뱃지 */}
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              항공편 {formatFlightNo(flight.airlineCode, flight.flightNumber)}
            </Text>
          </View>
          {cls && (
            <View style={[styles.badge, styles.seatBadge]}>
              <Text style={[styles.badgeText, styles.seatBadgeText]}>{cls}</Text>
            </View>
          )}
        </View>

        {/* 가격 & 항공사 */}
        <View style={styles.bottomRow}>
          <Text style={styles.priceText}>
            {formatPrice(flight.price, flight.currency ?? "KRW")}
          </Text>
          <Text style={styles.carrierText}>{flight.airlineName}</Text>
        </View>

        {/* 아이콘 */}
        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => (alerted ? removeAlert(flight) : addAlert(flight))}
          >
            <Ionicons
              name={alerted ? "notifications" : "notifications-outline"}
              size={20}
              color={alerted ? "gold" : "gray"}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleFavorite(flight)}>
            <FontAwesome
              name={favorite ? "heart" : "heart-o"}
              size={20}
              color={favorite ? "red" : "gray"}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <MaterialIcons name="ios-share" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FlightCard;

const styles = StyleSheet.create({
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

  /* ✅ 추가 */
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f2f4f7",
    borderWidth: 1,
    borderColor: "#eceef1",
  },
  badgeText: {
    fontSize: 12,
    color: "#333",
  },
  seatBadge: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  seatBadgeText: {
    color: "#00303a",
    fontWeight: "600",
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