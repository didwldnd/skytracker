import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { formatKoreanDate } from "../utils/formatDate";

import {
  FlightAlertRequestDto,
  registerFlightAlert,
  fetchFlightAlerts,
  FlightAlertItem,
  deleteFlightAlert,
} from "../utils/priceAlertApi";

interface Props {
  origin: string; // 예: "PUS"
  destination: string; // 예: "PVG"
  departureDate: string; // 예: "2025-12-03T00:00:00.000Z" 또는 "2025-12-03"
  returnDate?: string; // 예: "2025-12-11T00:00:00.000Z" | undefined
  passengerCount: number; // 성인 인원수
  seatClass: string; // "일반석" / "비즈니스석" 등 (alert.travelClass와 동일)

  // 🔽 알리미용 추가 props
  nonStop: boolean; // 직항만 true / 상관없음 false
  roundTrip: boolean; // 왕복 true / 편도 false
  currency: string; // "KRW"
  lowestPrice: number | null; // 이번 검색 결과 중 최저가
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

  const [alertLoading, setAlertLoading] = useState(false);
  const [alerted, setAlerted] = useState(false);

  // 👉 화면 표시용 예쁜 날짜 (YYYY-MM-DD -> 한국어)
  const prettyDepart = departureDate
    ? formatKoreanDate(normalizeDate(departureDate))
    : "";
  const prettyReturn = returnDate
    ? formatKoreanDate(normalizeDate(returnDate))
    : undefined;

  // 화면에 보여줄 텍스트
  const dateText = prettyReturn
    ? `${prettyDepart} – ${prettyReturn}`
    : `${prettyDepart} · 편도`;

  // 🔍 서버 알림과 현재 헤더 조건이 같은지 체크 (노선/날짜/옵션 기준)
  const isSameRouteAlert = (a: FlightAlertItem) => {
    return (
      a.origin === origin &&
      a.destination === destination &&
      normalizeDate(a.departureDate) === normalizeDate(departureDate) &&
      normalizeDate(a.returnDate) === normalizeDate(returnDate ?? null) &&
      a.travelClass === seatClass &&
      a.nonStop === nonStop &&
      a.roundTrip === roundTrip
      // adults는 FlightAlertItem에 아직 없어서 비교 불가 (추가되면 같이 비교)
    );
  };

  // 🔁 화면 들어올 때 한 번 서버 알림 목록에서 이 노선 알림 있는지 확인
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
  ]);

  const handleAlertPress = async () => {
    if (alertLoading) return;

    if (lowestPrice == null || !Number.isFinite(lowestPrice)) {
      Alert.alert("알림 설정 불가", "가격 정보를 찾을 수 없어요.");
      return;
    }

    // ✅ 1) 이미 알림 켜져 있으면 → 서버에서 해당 노선 알림 찾아서 삭제
    if (alerted) {
      try {
        setAlertLoading(true);

        const serverAlerts: FlightAlertItem[] = await fetchFlightAlerts();
        const matched = serverAlerts.find(isSameRouteAlert);

        if (matched?.alertId != null) {
          console.log(
            "🗑 [FlightResultHeader] deleteFlightAlert:",
            matched.alertId
          );
          await deleteFlightAlert(matched.alertId);
        } else {
          console.log(
            "⚠ [FlightResultHeader] 매칭되는 서버 알림을 찾지 못했어요."
          );
        }

        setAlerted(false);
      } catch (e) {
        console.log("❌ [FlightResultHeader] deleteFlightAlert error:", e);
        Alert.alert("오류", "알림 해제에 실패했어요.");
      } finally {
        setAlertLoading(false);
      }
      return;
    }

    // ✅ 2) 알림 꺼져 있으면 → 이번 검색 조건 + 최저가로 서버에 등록
    try {
      setAlertLoading(true);

      const safeLastCheckedPrice = Math.round(
        Number.isFinite(lowestPrice) ? (lowestPrice as number) : 0
      );

      const dto: FlightAlertRequestDto = {
        // 노선 기반 알림이라 flightId / 편명은 사용하지 않음
        flightId: null,
        airlineCode: "",
        flightNumber: "",

        originLocationAirport: origin,
        destinationLocationAirport: destination,

        // 서버는 "YYYY-MM-DD" 또는 "YYYY-MM-DDT00:00:00Z" 어느 쪽이든 OK라면
        // 그대로 넘겨도 되고, 필요하면 normalizeDate(departureDate)로 줄여도 됨
        departureDate,
        returnDate: returnDate ?? null,

        travelClass: seatClass,
        currency: currency ?? "KRW",
        lastCheckedPrice: safeLastCheckedPrice,
        adults: passengerCount,

        nonStop,
        roundTrip,

        newPrice: null,
      };

      console.log("🚀 [FlightResultHeader] register alert payload:", dto);
      await registerFlightAlert(dto);

      console.log("✅ [FlightResultHeader] 서버 등록 성공 → ON");
      setAlerted(true);
    } catch (e) {
      console.log("❌ [FlightResultHeader] registerFlightAlert error:", e);
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
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.routeRow}>
            <Ionicons
              name="airplane"
              size={16}
              color="#666"
              style={styles.icon}
            />
            <Text style={styles.routeText} numberOfLines={2}>
              {origin} – {destination} · {dateText}
            </Text>
          </View>

          {/* 🔔 알리미 아이콘 */}
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={handleAlertPress}
              disabled={alertLoading}
              style={{ padding: 6 }}
            >
              {alertLoading ? (
                <ActivityIndicator
                  size="small"
                  color={alerted ? "gold" : "#6b7280"}
                />
              ) : (
                <Ionicons
                  name={alerted ? "notifications" : "notifications-outline"}
                  size={20}
                  color={alerted ? "gold" : "#6b7280"}
                />
              )}
            </TouchableOpacity>
          </View>
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
    color: "#111",
  },
  subText: {
    fontSize: 14,
    color: "#666",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
