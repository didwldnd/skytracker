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

// ====== 중복 제거용 공통 헬퍼 ======
const norm = (s?: any) => (s == null ? "" : String(s).trim());
const upper = (s?: any) => norm(s).toUpperCase();
const toMs = (iso?: string) => {
  const t = Date.parse(norm(iso));
  return Number.isFinite(t) ? t : 0;
};
const isDirect = (f: any) =>
  f?.nonStop === true || f?.nonStop === "true" || f?.nonStop === 1;
// (항공사, 편명, 출발공항, 도착공항, 출발시간, 도착시간) = 절대 고유 튜플
const exactTupleKey = (f: any) => {
  const depIso = f.outboundDepartureTime ?? f.departureTime ?? "";
  const arrIso = f.outboundArrivalTime ?? f.arrivalTime ?? "";
  return [
    "TUPLE",
    upper(f.airlineCode),
    String(f.flightNumber ?? "")
      .replace(/^0+/, "")
      .trim(), // "0241" → "241"
    upper(f.departureAirport),
    upper(f.arrivalAirport),
    toMs(depIso) || depIso, // ISO 파싱 실패하면 원문 고정
    toMs(arrIso) || arrIso,
  ].join("|");
};
const dedupeExact = (list: any[]) => {
  const m = new Map<string, any>();
  for (const it of Array.isArray(list) ? list : []) {
    const k = exactTupleKey(it);
    if (!m.has(k)) m.set(k, it);
  }
  return Array.from(m.values());
};

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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


  // 동일 공항 선택시 useMemo로 계산 -> 경고라벨 + Alert로 즉각 피드백, 검색 버튼도 disabled
  const sameAirports = useMemo(
    () => !!departure && !!destination && departure === destination,
    [departure, destination]
  );

  const isSearchDisabled = !departure || !destination || sameAirports;

  const handleSelectAirport = (code: string) => {
    if (selectedField === "departure") setDeparture(code);
    else if (selectedField === "destination") setDestination(code);
    setShowSearchModal(false);
  };

  // 승객 수 제한
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

  // 컨텍스트 값이 바뀔 때마다 departure도 맞춰준다
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

  // useRef - 값을 기억하지만, 그 값이 바뀌어도 리렌더링을 일으키지 않는 저장소
  // state 사용 시 리렌더 발생, 타이밍 꼬일 수 있음 -> ref는 리렌더 없이 값 유지 가능 -> 더블탭 동작 방지
  const isSearchingRef = useRef(false);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>항공권 검색</Text>

        {/* Trip Type Selector */}
        <View style={styles.tripTypeRow}>
          {["왕복", "편도"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setTripType(type as "왕복" | "편도")}
              style={[
                styles.tripTypeButton,
                tripType === type && styles.tripTypeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.tripTypeText,
                  tripType === type && styles.tripTypeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
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

        <View style={styles.selectorRow}>
          <View style={styles.selectorItem}>
            <Text style={styles.label}>여행객</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowPassengerModal(true)}
            >
              <Text>{`총 ${totalPassengers}명`}</Text>
            </TouchableOpacity>
          </View>

          {[
            { label: "좌석", value: seatClass, type: "seatClass" },
            { label: "경유횟수", value: stopover, type: "stopover" },
          ].map((item) => (
            <View key={item.type} style={styles.selectorItem}>
              <Text style={styles.label}>{item.label}</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setModalType(item.type as "seatClass" | "stopover");
                  setModalVisible(true);
                }}
              >
                <Text>{item.value}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 동일 공항 경고 라벨 */}
        {sameAirports && (
          <Text style={{ color: "#d00", fontSize: 12, marginTop: 6 }}>
            출발지와 도착지가 같습니다. 다른 공항을 선택해주세요.
          </Text>
        )}

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
                Alert.alert(
                  "미지원",
                  "해당 좌석 등급은 아직 지원하지 않습니다."
                );
                return;
              }
              setSeatClass(value);
            } else {
              setStopover(value);
            }
          }}
        />

        <SearchButtons
  onReset={resetForm}
  onSearch={async () => {
    if (isSearchingRef.current) return; // 더블탭 가드
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
      // ✅ 경유 옵션 → nonStop(boolean) 매핑
      // "직항만"일 때만 true, 나머지는 전부 false
      const nonStop = stopover === "직항만";

      // ✅ 좌석 등급 → 백엔드 ENUM 매핑
      let travelClass: "ECONOMY" | "BUSINESS" | undefined;
      if (seatClass === "일반석") travelClass = "ECONOMY";
      else if (seatClass === "비즈니스") travelClass = "BUSINESS";

      const requestDto: FlightSearchRequestDto = {
        originLocationAirport: departure,
        destinationLocationAirport: destination,
        departureDate: departureDate.toISOString().split("T")[0],
        returnDate:
          tripType === "왕복"
            ? returnDate.toISOString().split("T")[0]
            : undefined,
        nonStop, // ✅ 이제 항상 true/false
        travelClass,
        adults: Math.max(1, passengerCounts.adult),
        max: 10,
      };

      console.log("[REQ] Flight search payload:", requestDto);

      const rawResults = await searchFlights(requestDto);
      const { valid } = sanitizeResults(rawResults || []);
      const uniq = dedupeExact(valid);

      // 🔽 이 부분은 일단 그대로 두되, stopover 옵션이 "경유만"은 없으니까 사실상 안 쓰이는 상태
      const filtered =
        stopover === "경유만" ? uniq.filter((f) => !isDirect(f)) : uniq;

      navigation.navigate("FlightResult", {
        originLocationCode: departure,
        destinationLocationCode: destination,
        departureDate: departureDate.toISOString(),
        returnDate: tripType === "왕복" ? returnDate.toISOString() : "",
        adults: passengerCounts.adult,
        travelClass: seatClass,
        stopover,
        results: filtered,
      });
    } catch (err: any) {
      // ... 기존 에러 처리 그대로
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  }}
  disabled={isSearchDisabled}
/>

        <FlightLoadingModal visible={loading} />
        <PopularScreen />

        <SearchModal
          visible={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelect={handleSelectAirport}
          data={airportData}
          fieldLabel={selectedField === "departure" ? "출발지" : "도착지"}
          excludeCode={selectedField === "departure" ? destination : departure}
        />
      </View>
    </ScrollView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    gap: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  tripTypeRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    gap: 15,
  },
  tripTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f0f0f0",
  },
  tripTypeButtonActive: {
    backgroundColor: "#0be5ecd7",
    borderColor: "#0be5ecd7",
  },
  tripTypeText: {
    fontSize: 16,
    color: "#666",
  },
  tripTypeTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  selectorItem: {
    flex: 1,
  },
});
