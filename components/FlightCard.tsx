// components/FlightCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { usePriceAlert } from "../context/PriceAlertContext";
import { useFavorite } from "../context/FavoriteContext";
import { formatPrice, formatDurationKo } from "../utils/formatters";
import {
  registerFlightAlert,
  FlightAlertRequestDto,
} from "../utils/priceAlertApi";

const THEME = "#0be5ecd7";
const { width } = Dimensions.get("window");

/* ----- 헬퍼 ----- */

// 출발/도착 시간은 단순 문자열 파싱만 (시차 계산 X)
const formatTime = (iso?: string) => {
  if (!iso) return "--:--";
  const parts = iso.split("T");
  if (parts.length < 2) return "--:--";
  return parts[1].slice(0, 5); // "HH:mm"
};

const formatFlightNo = (code?: string, num?: string | number) => {
  const n = (num ?? "").toString().trim();
  if (!code && !n) return "정보 없음";
  return code ? `${code} ${n}` : n;
};

const seatLabel = (cls?: string) =>
  cls === "BUSINESS" ? "비즈니스석" : cls === "ECONOMY" ? "일반석" : undefined;

/* 🔸 선택값: previousPrice를 주면 diff 뱃지 표시(없으면 감춤) */
const diffPct = (current?: number, previous?: number) => {
  if (current == null || previous == null || previous === current)
    return { text: "", trend: "flat" as const };
  const pct = ((current - previous) / previous) * 100;
  const sign = pct > 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    trend: pct > 0 ? ("up" as const) : ("down" as const),
  };
};

