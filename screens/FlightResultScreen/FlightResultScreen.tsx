import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, Text } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

import FlightResultHeader from "../../components/FlightResultHeader";
import FlightLoadingModal from "../../components/FlightLoadingModal";
import FlightCard from "../../components/FlightCard";
import { formatKoreanDate } from "../../utils/formatDate";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";

// ====== 중복 체크/키 생성을 위해 SearchScreen과 동일 헬퍼 사용 ======
const norm = (s?: any) => (s == null ? "" : String(s).trim());
const upper = (s?: any) => norm(s).toUpperCase();
const toMs = (iso?: string) => {
  const t = Date.parse(norm(iso));
  return Number.isFinite(t) ? t : 0;
};
const exactTupleKey = (f: any) => {
  const depIso = f.outboundDepartureTime ?? f.departureTime ?? "";
  const arrIso = f.outboundArrivalTime ?? f.arrivalTime ?? "";
  return [
    "TUPLE",
    upper(f.airlineCode),
    String(f.flightNumber ?? "").replace(/^0+/, "").trim(),
    upper(f.departureAirport),
    upper(f.arrivalAirport),
    toMs(depIso) || depIso,
    toMs(arrIso) || arrIso,
  ].join("|");
};

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

  // SearchScreen에서 이미 dedupe 후 넘어오지만, 혹시 대비해서 한 번 더 보수적 검사
  const data: FlightSearchResponseDto[] = useMemo(() => {
    if (!Array.isArray(results)) return [];
    const m = new Map<string, FlightSearchResponseDto>();
    for (const it of results) {
      m.set(exactTupleKey(it), it);
    }
    return Array.from(m.values());
  }, [results]);

  // 디버깅: 편명/키별 개수 로그
  useEffect(() => {
    const byTuple = new Map<string, number>();
    const byFlightNo = new Map<string, number>();
    for (const it of results) {
      const tkey = exactTupleKey(it);
      byTuple.set(tkey, (byTuple.get(tkey) ?? 0) + 1);
      const fn = `${upper(it.airlineCode)} ${String(it.flightNumber ?? "").replace(/^0+/, "").trim()}`;
      byFlightNo.set(fn, (byFlightNo.get(fn) ?? 0) + 1);
    }
    console.log("[DEBUG] tuple duplicates", Array.from(byTuple.entries()).filter(([,c])=>c>1));
    console.log("[DEBUG] flightNo duplicates", Array.from(byFlightNo.entries()).filter(([,c])=>c>1));
  }, [results]);

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
        data={data}
        keyExtractor={(item) => exactTupleKey(item)} // ✅ 절대 고유 키 사용
        renderItem={({ item }) => (
          <FlightCard flight={item} onPress={() => handleCardPress(item)} />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", padding: 24, color: "#666" }}>
            조건에 맞는 항공편이 없습니다.
          </Text>
        }
      />
    </View>
  );
};

export default FlightResultScreen;

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
});
