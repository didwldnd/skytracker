import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatKoreanDate } from "../utils/formatDate";
import { useTheme } from "../context/ThemeContext";

import {
  FlightAlertRequestDto,
  registerFlightAlert,
  fetchFlightAlerts,
  FlightAlertItem,
  deleteFlightAlert,
} from "../utils/priceAlertApi";
import { mapSeatClassToBackend, SeatLabel } from "../utils/paramMappers";

// 🔹 여기 Props 다시 정의
interface Props {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengerCount: number;
  seatClass: string;

  nonStop: boolean;
  roundTrip: boolean;
  currency: string;
  lowestPrice: number | null;
}

// 서버/프론트 날짜 비교를 위해 "YYYY-MM-DD" 로만 맞춰주는 헬퍼
const normalizeDate = (s?: string | null): string => {
  if (!s) return "";
  const idx = s.indexOf("T");
  return idx >= 0 ? s.slice(0, idx) : s;
};

const FlightResultHeader = ({
  origin,
  destination,
  departureDate,
  returnDate,
  passengerCount,
  seatClass,
  nonStop,
  roundTrip,
  currency,
  lowestPrice,
}: Props) => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [alertLoading, setAlertLoading] = useState(false);
  const [alerted, setAlerted] = useState(false);

  const backendTravelClass =
    mapSeatClassToBackend(seatClass as SeatLabel) ?? "ECONOMY";

  const prettyDepart = departureDate
    ? formatKoreanDate(normalizeDate(departureDate))
    : "";
  const prettyReturn = returnDate
    ? formatKoreanDate(normalizeDate(returnDate))
    : undefined;

  const dateText = prettyReturn
    ? `${prettyDepart} – ${prettyReturn}`
    : `${prettyDepart} · 편도`;

  const isSameRouteAlert = (a: FlightAlertItem) => {
    return (
      a.origin === origin &&
      a.destination === destination &&
      normalizeDate(a.departureDate) === normalizeDate(departureDate) &&
      normalizeDate(a.returnDate) === normalizeDate(returnDate ?? null) &&
      a.travelClass === backendTravelClass &&
      a.nonStop === nonStop &&
      a.roundTrip === roundTrip
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const serverAlerts = await fetchFlightAlerts();
        const matched = serverAlerts.find(isSameRouteAlert);
        if (mounted && matched) {
          setAlerted(matched.isActive);
        }
      } catch (e) {
        console.log("[FlightResultHeader] 초기 알림 상태 조회 실패:", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    origin,
    destination,
    departureDate,
    returnDate,
    seatClass,
    nonStop,
    roundTrip,
    backendTravelClass,
  ]);

  const handleAlertPress = async () => {
    if (alertLoading) return;

    if (lowestPrice == null || !Number.isFinite(lowestPrice)) {
      Alert.alert("알림 설정 불가", "가격 정보를 찾을 수 없어요.");
      return;
    }

    // 이미 알림 켜져 있으면 → 삭제
    if (alerted) {
      try {
        setAlertLoading(true);
        const serverAlerts: FlightAlertItem[] = await fetchFlightAlerts();
        const matched = serverAlerts.find(isSameRouteAlert);
        if (matched?.alertId != null) {
          await deleteFlightAlert(matched.alertId);
        }
        setAlerted(false);
      } catch (e) {
        console.log("deleteFlightAlert error:", e);
        Alert.alert("오류", "알림 해제에 실패했어요.");
      } finally {
        setAlertLoading(false);
      }
      return;
    }

    // 새로 등록
    try {
      setAlertLoading(true);

      const dto: FlightAlertRequestDto = {
        flightId: null,
        airlineCode: "",
        flightNumber: "",
        originLocationAirport: origin,
        destinationLocationAirport: destination,
        departureDate: normalizeDate(departureDate),
        returnDate: returnDate ?? null,
        travelClass: backendTravelClass,
        currency: currency ?? "KRW",
        lastCheckedPrice: Math.round(lowestPrice ?? 0),
        adults: passengerCount,
        nonStop,
        roundTrip,
        newPrice: null,
      };

      await registerFlightAlert(dto);
      setAlerted(true);
    } catch (e) {
      console.log("registerFlightAlert error:", e);
      Alert.alert("오류", "알림 등록에 실패했어요.");
      setAlerted(false);
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="chevron-back" size={24} color={theme.text} />
      </TouchableOpacity>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={styles.topRow}>
          <View style={styles.routeRow}>
            <Ionicons
              name="airplane"
              size={16}
              color={theme.text}
              style={styles.icon}
            />
            <Text
              style={[styles.routeText, { color: theme.text }]}
              numberOfLines={2}
            >
              {origin} – {destination} · {dateText}
            </Text>
          </View>

          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={handleAlertPress}
              disabled={alertLoading}
              style={{ padding: 6 }}
            >
              {alertLoading ? (
                <ActivityIndicator
                  size="small"
                  color={alerted ? "gold" : theme.text}
                />
              ) : (
                <Ionicons
                  name={alerted ? "notifications" : "notifications-outline"}
                  size={20}
                  color={alerted ? "gold" : theme.text}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[
            styles.subText,
            { color: (theme as any).subText ?? theme.text },
          ]}
        >
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    paddingRight: 8,
  },
  icon: {
    marginRight: 6,
  },
  routeText: {
    fontSize: 15,
    fontWeight: "500",
  },
  subText: {
    fontSize: 14,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