const FlightCard = ({
  flight,
  onPress,
}: {
  flight: FlightSearchResponseDto & {
    previousPrice?: number;
    nonStop?: boolean | "true" | "false" | 1 | 0;
  };
  onPress?: () => void;
}) => {
  const { toggleFavorite, isFavorite } = useFavorite();
  const favorite = isFavorite(flight);

  const { addAlert, removeAlert, isAlerted } = usePriceAlert();
  const alerted = isAlerted(flight);

  const [alertLoading, setAlertLoading] = useState(false);

  // 출발/도착 시간: outbound* 우선, 없으면 구 DTO(departureTime/arrivalTime) 사용
  const departureTime =
    flight.outboundDepartureTime ?? (flight as any).departureTime;
  const arrivalTime =
    flight.outboundArrivalTime ?? (flight as any).arrivalTime;

  // 🔥 duration은 절대 Date로 계산하지 않고, 서버에서 준 ISO duration만 사용
  const outboundDurationIso =
    flight.outboundDuration ?? (flight as any).duration ?? "";

  // 카드에서는 가는 편 duration만 표시 (왕복이어도 요약이라 이렇게 가는 걸로)
  const displayDuration = formatDurationKo(outboundDurationIso);

  const cls = seatLabel(flight.travelClass);
  const diff = diffPct(flight.price, flight.previousPrice);

  const handleAlertPress = async () => {
    if (alertLoading) return;

    // 이미 알림 켜져 있으면 → 기존처럼 컨텍스트에서만 제거
    if (alerted) {
      removeAlert(flight);
      return;
    }

    try {
      setAlertLoading(true);

      // 🔔 기존 로직: 컨텍스트에 먼저 추가 → UI에서 즉시 노란 종 표시
      addAlert(flight);

      const departIso =
        flight.outboundDepartureTime ?? (flight as any).departureTime;

      const returnIso =
        flight.returnDepartureTime ?? (flight as any).returnDepartureTime;

      if (!departIso) {
        console.log("❌ [FlightCard] departIso 없음, 알림 생성 불가");
        Alert.alert(
          "알림 생성 불가",
          "출발 일자 정보를 찾을 수 없어요. 다시 시도해 주세요."
        );
        // 컨텍스트 롤백
        removeAlert(flight);
        return;
      }

      const departureDate = departIso?.split("T")[0] ?? "";

      // price 안전 가드
      const rawPrice = (flight as any).price;
      const numPrice = Number(rawPrice);
      const safeLastCheckedPrice = Number.isFinite(numPrice)
        ? Math.round(numPrice)
        : 0;

      const dto: FlightAlertRequestDto = {
        airlineCode: flight.airlineCode,
        flightNumber: String(flight.flightNumber),
        departureAirport: flight.departureAirport,
        arrivalAirport: flight.arrivalAirport,
        departureDate,
        arrivalDate: flight.returnDepartureTime // ✅ 왕복이면 오는 편 날짜 넣기
          ? flight.returnDepartureTime.split("T")[0]
          : null,
        travelClass: flight.travelClass,
        currency: flight.currency ?? "KRW",
        adults: 1,
        lastCheckedPrice: safeLastCheckedPrice,
      };

      console.log("🚀 [FlightCard] register alert payload:", dto);
      await registerFlightAlert(dto);
      console.log("✅ [FlightCard] registerFlightAlert 성공");
    } catch (e) {
      console.log("❌ [FlightCard] registerFlightAlert error:", e);
      Alert.alert("오류", "알림 등록에 실패했어요. 잠시 후 다시 시도해주세요.");
      // 실패 시 로컬 알림 롤백
      removeAlert(flight);
    } finally {
      setAlertLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View style={styles.card}>
        {/* 상단: 항공사/편명 + 가격(+변화) */}
        <View style={styles.cardTop}>
          <View style={styles.airlineRow}>
            <View style={styles.logoDot}>
              <Text style={styles.logoText}>{flight.airlineCode}</Text>
            </View>
            <View>
              <Text style={styles.airlineName}>{flight.airlineName}</Text>
              <Text style={styles.flightNo}>
                {formatFlightNo(flight.airlineCode, flight.flightNumber)}
              </Text>
              {cls && <Text style={styles.seatText}>{cls}</Text>}
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.price}>
              {formatPrice(flight.price, flight.currency ?? "KRW")}
            </Text>
            {!!diff.text && (
              <View
                style={[
                  styles.diffBadge,
                  diff.trend === "up" ? styles.diffUp : styles.diffDown,
                ]}
              >
                <Text
                  style={[
                    styles.diffText,
                    diff.trend === "up"
                      ? { color: "#b91c1c" }
                      : { color: "#065f46" },
                  ]}
                >
                  {diff.text}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 경로/소요시간 */}
        <View style={styles.routeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeBig}>{formatTime(departureTime)}</Text>
            <Text style={styles.airportCode}>{flight.departureAirport}</Text>
          </View>

          <View style={styles.timeline}>
            <View style={styles.line} />
            <View style={{ alignItems: "center" }}>
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text style={styles.duration}>{displayDuration}</Text>
              {flight.nonStop && <Text style={styles.nonStop}>직항</Text>}
            </View>
            <View style={styles.line} />
          </View>

          <View style={styles.timeCol}>
            <Text style={styles.timeBig}>{formatTime(arrivalTime)}</Text>
            <Text style={styles.airportCode}>{flight.arrivalAirport}</Text>
          </View>
        </View>

        {/* 서비스/정책 배지 + 액션 아이콘 */}
        <View style={styles.bottomRow}>
          <View style={styles.badgesRow}>
            {/* 위탁수하물 */}
            <View
              style={[
                styles.badge,
                flight.hasCheckedBags ? styles.badgeGreen : styles.badgeGray,
              ]}
            >
              <MaterialIcons
                name="work"
                size={12}
                color={flight.hasCheckedBags ? "#047857" : "#6b7280"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: flight.hasCheckedBags ? "#047857" : "#6b7280" },
                ]}
              >
                {flight.hasCheckedBags ? "수하물" : "별도"}
              </Text>
            </View>

            {/* 환불/변경 */}
            <View
              style={[
                styles.badge,
                flight.isRefundable ? styles.badgeBlue : styles.badgeRed,
              ]}
            >
              <MaterialIcons
                name={flight.isRefundable ? "check-circle-outline" : "cancel"}
                size={12}
                color={flight.isRefundable ? "#1d4ed8" : "#b91c1c"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: flight.isRefundable ? "#1d4ed8" : "#b91c1c" },
                ]}
              >
                {flight.isRefundable ? "환불" : "환불불가"}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                flight.isChangeable ? styles.badgePurple : styles.badgeRed,
              ]}
            >
              <MaterialIcons
                name="autorenew"
                size={12}
                color={flight.isChangeable ? "#6d28d9" : "#b91c1c"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: flight.isChangeable ? "#6d28d9" : "#b91c1c" },
                ]}
              >
                {flight.isChangeable ? "변경" : "변경불가"}
              </Text>
            </View>
          </View>

          {/* 🔔 종 아이콘: 기존 alerted 로직 그대로 + 로딩 처리만 추가 */}
          <View style={styles.iconRow}>
            <TouchableOpacity
              onPress={handleAlertPress}
              disabled={alertLoading}
            >
              {alertLoading ? (
                <ActivityIndicator
                  size="small"
                  color={alerted ? "gold" : "#6b7280"}
                />
              ) : (
                <Ionicons
                  name={alerted ? "notifications" : "notifications-outline"}
                  size={22}
                  color={alerted ? "gold" : "#6b7280"}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => toggleFavorite(flight)}>
              <FontAwesome
                name={favorite ? "heart" : "heart-o"}
                size={22}
                color={favorite ? "red" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FlightCard;

/* ===== 스타일: CityFlightListScreen 카드 그대로 이식 ===== */
const styles = StyleSheet.create({
  card: {
    width: width - 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    alignSelf: "center",
    marginBottom: 12,
  },

  /* 상단 */
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  airlineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 12, fontWeight: "900", color: "#4b5563" },
  airlineName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  flightNo: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  seatText: { marginTop: 2, fontSize: 12, fontWeight: "700", color: THEME },

  price: { fontSize: 20, fontWeight: "900", color: "#111827" },
  diffBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  diffUp: { backgroundColor: "#fee2e2" },
  diffDown: { backgroundColor: "#dcfce7" },
  diffText: { fontSize: 11, fontWeight: "800" },

  /* 경로/시간 */
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeCol: { alignItems: "center", minWidth: 64 },
  timeBig: { fontSize: 16, fontWeight: "800", color: "#111827" },
  airportCode: { fontSize: 12, color: "#6b7280" },

  timeline: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  line: { flex: 1, height: 1, backgroundColor: "#d1d5db" },
  duration: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  nonStop: { fontSize: 11, fontWeight: "700", color: THEME, marginTop: 2 },

  /* 하단 */
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgesRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreen: { backgroundColor: "#d1fae5" },
  badgeGray: { backgroundColor: "#f3f4f6" },
  badgeBlue: { backgroundColor: "#dbeafe" },
  badgePurple: { backgroundColor: "#ede9fe" },
  badgeRed: { backgroundColor: "#fee2e2" },
  badgeTxt: { fontSize: 11, fontWeight: "700" },

  iconRow: { flexDirection: "row", alignItems: "center", gap: 14 },
});
