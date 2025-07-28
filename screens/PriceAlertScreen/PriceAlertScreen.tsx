import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Switch,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

// 예시 데이터
const alertData = [
  {
    id: "1",
    airlineCode: "BX",
    airlineName: "AIR BUSAN",
    flightNumber: 101,
    departureAirport: "PUS",
    departureTime: "2025-08-25T08:00:00",
    arrivalAirport: "GMP",
    arrivalTime: "2025-08-28T09:10:00",
    duration: "PT1H10M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 1,
    hasCheckedBags: true,
    isRefundable: false,
    isChangeable: false,
    currency: "KRW",
    price: 86010,
  },
  {
    id: "2",
    airlineCode: "TW",
    airlineName: "T'WAY AIR",
    flightNumber: 202,
    departureAirport: "ICN",
    departureTime: "2025-09-02T12:30:00",
    arrivalAirport: "CJU",
    arrivalTime: "2025-09-05T13:40:00",
    duration: "PT1H10M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 2,
    hasCheckedBags: false,
    isRefundable: true,
    isChangeable: true,
    currency: "KRW",
    price: 49500,
  },
  {
    id: "3",
    airlineCode: "JL",
    airlineName: "JAPAN AIRLINES",
    flightNumber: 305,
    departureAirport: "JFK",
    departureTime: "2025-09-22T14:00:00",
    arrivalAirport: "NRT",
    arrivalTime: "2025-09-25T16:30:00",
    duration: "PT14H30M",
    travelClass: "ECONOMY",
    numberOfBookableSeats: 4,
    hasCheckedBags: true,
    isRefundable: true,
    isChangeable: false,
    currency: "KRW",
    price: 249500,
  },
];

const airportMap: Record<string, string> = {
  PUS: "부산",
  GMP: "서울",
  ICN: "인천",
  CJU: "제주",
  JFK: "뉴욕",
  NRT: "도쿄",
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatPrice = (price: number) => {
  return price.toLocaleString("ko-KR") + "원";
};

const formatSeatClass = (cls: string) =>
  cls === "ECONOMY" ? "일반석" : cls.toLowerCase();

const getTripType = (depart: string, ret: string) =>
  depart.split("T")[0] !== ret.split("T")[0] ? "왕복" : "편도";

export default function PriceAlertScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [switchStates, setSwitchStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [globalSwitch, setGlobalSwitch] = useState(true); // 전체 알림 ON
  const [alerts, setAlerts] = useState(alertData);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 알림 삭제 함수
  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  };

  // 개별 스위치 토글
  const toggleSwitch = (id: string) => {
    setSwitchStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 전체 알림 ON/OFF
  const toggleGlobalSwitch = () => {
    const newValue = !globalSwitch;
    setGlobalSwitch(newValue);

    const updatedStates: { [key: string]: boolean } = {};
    alertData.forEach((item) => {
      updatedStates[item.id] = newValue;
    });
    setSwitchStates(updatedStates);
  };

  const renderItem = ({ item }: { item: (typeof alertData)[0] }) => {
    const from =
      airportMap[item.departureAirport] + ` (${item.departureAirport})`;
    const to = airportMap[item.arrivalAirport] + ` (${item.arrivalAirport})`;
    const departDate = formatDate(item.departureTime);
    const returnDate = formatDate(item.arrivalTime);
    const seat = `${getTripType(
      item.departureTime,
      item.arrivalTime
    )}, ${formatSeatClass(item.travelClass)}`;
    const passenger = `${item.numberOfBookableSeats}여행객`;
    const price = formatPrice(item.price);

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
              {returnDate} 도착 · {passenger}
            </Text>
          </View>
          <View style={styles.right}>
            <TouchableOpacity
              onPress={() => {
                setPendingDeleteId(item.id);
                setConfirmVisible(true);
              }}
            >
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>
            <Text style={styles.price}>{price}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate("FlightDetail", { flight: item });
              }}
            >
              <Text style={styles.buttonText}>보기</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>알림</Text>
            <Switch
              value={switchStates[item.id] ?? true}
              onValueChange={() => toggleSwitch(item.id)}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.globalToggle}>
        <Text style={styles.globalToggleText}>
          {globalSwitch ? "전체 알림" : "전체 알림"}
        </Text>
        <Switch value={globalSwitch} onValueChange={toggleGlobalSwitch} />
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
                  if (pendingDeleteId) {
                    setAlerts((prev) =>
                      prev.filter((item) => item.id !== pendingDeleteId)
                    );
                  }
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  middle: {
    flex: 1,
  },
  route: {
    fontWeight: "bold",
    fontSize: 14,
  },
  info: {
    fontSize: 12,
    color: "#555",
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 60,
  },
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    marginTop: 4,
    backgroundColor: "#0be5ecd7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end", // 오른쪽 정렬
    alignItems: "center",
  },
  deleteText: {
    fontSize: 12,
    color: "red",
    marginBottom: 4,
  },
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
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
  },
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
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerLabel: {
    fontSize: 13,
    color: "#333",
  },
});
