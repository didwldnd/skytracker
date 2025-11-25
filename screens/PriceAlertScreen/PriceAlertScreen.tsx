import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  GestureResponderEvent,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { Buffer } from "buffer";
import { formatPrice } from "../../utils/formatters";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import {
  fetchFlightAlerts,
  toggleFlightAlert,
  deleteFlightAlert,
  FlightAlertItem,
} from "../../utils/priceAlertApi";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import { usePriceAlert } from "../../context/PriceAlertContext";
import axios from "axios";
import { generateAlertKeyFromAlert } from "../../utils/generateAlertKeyFromAlert";
import { AuthContext } from "../../context/AuthContext";
// 💡 검색 API
import { searchFlights } from "../../utils/api";
import { useTheme } from "../../context/ThemeContext";

global.Buffer = Buffer;

export const airportMap: Record<string, string> = {
  PUS: "부산",
  GMP: "서울",
  ICN: "인천",
  CJU: "제주",
  HND: "도쿄",
  NRT: "도쿄",
  KIX: "오사카",
  FUK: "후쿠오카",
  HKG: "홍콩",
  PVG: "상하이",
  PEK: "베이징",
  SIN: "싱가포르",
  BKK: "방콕",
  KUL: "쿠알라룸푸르",
  DEL: "델리",
  BOM: "뭄바이",
  HAN: "하노이",
  SGN: "호치민시",
  MNL: "마닐라",
  CGK: "자카르타",
  TPE: "타이페이",
  SYD: "시드니",
  MEL: "멜버른",
  PER: "퍼스",
  AKL: "오클랜드",
  JFK: "뉴욕",
  EWR: "뉴욕",
  LGA: "뉴욕",
  LAX: "로스앤젤레스",
  SFO: "샌프란시스코",
  ORD: "시카고",
  DFW: "댈러스",
  ATL: "애틀랜타",
  MIA: "마이애미",
  IAD: "워싱턴 D.C.",
  BOS: "보스턴",
  YYZ: "토론토",
  YVR: "밴쿠버",
  YUL: "몬트리올",
  MEX: "멕시코시티",
  GRU: "상파울루",
  GIG: "리우데자네이루",
  EZE: "부에노스아이레스",
  SCL: "산티아고",
  LIM: "리마",
  BOG: "보고타",
  LGW: "런던",
  LHR: "런던",
  CDG: "파리",
  ORY: "파리",
  FRA: "프랑크푸르트",
  MUC: "뮌헨",
  MXP: "밀라노",
  FCO: "로마",
  MAD: "마드리드",
  BCN: "바르셀로나",
  ZRH: "취리히",
  VIE: "빈",
  ARN: "스톡홀름",
  CPH: "코펜하겐",
  OSL: "오슬로",
  HEL: "헬싱키",
  BRU: "브뤼셀",
  AMS: "암스테르담",
  IST: "이스탄불",
  DXB: "두바이",
  AUH: "아부다비",
  DOH: "도하",
  JNB: "요하네스버그",
  CPT: "케이프타운",
  CAI: "카이로",
  NBO: "나이로비",
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const priceText = (
  price: number | null | undefined,
  currency: string = "KRW"
) => {
  if (price == null) {
    return "-";
  }
  return formatPrice(price, currency, "ko-KR");
};

const formatSeatClass = (cls: string) => {
  switch (cls) {
    case "ECONOMY":
      return "ECONOMY";
    case "BUSINESS":
      return "BUSINESS";
    default:
      return cls;
  }
};

// 🔁 검색 API에서 사용하는 좌석 타입 (searchFlights용)
type SearchTravelClass = "ECONOMY" | "BUSINESS";

// 🔁 알림에 저장된 좌석 등급(한글/코드) → 검색 API용 코드
const mapAlertSeatToSearchClass = (cls: string): SearchTravelClass => {
  switch (cls) {
    case "비즈니스석":
    case "BUSINESS":
      return "BUSINESS";

    // 나머지는 전부 ECONOMY 로 통일 (프리미엄/일등석도 일단 일반석으로 검색)
    case "일반석":
    case "ECONOMY":
    case "프리미엄일반석":
    case "PREMIUM_ECONOMY":
    case "일등석":
    case "FIRST":
    default:
      return "ECONOMY";
  }
};

// 알림 카드에 표시할 실제 가격 결정
const getDisplayPrice = (
  alert: FlightAlertItem,
  matchedFlight?: FlightSearchResponseDto
): number => {
  // localAlerts에서 찾은 원본 flight가 있으면 그 price 사용 (왕복 총액 포함)
  if (matchedFlight && typeof matchedFlight.price === "number") {
    return matchedFlight.price;
  }

  // 못 찾으면 서버에서 온 lastCheckedPrice 그대로 사용
  return alert.lastCheckedPrice ?? 0;
};

const mapAlertToFlightDto = (
  alert: FlightAlertItem,
  matchedFlight?: FlightSearchResponseDto
): FlightSearchResponseDto => {
  const totalPrice = getDisplayPrice(alert, matchedFlight);

  return {
    airlineCode: alert.airlineCode,
    airlineName: alert.airlineCode,
    flightNumber: alert.flightNumber,

    departureAirport: alert.origin,
    arrivalAirport: alert.destination,
    origin: alert.origin,
    destination: alert.destination,

    outboundDepartureTime: alert.departureDate
      ? `${alert.departureDate}T00:00:00`
      : "",
    outboundArrivalTime: alert.departureDate
      ? `${alert.departureDate}T00:00:00`
      : "",
    outboundDuration: "",

    returnDepartureTime: alert.returnDate ? `${alert.returnDate}T00:00:00` : "",
    returnArrivalTime: alert.returnDate ? `${alert.returnDate}T00:00:00` : "",
    returnDuration: "",

    travelClass: alert.travelClass,
    numberOfBookableSeats: 0,
    hasCheckedBags: false,
    currency: alert.currency ?? "KRW",
    price: totalPrice, // 왕복이면 총액, 편도면 편도 가격

    isRefundable: false,
    isChangeable: false,

    tripType: alert.returnDate ? "ROUND_TRIP" : "ONE_WAY",
  } as any;
};

const findFlightFromLocalAlerts = (
  alertsMap: Record<string, FlightSearchResponseDto>,
  alert: FlightAlertItem
): FlightSearchResponseDto | undefined => {
  const list = Object.values(alertsMap);

  const depDate = alert.departureDate ?? "";
  const retDate = alert.returnDate ?? "";
  const alertIsRoundTrip = !!retDate;

  return list.find((f) => {
    const depIso = f.outboundDepartureTime ?? (f as any).departureTime ?? "";
    const retIso =
      f.returnDepartureTime ?? (f as any).returnDepartureTime ?? "";

    const depPart = depIso.split("T")[0];
    const retPart = retIso.split("T")[0];

    const baseMatch =
      f.airlineCode === alert.airlineCode &&
      String(f.flightNumber) === String(alert.flightNumber) &&
      f.departureAirport === alert.origin &&
      f.arrivalAirport === alert.destination &&
      f.travelClass === alert.travelClass &&
      depPart === depDate;

    if (!baseMatch) return false;

    if (alertIsRoundTrip) {
      return retPart === retDate;
    }

    const localHasReturn = !!f.returnDepartureTime || !!f.returnArrivalTime;
    return !localHasReturn;
  });
};

const MIN_TOUCH = 33;

export default function PriceAlertScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const {
    alerts: localAlerts,
    removeAlert: removeLocalAlert,
    resetAlertsFromServer,
  } = usePriceAlert();

  const auth = useContext(AuthContext);
  const isLoggedIn = auth?.authState.isAuthenticated ?? false;

  // 📡 서버에서 가져온 알림 목록 (UI용)
  const [alertList, setAlertList] = useState<FlightAlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  // 개별/전체 토글 상태
  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [globalSwitch, setGlobalSwitch] = useState(true);

  // 삭제 모달
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteAlertId, setPendingDeleteAlertId] = useState<
    number | null
  >(null);

  // 토글/삭제 중 상태
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 🔁 알림 목록 불러오기 (+ 로컬 스냅샷과 머지)
  const loadAlerts = async () => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const data = await fetchFlightAlerts();

      console.log(
        "🟣 [DEBUG] alertList in PriceAlertScreen:",
        JSON.stringify(data, null, 2)
      );

      // 1) 화면용 리스트 상태
      setAlertList(data);

      // 2) 개별 스위치 상태 초기화
      const initialStates: { [key: string]: boolean } = {};
      data.forEach((item) => {
        initialStates[String(item.alertId)] =
          typeof item.isActive === "boolean" ? item.isActive : true;
      });
      setSwitchStates(initialStates);

      const allOn = data.length > 0 && data.every((a) => a.isActive);
      setGlobalSwitch(allOn);
    } catch (e) {
      console.log("loadAlerts error", e);
      Alert.alert("오류", "알림 목록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  // 화면 포커스될 때마다 서버에서 새로 로드
  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        loadAlerts();
      }
    }, [isLoggedIn])
  );

  const stop = (e: GestureResponderEvent) => e.stopPropagation();

  // 🔔 개별 알림 토글
  const handleToggleAlert = async (item: FlightAlertItem) => {
    const { alertId } = item;
    if (!alertId || togglingId !== null) return;

    const id = String(alertId);
    const prev = switchStates[id] ?? item.isActive;

    try {
      // 1) UI 먼저 토글
      setTogglingId(alertId);
      setSwitchStates((prevStates) => ({
        ...prevStates,
        [id]: !prev,
      }));

      // 2) 서버 토글
      await toggleFlightAlert(alertId);

      const nextActive = !prev;

      // 3) alertList 상태 업데이트
      const updatedList = alertList.map((a) =>
        a.alertId === alertId ? { ...a, isActive: nextActive } : a
      );
      setAlertList(updatedList);

      // 4) 컨텍스트에 isActive=true인 것만 머지 (왕복 총액 기준)
      const activeAlerts = updatedList.filter((a) => a.isActive);
      const flightsForContext = activeAlerts.map((a) => {
        const matched = findFlightFromLocalAlerts(localAlerts, a);
        return mapAlertToFlightDto(a, matched);
      });
      resetAlertsFromServer(flightsForContext);
    } catch (e) {
      console.log("handleToggleAlert error", e);
      Alert.alert("오류", "알림 설정 변경에 실패했어요.");

      // 실패하면 UI 되돌리기
      setSwitchStates((prevStates) => ({
        ...prevStates,
        [id]: prev,
      }));
    } finally {
      setTogglingId(null);
    }
  };

  const goDetail = async (alert: FlightAlertItem) => {
    try {
      if (!alert.departureDate) {
        Alert.alert("안내", "출발일 정보가 없어 다시 검색할 수 없어요.");
        return;
      }

      setLoading(true);

      const depDate = alert.departureDate.split("T")[0];
      const retDate = alert.returnDate
        ? alert.returnDate.split("T")[0]
        : undefined;

      const searchTravelClass: SearchTravelClass = mapAlertSeatToSearchClass(
        alert.travelClass
      );

      // 검색 payload
      const payload = {
        originLocationAirport: alert.origin,
        destinationLocationAirport: alert.destination,
        departureDate: depDate,
        adults: 1,
        travelClass: searchTravelClass,
        nonStop: alert.nonStop,
        max: 10,
        ...(retDate ? { returnDate: retDate } : {}),
      };

      const flights: FlightSearchResponseDto[] = await searchFlights(
        payload as any
      );

      if (flights.length === 0) {
        Alert.alert("안내", "해당 조건의 항공편을 찾을 수 없어요.");
        return;
      }

      // 🔥 여기서 FlightDetailScreen 으로 바로 이동
      const firstFlight = flights[0];

      navigation.navigate("FlightDetail", {
        flight: firstFlight,
      });
    } catch (e) {
      console.log("[PriceAlertScreen] goDetail re-search error:", e);
      Alert.alert("오류", "항공편을 다시 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  const [globalToggling, setGlobalToggling] = useState(false);

  // 전체 알림 토글
  const toggleGlobalSwitch = async () => {
    if (globalToggling || alertList.length === 0) return;

    const newVal = !globalSwitch;
    setGlobalToggling(true);

    try {
      // 1) UI 먼저 반영
      setGlobalSwitch(newVal);

      setSwitchStates((prev) => {
        const updated: { [key: string]: boolean } = { ...prev };
        alertList.forEach((item) => {
          if (!item.alertId) return;
          updated[String(item.alertId)] = newVal;
        });
        return updated;
      });

      // 2) 서버에 실제 전체 토글 요청
      const targets = alertList.filter((item) =>
        typeof item.isActive === "boolean" ? item.isActive !== newVal : true
      );

      await Promise.all(
        targets
          .filter((t) => t.alertId)
          .map((t) => toggleFlightAlert(t.alertId!))
      );

      // 3) alertList 상태 업데이트
      const updatedList = alertList.map((a) =>
        a.alertId && targets.some((t) => t.alertId === a.alertId)
          ? { ...a, isActive: newVal }
          : a
      );
      setAlertList(updatedList);

      // 4) 컨텍스트도 isActive=true인 것만 머지 (왕복 총액 기준)
      const activeAlerts = updatedList.filter((a) => a.isActive);
      const flightsForContext = activeAlerts.map((a) => {
        const matched = findFlightFromLocalAlerts(localAlerts, a);
        return mapAlertToFlightDto(a, matched);
      });
      resetAlertsFromServer(flightsForContext);
    } catch (e) {
      console.log("[toggleGlobalSwitch] error", e);
      Alert.alert("오류", "전체 알림 변경에 실패했어요.");

      // 실패 시 서버 상태와 다시 동기화
      await loadAlerts();
    } finally {
      setGlobalToggling(false);
    }
  };

  const renderItem = ({ item }: { item: FlightAlertItem }) => {
    const id = String(item.alertId);

    const depCode = item.origin || "-";
    const arrCode = item.destination || "-";

    const from = `${airportMap[depCode] ?? depCode} (${depCode})`;
    const to = `${airportMap[arrCode] ?? arrCode} (${arrCode})`;

    // 1) 로컬 스냅샷 찾기
    const matched = findFlightFromLocalAlerts(localAlerts, item);

    // 2) 날짜: 스냅샷 있으면 거기서, 없으면 서버값 사용
    const departDateStr = matched?.outboundDepartureTime
      ? matched.outboundDepartureTime.split("T")[0]
      : item.departureDate;

    const returnDateStr = matched?.returnDepartureTime
      ? matched.returnDepartureTime.split("T")[0]
      : item.returnDate ?? null;

    const departDate = formatDate(departDateStr);
    const returnDate = returnDateStr ? formatDate(returnDateStr) : null;

    // 3) 왕복 여부: 서버 roundTrip 우선
    const isRoundTrip = item.roundTrip;
    const tripTypeLabel = isRoundTrip ? "왕복" : "편도";
    const seatInfo = `${tripTypeLabel}, ${formatSeatClass(item.travelClass)}`;

    // 🔥 여기서 왕복이면 왕복 총액, 편도면 편도 가격
    const rawPrice = getDisplayPrice(item, matched);
    const mainPrice = priceText(rawPrice, item.currency ?? "KRW");

    const isOn = switchStates[id] ?? item.isActive;

    return (
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: isDark ? "#111827" : "#fff", // 다크일 땐 어두운 카드
          },
        ]}
        onPress={() => goDetail(item)}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.circle,
              { backgroundColor: isDark ? "#1f2937" : "#f0f0f0" },
            ]}
          >
            <Text style={{ fontSize: 18 }}>✈️</Text>
          </View>

          <View style={styles.middle}>
            <Text style={[styles.route, { color: theme.text }]}>
              {from} - {to}
            </Text>

            <Text
              style={[
                styles.info,
                { color: isDark ? "#e5e7eb" : "#555" }, // 서브텍스트 색
              ]}
            >
              {departDate}
              {returnDate ? ` ~ ${returnDate}` : ""} · {seatInfo}
            </Text>

            <Text style={[styles.info, { color: isDark ? "#e5e7eb" : "#555" }]}>
              최근 최저가 {mainPrice}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={[styles.price, { color: theme.text }]}>
              {mainPrice}
            </Text>

            <TouchableOpacity
              onPress={(e) => {
                stop(e);
                goDetail(item);
              }}
              style={styles.viewBtn}
            >
              <Text style={styles.viewBtnText}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={(e) => {
              stop(e);
              handleToggleAlert(item);
            }}
            disabled={togglingId === item.alertId}
          >
            <Ionicons
              name={isOn ? "notifications" : "notifications-outline"}
              size={22}
              color={isOn ? "gold" : "gray"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              stop(e);
              setPendingDeleteAlertId(item.alertId);
              setConfirmVisible(true);
            }}
            disabled={deletingId === item.alertId}
          >
            <FontAwesome name="trash" size={25} color="#E53935" />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  // 1) 비로그인 상태
  if (!isLoggedIn) {
    return (
      <View style={styles.lockContainer}>
        <Text style={styles.lockTitle}>로그인 후 이용 가능한 서비스에요</Text>
        <Text style={styles.lockDesc}>
          관심 있는 항공편의 가격이 변동되면{`\n`}
          자동으로 알려주는 가격 알림 서비스를 이용하려면{`\n`}
          먼저 로그인 해주세요.
        </Text>

        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.lockButtonText}>로그인 하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2) 로그인 상태: 알림 화면
  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: theme.background, // 다크모드 배경 적용 (원하면 지워도 됨)
      }}
    >
      {/* 상단 전체 알림 헤더 */}
      <View style={styles.globalToggle}>
        <View style={{ flexDirection: "column" }}>
          <Text style={[styles.globalToggleText, { color: theme.text }]}>
            전체 알림
          </Text>
          <Text style={[styles.globalToggleSub, { color: theme.text }]}>
            모든 알림은 이메일로 전송됩니다
          </Text>
        </View>

        <TouchableOpacity
          onPress={toggleGlobalSwitch}
          disabled={globalToggling || loading}
        >
          {globalToggling ? (
            <ActivityIndicator />
          ) : (
            <Ionicons
              name={globalSwitch ? "notifications" : "notifications-outline"}
              size={26}
              color={globalSwitch ? "gold" : "gray"}
            />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>알림 목록을 불러오는 중...</Text>
        </View>
      ) : (
        <FlatList
          data={alertList}
          keyExtractor={(item) => String(item.alertId)}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30, color: "#888" }}>
              등록된 항공 알림이 없습니다.
            </Text>
          }
        />
      )}

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              정말 해당 항목을 삭제하시겠어요?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmDelete}
                onPress={async () => {
                  if (!pendingDeleteAlertId) {
                    setConfirmVisible(false);
                    return;
                  }

                  const targetId = pendingDeleteAlertId;
                  const targetAlert =
                    alertList.find((a) => a.alertId === targetId) || null;

                  try {
                    setDeletingId(targetId);
                    await deleteFlightAlert(targetId);
                  } catch (e: any) {
                    console.log("delete alert error", e);

                    if (
                      !(axios.isAxiosError(e) && e.response?.status === 404)
                    ) {
                      Alert.alert("오류", "알림 삭제에 실패했어요.");
                      setConfirmVisible(false);
                      setPendingDeleteAlertId(null);
                      setDeletingId(null);
                      return;
                    }
                  } finally {
                    setAlertList((prev) =>
                      prev.filter((item) => item.alertId !== targetId)
                    );

                    if (targetAlert) {
                      const key = generateAlertKeyFromAlert(targetAlert);
                      const localFlight = localAlerts[key];
                      if (localFlight) {
                        removeLocalAlert(localFlight);
                      }
                    }

                    setConfirmVisible(false);
                    setPendingDeleteAlertId(null);
                    setDeletingId(null);
                  }
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmCancel}
                onPress={() => setConfirmVisible(false)}
              >
                <Text>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#555",
  },
  lockContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  lockDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  lockButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0be5ecd7",
  },
  lockButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  globalToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  globalToggleText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  globalToggleSub: {
    marginTop: 4,
    fontSize: 16,
    color: "#6b7280",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  row: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  middle: { flex: 1 },
  route: { fontWeight: "bold", fontSize: 15, marginBottom: 2 },
  info: { fontSize: 13, color: "#555" },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 64,
  },
  price: { fontSize: 15, fontWeight: "bold", color: "#333" },
  viewBtn: {
    marginTop: 6,
    backgroundColor: "#6ea1d4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: MIN_TOUCH,
    justifyContent: "center",
  },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    alignItems: "center",
  },
  confirmText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  confirmButtons: { flexDirection: "row", gap: 12 },
  confirmDelete: {
    backgroundColor: "#333",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  confirmCancel: {
    backgroundColor: "#eee",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 25,
  },
});
