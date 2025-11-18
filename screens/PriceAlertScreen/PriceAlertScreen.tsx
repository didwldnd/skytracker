import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { usePriceAlert } from "../../context/PriceAlertContext";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import { generateAlertKey } from "../../utils/generateAlertKey";
import { Buffer } from "buffer";
import { formatPrice } from "../../utils/formatters";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

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

const formatDate = (isoDate: string) => {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const priceText = (price?: number, currency: string = "KRW") =>
  formatPrice(price, currency, "ko-KR");

const formatSeatClass = (cls: string) => {
  switch (cls) {
    case "ECONOMY":
      return "일반석";
    case "PREMIUM_ECONOMY":
      return "프리미엄일반석";
    case "BUSINESS":
      return "비즈니스석";
    case "FIRST":
      return "일등석";
    default:
      return cls;
  }
};

const getTripType = (depart?: string, ret?: string) =>
  depart && ret && depart.split("T")[0] !== ret.split("T")[0] ? "왕복" : "편도";

export default function PriceAlertScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { alerts, removeAlert } = usePriceAlert();

  // 🔐 로그인 여부 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);

  // 화면에 들어올 때마다 토큰 확인
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        setIsLoggedIn(!!token);
      } catch (e) {
        console.log("checkLogin error", e);
        setIsLoggedIn(false);
      } finally {
        setLoginChecked(true);
      }
    };

    const unsubscribe = navigation.addListener("focus", checkLogin);
    return unsubscribe;
  }, [navigation]);

  const alertList: FlightSearchResponseDto[] = Array.isArray(alerts)
    ? alerts
    : Object.values(alerts || {});

  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [globalSwitch, setGlobalSwitch] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const initialStates: { [key: string]: boolean } = {};
    alertList.forEach((item) => {
      const key = generateAlertKey(item);
      initialStates[key] = true;
    });
    setSwitchStates(initialStates);
  }, [alertList.length]);

  const toggleSwitch = (id: string) => {
    setSwitchStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleGlobalSwitch = () => {
    const newVal = !globalSwitch;
    setGlobalSwitch(newVal);
    const updatedStates: { [key: string]: boolean } = {};
    alertList.forEach((item) => {
      const key = generateAlertKey(item);
      updatedStates[key] = newVal;
    });
    setSwitchStates(updatedStates);
  };

  const goDetail = (flight: FlightSearchResponseDto) => {
    navigation.navigate("FlightDetail", { flight });
  };

  const stop = (e: GestureResponderEvent) => e.stopPropagation();

  const renderItem = ({ item }: { item: FlightSearchResponseDto }) => {
    const id = generateAlertKey(item);

    const from = `${
      airportMap[item.departureAirport] ?? item.departureAirport
    } (${item.departureAirport})`;
    const to = `${airportMap[item.arrivalAirport] ?? item.arrivalAirport} (${
      item.arrivalAirport
    })`;

    const departDate =
      item.outboundDepartureTime || item.departureTime
        ? formatDate(item.outboundDepartureTime || item.departureTime!)
        : "-";

    const returnDate =
      item.returnArrivalTime &&
      item.returnArrivalTime !== item.outboundDepartureTime
        ? formatDate(item.returnArrivalTime)
        : null;

    const seat = `${getTripType(
      item.outboundDepartureTime,
      item.returnArrivalTime
    )}, ${formatSeatClass(item.travelClass)}`;
    const passenger = `잔여 ${item.numberOfBookableSeats}석`;
    const price = priceText(item.price, item.currency ?? "KRW");

    return (
      <Pressable
        style={styles.card}
        onPress={() => goDetail(item)}
        android_ripple={{ color: "rgba(0,0,0,0.05)" }}
      >
        <View style={styles.row}>
          <View style={styles.circle}>
            <Text style={{ fontSize: 18 }}>✈️</Text>
          </View>
          <View style={styles.middle}>
            <Text style={styles.route}>
              {from} - {to}
            </Text>
            <Text style={styles.info}>
              {departDate} 출발 · {seat}
            </Text>
            <Text style={styles.info}>
              {returnDate ? `${returnDate} 도착 · ` : ""}
              {passenger}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={styles.price}>{price}</Text>
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
              toggleSwitch(id);
            }}
          >
            <Ionicons
              name={
                switchStates[id] ? "notifications" : "notifications-outline"
              }
              size={22}
              color={switchStates[id] ? "gold" : "gray"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              stop(e);
              setPendingDeleteId(id);
              setConfirmVisible(true);
            }}
          >
            <FontAwesome name="trash" size={25} color="#E53935" />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  };

  // 1) 아직 로그인 여부 체크 중이면 로딩
  if (!loginChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
      </View>
    );
  }

  // 2) 비로그인 상태: 안내 + 로그인 버튼
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

  // 3) 로그인 상태: 기존 PriceAlert 화면 그대로
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.globalToggle}>
        <Text style={styles.globalToggleText}>전체 알림</Text>
        <TouchableOpacity onPress={toggleGlobalSwitch}>
          <Ionicons
            name={globalSwitch ? "notifications" : "notifications-outline"}
            size={26}
            color={globalSwitch ? "gold" : "gray"}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        data={alertList}
        keyExtractor={(item) => generateAlertKey(item)}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 30, color: "#888" }}>
            등록된 항공 알림이 없습니다.
          </Text>
        }
      />

      <Modal visible={confirmVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              정말 해당 항목을 삭제하시겠어요?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmDelete}
                onPress={() => {
                  const flight = alertList.find(
                    (f) => generateAlertKey(f) === pendingDeleteId
                  );
                  if (flight) removeAlert(flight);
                  setConfirmVisible(false);
                  setPendingDeleteId(null);
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

const MIN_TOUCH = 33;

const styles = StyleSheet.create({
  // 🔐 비로그인/로딩 레이아웃
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
    marginBottom: 16,
  },
  globalToggleText: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 5,
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
    backgroundColor: "#0be5ecd7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: MIN_TOUCH,
    justifyContent: "center",
  },
  viewBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  footer: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  deleteBig: {
    backgroundColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: MIN_TOUCH,
    minWidth: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBigText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

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

  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  footerLabel: { fontSize: 13, color: "#333" },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
    gap: 25,
  },
});
