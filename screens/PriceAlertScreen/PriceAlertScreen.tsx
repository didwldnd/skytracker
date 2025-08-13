import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { usePriceAlert } from "../../context/PriceAlertContext";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import { generateFlightKey } from "../../utils/generateFlightKey";
import { Buffer } from "buffer";
import { formatPrice } from "../../utils/formatters";
global.Buffer = Buffer;

const airportMap: Record<string, string> = {
  PUS: "부산",
  GMP: "서울",
  ICN: "인천",
  CJU: "제주",
  JFK: "뉴욕",
  NRT: "도쿄",
  AKL: "오클랜드",
  AMS: "암스테르담",
  ARN: "스톡홀름",
  ATL: "애틀랜타",
  BCN: "바르셀로나",
  BKK: "방콕",
  BOM: "뭄바이",
  BRU: "브뤼셀",
  CDG: "파리",
  CPH: "코펜하겐",
  CPT: "케이프타운",
  DCA: "워싱턴 D.C.",
  DEL: "델리",
  DFW: "댈러스",
  DOH: "도하",
  DUB: "더블린",
  DXB: "두바이",
  EWR: "뉴욕",
  FCO: "로마",
  FRA: "프랑크푸르트",
  GIG: "리우데자네이루",
  GRU: "상파울루",
  HEL: "헬싱키",
  HKG: "홍콩",
  HND: "도쿄",
  IST: "이스탄불",
  KIX: "오사카",
  KUL: "쿠알라룸푸르",
  LAX: "로스앤젤레스",
  LGA: "뉴욕",
  LGW: "런던",
  LHR: "런던",
  MAD: "마드리드",
  MEL: "멜버른",
  MIA: "마이애미",
  MUC: "뮌헨",
  MXP: "밀라노",
  ORD: "시카고",
  ORY: "파리",
  OSL: "오슬로",
  PEK: "베이징",
  PER: "퍼스",
  PVG: "상하이",
  SFO: "샌프란시스코",
  SIN: "싱가포르",
  SYD: "시드니",
  VIE: "빈",
  YUL: "몬트리올",
  YVR: "밴쿠버",
  YYZ: "토론토",
  ZRH: "취리히",
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

  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [globalSwitch, setGlobalSwitch] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const initialStates: { [key: string]: boolean } = {};
    alerts.forEach((item) => {
      const key = generateFlightKey(item);
      initialStates[key] = true;
    });
    setSwitchStates(initialStates);
  }, [alerts]);

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
    alerts.forEach((item) => {
      const key = generateFlightKey(item);
      updatedStates[key] = newVal;
    });

    setSwitchStates(updatedStates);
  };

  const renderItem = ({ item }: { item: FlightSearchResponseDto }) => {
    const id = generateFlightKey(item);

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
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.circle}>
            <Text>✈️</Text>
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
            <TouchableOpacity
              onPress={() => {
                setPendingDeleteId(id);
                setConfirmVisible(true);
              }}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
            <Text style={styles.price}>{price}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("FlightDetail", { flight: item })
              }
            >
              <Text style={styles.buttonText}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>알림</Text>
            <Switch
              value={switchStates[id] ?? true}
              onValueChange={() => toggleSwitch(id)}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.globalToggle}>
        <Text style={styles.globalToggleText}>전체 알림</Text>
        <Switch value={globalSwitch} onValueChange={toggleGlobalSwitch} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => generateFlightKey(item)}
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
                  const flight = alerts.find(
                    (f) => generateFlightKey(f) === pendingDeleteId
                  );

                  if (flight) removeAlert(flight);
                  setConfirmVisible(false);
                  setPendingDeleteId(null);
                }}
              >
                <Text style={{ color: "#fff" }}>삭제</Text>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  middle: { flex: 1 },
  route: { fontWeight: "bold", fontSize: 14 },
  info: { fontSize: 12, color: "#555" },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
  },
  price: { fontSize: 14, fontWeight: "bold", color: "#333" },
  button: {
    marginTop: 4,
    backgroundColor: "#0be5ecd7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: { color: "#fff", fontSize: 12 },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  deleteText: { fontSize: 12, color: "red", marginBottom: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBox: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  confirmText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  confirmButtons: { flexDirection: "row", gap: 12 },
  confirmDelete: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  confirmCancel: {
    backgroundColor: "#eee",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  footerLabel: { fontSize: 13, color: "#333" },
});
