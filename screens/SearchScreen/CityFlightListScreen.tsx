// screens/CityFlightListScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import type { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const THEME = "#0be5ecd7";
const { width } = Dimensions.get("window");

// ---- 네비게이션 파라미터 타입 ----
type RootStackParamList = {
  CityFlightList: { city: { cityKo: string; cityEn: string } };
};

type Props = NativeStackScreenProps<RootStackParamList, "CityFlightList">;

// ---- 유틸 ----
const formatKRW = (n: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const formatDuration = (iso: string) => {
  const m = iso?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return "";
  const h = Number(m[1] || 0);
  const min = Number(m[2] || 0);
  if (h && min) return `${h}시간 ${min}분`;
  if (h) return `${h}시간`;
  return `${min}분`;
};

const diffPct = (current: number, previous?: number) => {
  if (!previous || previous === current)
    return { text: "", trend: "flat" as const };
  const pct = ((current - previous) / previous) * 100;
  const sign = pct > 0 ? "+" : "";
  return {
    text: `${sign}${pct.toFixed(1)}%`,
    trend: pct > 0 ? ("up" as const) : ("down" as const),
  };
};

// ---- 도착공항 맵(도시별) ----
const arrivalMap: Record<string, string[]> = {
  Tokyo: ["NRT", "HND"],
  Osaka: ["KIX"],
  Paris: ["CDG"],
  "New York": ["JFK", "EWR"],
  Bangkok: ["BKK"],
};

// ---- 미리보기용 목 데이터 (v0와 동일한 속성명 사용) ----
type Flight = Omit<
  FlightSearchResponseDto,
  | "refundable"         // RN은 isRefundable 사용
  | "changeable"         // RN은 isChangeable 사용
  | "departureTime"      // 단일 필드 안 씀
  | "arrivalTime"
  | "duration"
  | "returnDepartureTime" // 왕복 필드도 목에서는 없을 수 있어 optional로
  | "returnArrivalTime"
  | "returnDuration"
> & {
  isRefundable: boolean;
  isChangeable: boolean;
  previousPrice?: number;
  nonStop?: boolean;

  // 백호환/옵셔널 처리
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: string;
};

const mockFlights: Flight[] = [
  {
    airlineCode: "KE",
    airlineName: "대한항공",
    flightNumber: "KE708",
    departureAirport: "ICN",
    arrivalAirport: "NRT",
    outboundDepartureTime: "2025-09-10T09:30:00+09:00",
    outboundArrivalTime: "2025-09-10T11:45:00+09:00",
    outboundDuration: "PT2H15M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 8,
    hasCheckedBags: true,
    currency: "KRW",
    price: 285000,
    previousPrice: 295000,
    isRefundable: true,
    isChangeable: true,
    nonStop: false,
  },
  {
    airlineCode: "OZ",
    airlineName: "아시아나항공",
    flightNumber: "OZ102",
    departureAirport: "ICN",
    arrivalAirport: "HND",
    outboundDepartureTime: "2025-09-10T14:20:00+09:00",
    outboundArrivalTime: "2025-09-10T16:30:00+09:00",
    outboundDuration: "PT2H10M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 12,
    hasCheckedBags: true,
    currency: "KRW",
    price: 298000,
    previousPrice: 285000,
    isRefundable: false,
    isChangeable: true,
    nonStop: true,
  },
  {
    airlineCode: "7C",
    airlineName: "제주항공",
    flightNumber: "7C1102",
    departureAirport: "ICN",
    arrivalAirport: "NRT",
    outboundDepartureTime: "2025-09-10T06:45:00+09:00",
    outboundArrivalTime: "2025-09-10T09:00:00+09:00",
    outboundDuration: "PT2H15M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 4,
    hasCheckedBags: false,
    currency: "KRW",
    price: 245000,
    isRefundable: false,
    isChangeable: false,
    nonStop: true,
  },
  {
    airlineCode: "TW",
    airlineName: "티웨이항공",
    flightNumber: "TW202",
    departureAirport: "PUS",
    arrivalAirport: "NRT",
    outboundDepartureTime: "2025-09-10T13:15:00+09:00",
    outboundArrivalTime: "2025-09-10T15:45:00+09:00",
    outboundDuration: "PT2H30M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 6,
    hasCheckedBags: false,
    currency: "KRW",
    price: 235000,
    previousPrice: 245000,
    isRefundable: false,
    isChangeable: true,
    nonStop: true,
  },
  {
    airlineCode: "LJ",
    airlineName: "진에어",
    flightNumber: "LJ204",
    departureAirport: "ICN",
    arrivalAirport: "HND",
    outboundDepartureTime: "2025-09-10T07:15:00+09:00",
    outboundArrivalTime: "2025-09-10T09:25:00+09:00",
    outboundDuration: "PT2H10M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 13,
    hasCheckedBags: false,
    currency: "KRW",
    price: 268000,
    previousPrice: 275000,
    isRefundable: false,
    isChangeable: true,
    nonStop: true,
  },
];

export default function CityFlightListScreen({ route }: Props) {
  const { city } = route.params; // { cityKo, cityEn }

  const [depFilter, setDepFilter] = useState<"ALL" | "ICN" | "PUS">("ALL");
  const [directOnly, setDirectOnly] = useState(false);

  const flights = useMemo(() => {
    const codes = arrivalMap[city.cityEn] ?? [];
    let f = mockFlights.filter((x) => codes.includes(x.arrivalAirport));

    if (depFilter !== "ALL")
      f = f.filter((x) => x.departureAirport === depFilter);
    if (directOnly) f = f.filter((x) => x.nonStop);

    // 최저가 오름차순 "고정"
    return [...f].sort((a, b) => a.price - b.price);
  }, [city.cityEn, depFilter, directOnly]);

  const renderItem = ({ item }: { item: Flight }) => {
    const diff = diffPct(item.price, item.previousPrice);
    return (
      <Pressable style={styles.card}>
        {/* 상단: 항공사 / 가격 */}
        <View style={styles.cardTop}>
          <View style={styles.airlineRow}>
            <View style={styles.logoDot}>
              <Text style={styles.logoText}>{item.airlineCode}</Text>
            </View>
            <View>
              <Text style={styles.airlineName}>{item.airlineName}</Text>
              <Text style={styles.flightNo}>{item.flightNumber}</Text>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.price}>{formatKRW(item.price)}</Text>
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
            <Text style={styles.timeBig}>
              {formatTime(item.outboundDepartureTime)}
            </Text>
            <Text style={styles.airportCode}>{item.departureAirport}</Text>
          </View>

          <View style={styles.timeline}>
            <View style={styles.line} />
            <View style={{ alignItems: "center" }}>
              <Ionicons name="time-outline" size={14} color="#9ca3af" />
              <Text style={styles.duration}>
                {formatDuration(item.outboundDuration)}
              </Text>
              {item.nonStop && <Text style={styles.nonStop}>직항</Text>}
            </View>
            <View style={styles.line} />
          </View>

          <View style={styles.timeCol}>
            <Text style={styles.timeBig}>
              {formatTime(item.outboundArrivalTime)}
            </Text>
            <Text style={styles.airportCode}>{item.arrivalAirport}</Text>
          </View>
        </View>

        {/* 서비스/좌석 */}
        <View style={styles.bottomRow}>
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badge,
                item.hasCheckedBags ? styles.badgeGreen : styles.badgeGray,
              ]}
            >
              <MaterialIcons
                name="work"
                size={12}
                color={item.hasCheckedBags ? "#047857" : "#6b7280"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: item.hasCheckedBags ? "#047857" : "#6b7280" },
                ]}
              >
                {item.hasCheckedBags ? "수하물" : "별도"}
              </Text>
            </View>

            {/* 환불 배지 */}
            <View
              style={[
                styles.badge,
                item.isRefundable ? styles.badgeBlue : styles.badgeRed,
              ]}
            >
              <MaterialIcons
                name={item.isRefundable ? "check-circle-outline" : "cancel"}
                size={12}
                color={item.isRefundable ? "#1d4ed8" : "#b91c1c"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: item.isRefundable ? "#1d4ed8" : "#b91c1c" },
                ]}
              >
                {item.isRefundable ? "환불" : "환불불가"}
              </Text>
            </View>

            {/* 변경 배지 */}
            <View
              style={[
                styles.badge,
                item.isChangeable ? styles.badgePurple : styles.badgeRed,
              ]}
            >
              <MaterialIcons
                name="autorenew"
                size={12}
                color={item.isChangeable ? "#6d28d9" : "#b91c1c"}
              />
              <Text
                style={[
                  styles.badgeTxt,
                  { color: item.isChangeable ? "#6d28d9" : "#b91c1c" },
                ]}
              >
                {item.isChangeable ? "변경" : "변경불가"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.seats}>
              잔여 {item.numberOfBookableSeats}석
            </Text>
            <MaterialIcons name="chevron-right" size={18} color="#9ca3af" />
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {city.cityKo} ({city.cityEn})행 항공편
          </Text>
          <Text style={styles.subtitle}>한국 출발 · 최저가순 고정</Text>
        </View>
        <View style={styles.fixedBadge}>
          <Text style={styles.fixedBadgeTxt}>최저가 정렬 고정</Text>
        </View>
      </View>

      {/* 필터 칩 */}
      <View style={styles.filters}>
        {(["ALL", "ICN", "PUS"] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setDepFilter(k)}
            style={[styles.chip, depFilter === k && { backgroundColor: THEME }]}
          >
            <Text
              style={[styles.chipTxt, depFilter === k && { color: "#fff" }]}
            >
              {k === "ALL" ? "전체" : k}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setDirectOnly((v) => !v)}
          style={[
            styles.chip,
            directOnly && {
              backgroundColor: THEME,
              flexDirection: "row",
              gap: 6,
            },
          ]}
        >
          <MaterialIcons
            name="flight"
            size={14}
            color={directOnly ? "#fff" : "#374151"}
          />
          <Text style={[styles.chipTxt, directOnly && { color: "#fff" }]}>
            직항만
          </Text>
        </Pressable>
      </View>

      {/* 리스트 */}
      <FlatList
        data={flights}
        keyExtractor={(it, i) => `${it.flightNumber}-${i}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6b7280" },
  fixedBadge: {
    backgroundColor: THEME,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  fixedBadgeTxt: { color: "#fff", fontWeight: "700", fontSize: 12 },

  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
  },
  chipTxt: { fontSize: 12, fontWeight: "700", color: "#374151" },

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
  },
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
  seats: { fontSize: 12, color: "#6b7280" },
});
