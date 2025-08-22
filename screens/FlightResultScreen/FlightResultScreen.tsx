import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

import FlightResultHeader from "../../components/FlightResultHeader";
import FlightLoadingModal from "../../components/FlightLoadingModal";
import FlightCard from "../../components/FlightCard";
import { formatKoreanDate } from "../../utils/formatDate";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";

// ====== 유틸 ======
const THEME = "#0be5ecd7"; 

const norm = (s?: any) => (s == null ? "" : String(s).trim());
const upper = (s?: any) => norm(s).toUpperCase();
const toMs = (iso?: string) => {
  const t = Date.parse(norm(iso));
  return Number.isFinite(t) ? t : NaN;
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
    Number.isFinite(toMs(depIso)) ? toMs(depIso) : depIso,
    Number.isFinite(toMs(arrIso)) ? toMs(arrIso) : arrIso,
  ].join("|");
};

// PT#H#M -> minutes
const isoDurToMin = (s?: string) => {
  const str = norm(s);
  if (!str.startsWith("PT")) return NaN;
  const h = /(\d+)H/.exec(str)?.[1];
  const m = /(\d+)M/.exec(str)?.[1];
  const hh = h ? parseInt(h, 10) : 0;
  const mm = m ? parseInt(m, 10) : 0;
  const total = hh * 60 + mm;
  return Number.isFinite(total) ? total : NaN;
};

// 출발/도착 ISO에서 분 계산 (보정용)
const diffMinFromTimes = (start?: string, end?: string) => {
  const s = toMs(start);
  const e = toMs(end);
  if (Number.isFinite(s) && Number.isFinite(e) && e >= s) {
    return Math.round((e - (s as number)) / 60000);
  }
  return NaN;
};

