import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../App";
import LocationSelector from "./LocationSelector";
import DateSelector from "./DateSelector";
import PassengerSelector from "./PassengerSelector";
import SeatStopoverSelector from "./SeatStopoverSelector";
import SearchButtons from "./SearchButtons";
import PopularScreen from "./PopularScreen";
import FlightLoadingModal from "../../components/FlightLoadingModal";
import SearchModal from "../../components/SearchModal";
import { searchFlights } from "../../utils/api";
import { FlightSearchRequestDto } from "../../types/FlightSearchRequestDto";
import { airportData } from "../../data/airportData";
import { sanitizeResults } from "../../utils/flightSanitizer";
import { useUserSettings } from "../../context/UserSettingsContext";
import { useTheme } from "../../context/ThemeContext";

// ====== 중복 제거용 공통 헬퍼 ======
const norm = (s?: any) => (s == null ? "" : String(s).trim());
const upper = (s?: any) => norm(s).toUpperCase();
const toMs = (iso?: string) => {
  const t = Date.parse(norm(iso));
  return Number.isFinite(t) ? t : 0;
};
const isDirect = (f: any) =>
  f?.nonStop === true || f?.nonStop === "true" || f?.nonStop === 1;

const priceOf = (f: any) => {
  const p = Number(f?.price);
  return Number.isFinite(p) ? p : Number.POSITIVE_INFINITY;
};

const exactTupleKey = (f: any) => {
  const outDepIso = f.outboundDepartureTime ?? f.departureTime ?? "";
  const outArrIso = f.outboundArrivalTime ?? f.arrivalTime ?? "";
  const retDepIso = f.returnDepartureTime ?? "";
  const retArrIso = f.returnArrivalTime ?? "";

  return [
    "TUPLE",
    upper(f.airlineCode),
    String(f.flightNumber ?? "")
      .replace(/^0+/, "")
      .trim(),
    upper(f.departureAirport),
    upper(f.arrivalAirport),
    toMs(outDepIso) || outDepIso,
    toMs(outArrIso) || outArrIso,
    toMs(retDepIso) || retDepIso,
    toMs(retArrIso) || retArrIso,
  ].join("|");
};

const dedupeExact = (list: any[]) => {
  const m = new Map<string, any>();
  for (const it of Array.isArray(list) ? list : []) {
    const k = exactTupleKey(it);
    const prev = m.get(k);
    if (!prev) {
      m.set(k, it);
    } else {
      if (priceOf(it) < priceOf(prev)) {
        m.set(k, it);
      }
    }
  }
  return Array.from(m.values());
};

