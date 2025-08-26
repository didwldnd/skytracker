import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import {
  formatFlightTime,
  formatDuration, // 어댑터에서 formatDurationKo로 연결됨
  formatDayShiftBadge,
  dayShiftByDuration, // ✅ 새로 사용
} from "../../utils/formatFlightTime";
import {
  FontAwesome,
  Feather,
  Entypo,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { formatPrice } from "../../utils/formatters";

type DetailRouteProp = RouteProp<RootStackParamList, "FlightDetail">;

const THEME = "#0be5ecd7";

const FlightDetailScreen: React.FC = () => {
  const { params } = useRoute<DetailRouteProp>();
  const { flight } = params;

  console.log("상세 flight 데이터:", flight);
  console.log(
    "[CHK]",
    flight.outboundDepartureTime,
    flight.outboundArrivalTime,
    flight.outboundDuration,
    flight.returnDuration
  );

  // 추가: travelClass / price 확인 로그
  console.log(
    "[DIAG] TravelClass =",
    flight.travelClass,
    "Price =",
    flight.price
  );

  // FlightDetailScreen에서
const outSegs = (flight as any).__segmentsOutbound ?? [];
const retSegs = (flight as any).__segmentsReturn ?? [];

const stopsCount = (segs: any[]) => Math.max(0, segs.length - 1);
const viaCodes = (segs: any[]) => segs.slice(0, -1).map(s => s.arrival?.iataCode);
const layoversMin = (segs: any[]) =>
  segs.slice(0, -1).map((s, i) => {
    const currArr = new Date(s.arrival.at).getTime();
    const nextDep = new Date(segs[i + 1].departure.at).getTime();
    return Math.max(0, Math.round((nextDep - currArr) / 60000));
  });

// ✅ 콘솔 확인 포인트 (클릭 후 detail 진입 시)
console.log("[LAYOVER] OUT stops:", stopsCount(outSegs));
console.log("[LAYOVER] OUT via:", viaCodes(outSegs));
console.log("[LAYOVER] OUT layovers(min):", layoversMin(outSegs));

console.log("[LAYOVER] RET stops:", stopsCount(retSegs));
console.log("[LAYOVER] RET via:", viaCodes(retSegs));
console.log("[LAYOVER] RET layovers(min):", layoversMin(retSegs));
console.log("[SEGCHK] outSegs exists?", !!outSegs, "len:", outSegs?.length);
console.log("[SEGCHK] retSegs exists?", !!retSegs, "len:", retSegs?.length);
console.log("[SEGCHK] first outbound seg:", outSegs?.[0]);


  // 수상한 패턴 감지
  if (["ECONOMY", "BUSINESS"].includes(flight.travelClass)) {
    if (!flight.price || flight.price <= 0) {
      console.warn("[RED FLAG] 가격 정보 없음/0원 → 서버 응답 이상 가능성");
    }
  }

  // ✅ 왕복/편도 판별: return* 존재 여부로
  const isRoundTrip = !!(
    flight.returnDepartureTime && flight.returnArrivalTime
  );

  // ✅ 가는 편 세트
  const oDep = flight.outboundDepartureTime;
  const oArr = flight.outboundArrivalTime;
  const oDur = flight.outboundDuration;
  const oShift = formatDayShiftBadge(dayShiftByDuration(oDur));
  const oArrText = oShift
    ? `${formatFlightTime(oArr, flight.arrivalAirport)}  ${oShift}`
    : formatFlightTime(oArr, flight.arrivalAirport);

  // ✅ 오는 편 세트(있을 때만)
  const rDep = flight.returnDepartureTime;
  const rArr = flight.returnArrivalTime;
  const rDur = flight.returnDuration;
  const rShift = formatDayShiftBadge(dayShiftByDuration(rDur));
  const rArrText = rShift
    ? `${formatFlightTime(rArr, flight.departureAirport)}  ${rShift}`
    : formatFlightTime(rArr, flight.departureAirport);

  return (
    <ScrollView style={styles.container}>
      {/* 항공사 헤더 */}
      <View style={styles.card}>
        <View style={styles.headerCard}>
          <View style={styles.headerTitleRow}>
            <FontAwesome name="plane" size={28} color="white" />
            <View>
              <Text style={styles.airlineName}>{flight.airlineName}</Text>
              <Text style={styles.airlineCode}>({flight.airlineCode})</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.flightBadge}>
            <Text style={styles.flightBadgeText}>
              항공편 {flight.flightNumber}
            </Text>
          </View>
        </View>
      </View>

      {/* 가는 편 */}
      <SectionCard
        title="가는 편 정보"
        icon={<Entypo name="location-pin" size={20} color={THEME} />}
      >
        <LocationBlock
          title="출발"
          airport={flight.departureAirport}
          time={formatFlightTime(oDep, flight.departureAirport)}
        />
        <LocationBlock
          title="도착"
          airport={flight.arrivalAirport}
          time={oArrText}
        />
        <InfoRow
          icon={<Feather name="calendar" size={18} color={THEME} />}
          label="총 소요 시간"
          value={formatDuration(oDur)}
        />
      </SectionCard>

      {/* 오는 편 (왕복일 때만) */}
      {isRoundTrip && (
        <SectionCard
          title="오는 편 정보"
          icon={<Entypo name="location-pin" size={20} color={THEME} />}
        >
          <LocationBlock
            title="출발"
            airport={flight.arrivalAirport}
            time={formatFlightTime(rDep, flight.arrivalAirport)}
          />
          <LocationBlock
            title="도착"
            airport={flight.departureAirport}
            time={rArrText}
          />
          <InfoRow
            icon={<Feather name="calendar" size={18} color={THEME} />}
            label="비행 시간"
            value={formatDuration(rDur)}
          />
        </SectionCard>
      )}

      {/* 좌석 및 서비스 */}
      <SectionCard
        title="좌석 및 서비스"
        icon={<FontAwesome name="users" size={20} color={THEME} />}
      >
        <SimpleRow label="좌석 등급" value={flight.travelClass} />
        <SimpleRow
          label="예약 가능 좌석"
          value={`${flight.numberOfBookableSeats}석`}
        />
      </SectionCard>

      {/* 정책 정보 */}
      <SectionCard
        title="정책 정보"
        icon={<FontAwesome name="suitcase" size={20} color={THEME} />}
      >
        <ToggleRow label="수하물 포함" value={!!flight.hasCheckedBags} />
        {/* ✅ 필드명 교정: refundable / changeable */}
        <ToggleRow label="환불 가능" value={!!flight.isRefundable} />
        <ToggleRow label="변경 가능" value={!!flight.isChangeable} />
      </SectionCard>

      {/* 가격 정보 */}
      <View style={styles.card}>
        <View style={styles.priceHeader}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons
              name="currency-krw"
              size={20}
              color="white"
            />
            <Text style={styles.priceTitle}>가격 정보</Text>
          </View>
        </View>
        <View style={styles.priceBody}>
          <Text style={styles.priceText}>
            {formatPrice(flight.price, flight.currency ?? "KRW")}
          </Text>
          <Text style={styles.priceDesc}>총 항공료 (세금 포함)</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  card: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: THEME,
    borderRadius: 8,
    overflow: "hidden",
  },
  headerCard: { backgroundColor: THEME, padding: 16 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  airlineName: { color: "white", fontSize: 20, fontWeight: "bold" },
  airlineCode: { color: "white", fontSize: 16, opacity: 0.9 },
  headerContent: { padding: 16 },
  flightBadge: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  flightBadgeText: { color: "black", fontWeight: "600" },
  priceHeader: { backgroundColor: THEME, padding: 16 },
  priceTitle: { color: "white", fontSize: 18, marginLeft: 8 },
  priceBody: { padding: 24, alignItems: "center" },
  priceText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginBottom: 6,
  },
  priceDesc: { color: "#6b7280" },
});

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <View style={{ backgroundColor: "#f0fdfa", padding: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon}
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1e293b" }}>
          {title}
        </Text>
      </View>
    </View>
    <View style={{ padding: 20 }}>{children}</View>
  </View>
);

