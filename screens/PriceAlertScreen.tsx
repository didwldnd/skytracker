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

// 예시 데이터
const alertData = [
  {
    id: "1",
    from: "부산 (PUS)",
    to: "서울 (SEL)",
    depart: "8/25",
    return: "8/28",
    seat: "왕복, 일반석",
    passenger: "1여행객",
    price: "86,010원",
  },
  {
    id: "2",
    from: "인천 (ICN)",
    to: "제주 (CJU)",
    depart: "9/2",
    return: "9/5",
    seat: "편도, 일반석",
    passenger: "2여행객",
    price: "49,500원",
  },
  {
    id: "3",
    from: "뉴욕 (NYK)",
    to: "도쿄 (NRT)",
    depart: "9/22",
    return: "9/25",
    seat: "편도, 일반석",
    passenger: "4여행객",
    price: "249,500원",
  },
];

export default function PriceAlertScreen() {
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

  // 알림 카드 하나
  const renderItem = ({ item }: { item: (typeof alertData)[0] }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.circle}>
          <Text>✈️</Text>
        </View>

        <View style={styles.middle}>
          <Text style={styles.route}>
            {item.from} - {item.to}
          </Text>
          <Text style={styles.info}>
            {item.depart} 출발 · {item.seat}
          </Text>
          <Text style={styles.info}>
            {item.return} 도착 · {item.passenger}
          </Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity
            onPress={() => {
              setPendingDeleteId(item.id); // 삭제 대기 ID 저장
              setConfirmVisible(true); // 모달 보이기
            }}
          >
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>

          <Text style={styles.price}>{item.price}</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>보기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>{switchStates[item.id] ? "알림 켜기" : "알림 끄기"}</Text>
        <Switch
          value={switchStates[item.id] ?? true}
          onValueChange={() => toggleSwitch(item.id)}
        />
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* 전체 알림 ONOFF */}
      <View style={styles.globalToggle}>
        <Text style={styles.globalToggleText}>
          {globalSwitch ? "전체 알림 켜기" : "전체 알림 끄기"}
        </Text>
        <Switch value={globalSwitch} onValueChange={toggleGlobalSwitch} />
      </View>

      {/* 알림 카드 리스트 */}
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
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#f26522",
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
    justifyContent: "space-between",
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
});