// ====== Quick Actions 정의 ======
type QuickAction = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  tab?: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  { id: "alert",   icon: "notifications-outline", label: "가격 알림",  tab: "알리미" },
  { id: "popular", icon: "flame-outline",          label: "인기 노선" },
  { id: "direct",  icon: "airplane-outline",       label: "직항 특가" },
  { id: "profile", icon: "person-outline",         label: "내 프로필", tab: "프로필" },
];

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();

  // ── 스크롤 / 레이아웃 ref ──
  const scrollRef = useRef<ScrollView>(null);
  const [popularY, setPopularY] = useState(0);

  // ── 비즈니스 상태 (원본 유지) ──
  const [tripType, setTripType] = useState<"왕복" | "편도">("왕복");
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedField, setSelectedField] = useState<
    "departure" | "destination" | null
  >(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [seatClass, setSeatClass] = useState("일반석");
  const [stopover, setStopover] = useState("상관없음");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"seatClass" | "stopover">(
    "seatClass"
  );
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showMinWarning, setShowMinWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [passengerCounts, setPassengerCounts] = useState({
    adult: 1,
    student: 0,
    teen: 0,
    child: 0,
    infantWithSeat: 0,
    infantOnLap: 0,
  });

  const totalPassengers = useMemo(
    () => Object.values(passengerCounts).reduce((a, b) => a + b, 0),
    [passengerCounts]
  );

  const sameAirports = useMemo(
    () => !!departure && !!destination && departure === destination,
    [departure, destination]
  );

  const isSearchDisabled = !departure || !destination || sameAirports;

  // ── 원본 핸들러 (수정 없음) ──
  const handleSelectAirport = (code: string) => {
    if (selectedField === "departure") setDeparture(code);
    else if (selectedField === "destination") setDestination(code);
    setShowSearchModal(false);
  };

  const increment = (type: keyof typeof passengerCounts) => {
    if (totalPassengers >= 9) {
      setShowWarning(true);
      return;
    }
    setPassengerCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const decrement = (type: keyof typeof passengerCounts) => {
    const newValue = passengerCounts[type] - 1;
    const newCounts = { ...passengerCounts, [type]: Math.max(newValue, 0) };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);
    if (newTotal < 1) {
      setShowMinWarning(true);
      return;
    }
    setPassengerCounts(newCounts);
  };

  const handleSwap = () => {
    if (!departure || !destination) {
      Alert.alert(
        "교환 불가",
        "출발지와 도착지를 모두 선택한 후 교환할 수 있습니다."
      );
      return;
    }
    if (sameAirports) {
      Alert.alert(
        "교환 불가",
        "출발지와 도착지가 같습니다. 다른 공항을 선택해주세요."
      );
      return;
    }
    setDeparture((prev) => {
      setDestination(prev);
      return destination;
    });
  };

  const { preferredDepartureAirport, loading: settingsLoading } =
    useUserSettings();

  useEffect(() => {
    if (settingsLoading) return;
    if (!preferredDepartureAirport) return;
    setDeparture(preferredDepartureAirport);
  }, [settingsLoading, preferredDepartureAirport]);

  const resetForm = () => {
    setDeparture(preferredDepartureAirport ?? "");
    setDestination("");
    setDepartureDate(new Date());
    setReturnDate(new Date());
    setPassengerCounts({
      adult: 1,
      student: 0,
      teen: 0,
      child: 0,
      infantWithSeat: 0,
      infantOnLap: 0,
    });
    setSeatClass("일반석");
    setStopover("상관없음");
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  const isSearchingRef = useRef(false);

  // ── Quick Action 핸들러 ──
  const handleQuickAction = (action: QuickAction) => {
    if (action.tab) {
      (navigation as any).navigate(action.tab);
      return;
    }
    if (action.id === "popular") {
      scrollRef.current?.scrollTo({ y: popularY, animated: true });
      return;
    }
    if (action.id === "direct") {
      setStopover("직항만");
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.subText }]}>
            안녕하세요 ✈️
          </Text>
          <Text style={[styles.greetingSub, { color: theme.text }]}>
            어디로 떠나실 건가요?
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.profileBtn,
            { borderColor: theme.border, backgroundColor: theme.card },
          ]}
          onPress={() => (navigation as any).navigate("프로필")}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* ── 검색 카드 ── */}
      <View
        style={[
          styles.searchCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {/* 왕복 / 편도 토글 */}
        <View style={styles.tripTypeRow}>
          {(["왕복", "편도"] as const).map((type) => {
            const isActive = tripType === type;
            return (
              <TouchableOpacity
                key={type}
                onPress={() => setTripType(type)}
                style={[
                  styles.tripTypeButton,
                  {
                    backgroundColor: isActive ? theme.primary : "transparent",
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tripTypeText,
                    {
                      color: isActive ? "#FFFFFF" : theme.subText,
                      fontWeight: isActive ? "600" : "400",
                    },
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <LocationSelector
          departure={departure}
          destination={destination}
          onSwap={handleSwap}
          onSelectField={(field) => {
            setSelectedField(field);
            setShowSearchModal(true);
          }}
        />

        <DateSelector
          tripType={tripType}
          departureDate={departureDate}
          returnDate={returnDate}
          showDeparturePicker={showDeparturePicker}
          setShowDeparturePicker={setShowDeparturePicker}
          setDepartureDate={setDepartureDate}
          setReturnDate={setReturnDate}
          startDate={startDate}
          endDate={endDate}
          markedDates={markedDates}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setMarkedDates={setMarkedDates}
          currentMonth={currentMonth}
          setCurrentMonth={setCurrentMonth}
        />

        {/* 여행객 / 좌석 / 경유횟수 */}
        <View style={styles.selectorRow}>
          <View style={styles.selectorItem}>
            <Text style={[styles.label, { color: theme.subText }]}>여행객</Text>
            <TouchableOpacity
              style={[
                styles.input,
                { backgroundColor: theme.muted, borderColor: theme.border },
              ]}
              onPress={() => setShowPassengerModal(true)}
            >
              <Text
                style={{ color: theme.text, fontWeight: "500" }}
              >{`총 ${totalPassengers}명`}</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: "좌석", value: seatClass, type: "seatClass" },
            { label: "경유횟수", value: stopover, type: "stopover" },
          ].map((item) => (
            <View key={item.type} style={styles.selectorItem}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {item.label}
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  { backgroundColor: theme.muted, borderColor: theme.border },
                ]}
                onPress={() => {
                  setModalType(item.type as "seatClass" | "stopover");
                  setModalVisible(true);
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "500" }}>
                  {item.value}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {sameAirports && (
          <Text style={[styles.warningText, { color: theme.danger }]}>
            출발지와 도착지가 같습니다. 다른 공항을 선택해주세요.
          </Text>
        )}

        <SearchButtons
          onReset={resetForm}
          onSearch={async () => {
            if (isSearchingRef.current) return;
            isSearchingRef.current = true;

            if (sameAirports) {
              Alert.alert(
                "잘못된 경로",
                "출발지와 도착지가 같습니다. 다른 공항을 선택해주세요."
              );
              isSearchingRef.current = false;
              return;
            }

            setLoading(true);
            try {
              const nonStop = stopover === "직항만";

              let travelClass: "ECONOMY" | "BUSINESS" = "ECONOMY";
              if (seatClass.includes("비즈니스")) {
                travelClass = "BUSINESS";
              }

              const isRoundTrip = tripType === "왕복";

              const requestDto: FlightSearchRequestDto = {
                originLocationAirport: departure,
                destinationLocationAirport: destination,
                departureDate: departureDate.toISOString().split("T")[0],
                returnDate: isRoundTrip
                  ? returnDate.toISOString().split("T")[0]
                  : null,
                currencyCode: "KRW",
                nonStop,
                roundTrip: isRoundTrip,
                travelClass,
                adults: Math.max(1, passengerCounts.adult),
                max: 10,
              };

              console.log("[REQ] Flight search payload:", requestDto);

              const rawResults = await searchFlights(requestDto);
              const { valid } = sanitizeResults(rawResults || []);
              const uniq = dedupeExact(valid);

              const filtered =
                stopover === "경유만" ? uniq.filter((f) => !isDirect(f)) : uniq;

              navigation.navigate("FlightResult", {
                originLocationCode: departure,
                destinationLocationCode: destination,
                departureDate: departureDate.toISOString(),
                returnDate: isRoundTrip ? returnDate.toISOString() : "",
                adults: passengerCounts.adult,
                travelClass: seatClass,
                stopover,
                results: filtered,
              });
            } catch (err: any) {
              console.error("[ERR] Flight search failed:", err);
              Alert.alert(
                "검색 실패",
                "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요."
              );
            } finally {
              setLoading(false);
              isSearchingRef.current = false;
            }
          }}
          disabled={isSearchDisabled}
        />
      </View>

      {/* ── 빠른 실행 ── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          빠른 실행
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRow}
        >
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.quickItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.7}
            >
              <View
                style={[styles.quickIconWrap, { backgroundColor: theme.muted }]}
              >
                <Ionicons name={action.icon} size={20} color={theme.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── 인기 노선 ── */}
      <View
        onLayout={(e) => setPopularY(e.nativeEvent.layout.y)}
      >
        <PopularScreen />
      </View>

      {/* ── 모달 (오버레이, 위치 무관) ── */}
      <PassengerSelector
        visible={showPassengerModal}
        counts={passengerCounts}
        onIncrement={increment}
        onDecrement={decrement}
        onClose={() => setShowPassengerModal(false)}
        showWarning={showWarning}
        showMinWarning={showMinWarning}
        onDismissWarning={() => setShowWarning(false)}
        onDismissMinWarning={() => setShowMinWarning(false)}
      />

      <SeatStopoverSelector
        visible={modalVisible}
        modalType={modalType}
        onClose={() => setModalVisible(false)}
        onSelect={(type, value) => {
          if (type === "seatClass") {
            if (value === "프리미엄일반석" || value === "일등석") {
              Alert.alert("미지원", "해당 좌석 등급은 아직 지원하지 않습니다.");
              return;
            }
            setSeatClass(value);
          } else {
            setStopover(value);
          }
        }}
      />

      <FlightLoadingModal visible={loading} />

      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={handleSelectAirport}
        data={airportData}
        fieldLabel={selectedField === "departure" ? "출발지" : "도착지"}
        excludeCode={selectedField === "departure" ? destination : departure}
      />
    </ScrollView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 48,
  },

  // ── 헤더 ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 2,
  },
  greetingSub: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── 검색 카드 ──
  searchCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  tripTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  tripTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  tripTypeText: {
    fontSize: 14,
  },
  selectorRow: {
    flexDirection: "row",
    gap: 8,
  },
  selectorItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── 빠른 실행 ──
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  quickRow: {
    gap: 10,
    paddingRight: 4,
  },
  quickItem: {
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
    minWidth: 80,
  },
  quickIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
