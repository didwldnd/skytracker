import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { formatFlightTime, formatDuration } from "../../utils/formatFlightTime";
import { FontAwesome, Feather, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type DetailRouteProp = RouteProp<RootStackParamList, "FlightDetail">;

const FlightDetailScreen: React.FC = () => {
  const { params } = useRoute<DetailRouteProp>();
  const { flight } = params;

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

      {/* 비행 정보 */}
      <SectionCard
        title="비행 정보"
        icon={<Entypo name="location-pin" size={20} color="#0be5ecd7" />}
      >
        <LocationBlock
          title="출발"
          airport={flight.departureAirport}
          time={formatFlightTime(flight.departureTime, flight.departureAirport)}
        />
        <LocationBlock
          title="도착"
          airport={flight.arrivalAirport}
          time={formatFlightTime(flight.arrivalTime, flight.arrivalAirport)}
        />
        <InfoRow
          icon={<Feather name="calendar" size={18} color="#0be5ecd7" />}
          label="비행 시간"
          value={formatDuration(flight.duration)}
        />
      </SectionCard>

      {/* 좌석 및 서비스 */}
      <SectionCard
        title="좌석 및 서비스"
        icon={<FontAwesome name="users" size={20} color="#0be5ecd7" />}
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
        icon={<FontAwesome name="suitcase" size={20} color="#0be5ecd7" />}
      >
        <ToggleRow label="수하물 포함" value={flight.hasCheckedBags} />
        <ToggleRow label="환불 가능" value={flight.isRefundable} />
        <ToggleRow label="변경 가능" value={flight.isChangeable} />
      </SectionCard>

      {/* 가격 정보 */}
      <View style={styles.card}>
        <View style={styles.priceHeader}>
          <View style={styles.headerTitleRow}>
            <MaterialCommunityIcons name="currency-krw" size={20} color="white" />
            <Text style={styles.priceTitle}>가격 정보</Text>
          </View>
        </View>
        <View style={styles.priceBody}>
          <Text style={styles.priceText}>
            {flight.price.toLocaleString()} {flight.currency}
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
    borderColor: "#0be5ecd7",
    borderRadius: 8,
    overflow: "hidden",
  },
  headerCard: { backgroundColor: "#0be5ecd7", padding: 16 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  airlineName: { color: "white", fontSize: 20, fontWeight: "bold" },
  airlineCode: { color: "white", fontSize: 16, opacity: 0.9 },
  headerContent: { padding: 16 },
  flightBadge: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  flightBadgeText: { color: "black", fontWeight: "600" },
  priceHeader: { backgroundColor: "#0be5ecd7", padding: 16 },
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
  airport: string;
  time: string;
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontWeight: "600", color: "#1e293b" }}>{title}</Text>
    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>
      {airport}
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
      <Text style={{ color: "#6b7280" }}>{time} (현지시간)</Text>
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
  value: string;
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
        {value}
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

// 현지시간은 계속 추가 시켜줘야함