const LocationBlock = ({
  title,
  airport,
  time,
}: {
  title: string;
  airport?: string;
  time?: string;
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontWeight: "600", color: "#1e293b" }}>{title}</Text>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
      {airport || "정보 없음"}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
      }}
    >
      <Feather name="clock" size={16} color="#6b7280" />
      <Text style={{ color: "#6b7280" }}>{time || "시간 없음"} (현지시간)</Text>
    </View>
  </View>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 12,
    }}
  >
    {icon}
    <View>
      <Text style={{ fontWeight: "600", color: "#1e293b" }}>{label}</Text>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: "black" }}>
        {value || "정보 없음"}
      </Text>
    </View>
  </View>
);

const SimpleRow = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    }}
  >
    <Text style={{ fontWeight: "600", color: "#1e293b" }}>{label}</Text>
    <Text style={{ color: "black", fontWeight: "bold" }}>{value}</Text>
  </View>
);

const ToggleRow = ({ label, value }: { label: string; value: boolean }) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    }}
  >
    <Text style={{ fontWeight: "600", color: "#1e293b" }}>{label}</Text>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {value ? (
        <>
          <Feather name="check-circle" size={20} color="green" />
          <Text style={{ color: "green", fontWeight: "600" }}>예</Text>
        </>
      ) : (
        <>
          <Feather name="x-circle" size={20} color="red" />
          <Text style={{ color: "red", fontWeight: "600" }}>아니오</Text>
        </>
      )}
    </View>
  </View>
);

export default FlightDetailScreen;