// ====== 정렬 모드 ======
type SortMode = "LOWEST_PRICE" | "SHORTEST_DURATION" | "EARLIEST_DEPARTURE";
const SORT_LABEL: Record<SortMode, string> = {
  LOWEST_PRICE: "최저가",
  SHORTEST_DURATION: "최단시간",
  EARLIEST_DEPARTURE: "이른출발",
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
  const [sortMode, setSortMode] = useState<SortMode>("LOWEST_PRICE");

  // SearchScreen에서 이미 dedupe 후 넘어오지만, 혹시 대비해서 한 번 더 보수적 검사
  const deduped: FlightSearchResponseDto[] = useMemo(() => {
    if (!Array.isArray(results)) return [];
    const m = new Map<string, FlightSearchResponseDto>();
    for (const it of results) m.set(exactTupleKey(it), it);
    return Array.from(m.values());
  }, [results]);

  // 파생값 부여 (정렬용)
  type Derived = FlightSearchResponseDto & {
    __idx: number;
    __priceKRW: number;
    __outboundISO: string; // 출발 기준
    __totalDurationMin: number;
  };

  const withDerived: Derived[] = useMemo(() => {
    return deduped.map((f, i) => {
      // 가격 숫자화
      const priceKRW = Number(f.price);
      const __priceKRW = Number.isFinite(priceKRW) ? priceKRW : Number.POSITIVE_INFINITY;

      // 출발 ISO
      const depISO = norm(f.outboundDepartureTime ?? f.departureTime);
      const depMs = toMs(depISO);
      const __outboundISO =
        Number.isFinite(depMs) ? new Date(depMs as number).toISOString() : "9999-12-31T23:59:59.000Z";

      // 총 소요시간(분)
      const outMinFromDur = isoDurToMin(f.outboundDuration);
      const retMinFromDur = isoDurToMin(f.returnDuration);
      // ISO duration 파싱 실패하면 출/도착 시각으로 보정
      const outMinFallback = diffMinFromTimes(f.outboundDepartureTime, f.outboundArrivalTime);
      const retMinFallback = diffMinFromTimes(f.returnDepartureTime, f.returnArrivalTime);

      const outboundMin = Number.isFinite(outMinFromDur) ? outMinFromDur : outMinFallback;
      const returnMin = Number.isFinite(retMinFromDur) ? retMinFromDur : retMinFallback;

      // 편도/왕복 모두 커버
      let total = Number.NaN;
      if (Number.isFinite(outboundMin) && Number.isFinite(returnMin)) {
        total = (outboundMin as number) + (returnMin as number);
      } else if (Number.isFinite(outboundMin)) {
        total = outboundMin as number;
      }

      const __totalDurationMin = Number.isFinite(total) ? (total as number) : Number.POSITIVE_INFINITY;

      return {
        ...f,
        __idx: i,
        __priceKRW,
        __outboundISO,
        __totalDurationMin,
      };
    });
  }, [deduped]);

  // Comparator 팩토리 (stable sort 보장: 마지막 키로 __idx)
  const makeComparator = (mode: SortMode) => {
    switch (mode) {
      case "LOWEST_PRICE":
        return (a: Derived, b: Derived) =>
          a.__priceKRW - b.__priceKRW ||
          a.__totalDurationMin - b.__totalDurationMin ||
          (a.__outboundISO < b.__outboundISO ? -1 : a.__outboundISO > b.__outboundISO ? 1 : 0) ||
          a.__idx - b.__idx;
      case "SHORTEST_DURATION":
        return (a: Derived, b: Derived) =>
          a.__totalDurationMin - b.__totalDurationMin ||
          a.__priceKRW - b.__priceKRW ||
          (a.__outboundISO < b.__outboundISO ? -1 : a.__outboundISO > b.__outboundISO ? 1 : 0) ||
          a.__idx - b.__idx;
      case "EARLIEST_DEPARTURE":
      default:
        return (a: Derived, b: Derived) =>
          (a.__outboundISO < b.__outboundISO ? -1 : a.__outboundISO > b.__outboundISO ? 1 : 0) ||
          a.__priceKRW - b.__priceKRW ||
          a.__totalDurationMin - b.__totalDurationMin ||
          a.__idx - b.__idx;
    }
  };

  const sortedData = useMemo(() => {
    const arr = withDerived.slice();
    arr.sort(makeComparator(sortMode));
    return arr as FlightSearchResponseDto[];
  }, [withDerived, sortMode]);

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
    console.log("[DEBUG] tuple duplicates", Array.from(byTuple.entries()).filter(([, c]) => c > 1));
    console.log("[DEBUG] flightNo duplicates", Array.from(byFlightNo.entries()).filter(([, c]) => c > 1));
  }, [results]);

  const handleCardPress = (flight: FlightSearchResponseDto) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("FlightDetail", { flight });
    }, 1555);
  };

  // ====== 정렬 세그먼트 (Kayak 스타일 간결 탭) ======
  const SortSegment = () => {
    const modes: SortMode[] = ["LOWEST_PRICE", "SHORTEST_DURATION", "EARLIEST_DEPARTURE"];
    return (
      <View style={styles.sortBar}>
        {modes.map((m) => {
          const active = sortMode === m;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.sortChip, active && styles.sortChipActive]}
              onPress={() => setSortMode(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortText, active && styles.sortTextActive]}>{SORT_LABEL[m]}</Text>
              {active && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </View>
    );
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

      {/* Kayak 위치: 헤더 바로 아래 정렬 바 */}
      <SortSegment />

      <FlightLoadingModal visible={loading} />

      <FlatList
        contentContainerStyle={styles.listContainer}
        data={sortedData}
        keyExtractor={(item) => exactTupleKey(item)} // ✅ 절대 고유 키
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
  sortBar: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: "#fff",
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    position: "relative",
  },
  sortChipActive: {
    backgroundColor: "#e6fbfc",
    borderWidth: 1,
    borderColor: THEME,
  },
  sortText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  sortTextActive: {
    color: "#065f5b",
  },
  underline: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 4,
    height: 2,
    borderRadius: 1,
    backgroundColor: THEME,
  },
});
