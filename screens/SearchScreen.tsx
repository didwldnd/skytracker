import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScrollView } from "react-native-gesture-handler";
import PopularScreen from "./PopularScreen";

const options = {
  passengers: Array.from({ length: 9 }, (_, i) => `${i + 1}명`),
  seatClass: ["일반석", "프리미엄일반석", "비즈니스", "일등석"],
  stopover: ["상관없음", "직항 또는 1회", "직항만"],
};

const ageGroups = [
  { key: "adult", label: "성인", description: "만 18세 이상" },
  { key: "student", label: "학생", description: "만 18세 이상" },
  { key: "teen", label: "청소년", description: "만 12~17세" },
  { key: "child", label: "어린이", description: "만 2~11세" },
  { key: "infantWithSeat", label: "유아 (좌석)", description: "만 2세 미만" },
  {
    key: "infantOnLap",
    label: "유아 (성인 무릎 위)",
    description: "만 2세 미만",
  },
] as const;

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [seatClass, setSeatClass] = useState("일반석");
  const [stopover, setStopover] = useState("상관없음");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"seatClass" | "stopover">(
    "seatClass"
  );
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showMinWarning, setShowMinWarning] = useState(false);

  const [passengerCounts, setPassengerCounts] = useState({
    adult: 1,
    student: 0,
    teen: 0,
    child: 0,
    infantWithSeat: 0,
    infantOnLap: 0,
  });

  const totalPassengers = Object.values(passengerCounts).reduce(
    (a, b) => a + b,
    0
  );

  const increment = (type: keyof typeof passengerCounts) => {
    if (totalPassengers >= 9) {
      setShowWarning(true);
      return;
    }
    setPassengerCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const decrement = (type: keyof typeof passengerCounts) => {
    // 전체 합이 1이고 지금 누르려는 타입이 현재 값이 1 이상이면 차감 허용 → 결과적으로 0이 되면 경고
    const newValue = passengerCounts[type] - 1;
    const newCounts = { ...passengerCounts, [type]: Math.max(newValue, 0) };
    const newTotal = Object.values(newCounts).reduce((a, b) => a + b, 0);

    if (newTotal < 1) {
      setShowMinWarning(true);
      return;
    }

    setPassengerCounts(newCounts);
  };

  const resetForm = () => {
    setDeparture("");
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
  };

  const handleSwap = () => {
    setDeparture((prevDeparture) => {
      setDestination(prevDeparture);
      return destination;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>항공권 검색</Text>

      <View style={styles.locationWrapper}>
        <TextInput
          style={styles.input}
          placeholder="출발지 (예: ICN)"
          value={departure}
          onChangeText={setDeparture}
        />

        <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
          <Text style={styles.swapIcon}>⇅</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="도착지 (예: JFK)"
          value={destination}
          onChangeText={setDestination}
        />
      </View>

      <View style={styles.dateRow}>
        <View style={styles.dateColumn}>
          <Text style={styles.label}>출발일</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text>{departureDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDeparturePicker && (
            <DateTimePicker
              value={departureDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDeparturePicker(false);
                if (selectedDate) setDepartureDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.dateColumn}>
          <Text style={styles.label}>귀국일</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowReturnPicker(true)}
          >
            <Text>{returnDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showReturnPicker && (
            <DateTimePicker
              value={returnDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowReturnPicker(false);
                if (selectedDate) setReturnDate(selectedDate);
              }}
            />
          )}
        </View>
      </View>

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
                setModalType(item.type as any);
                setModalVisible(true);
              }}
            >
              <Text>{item.value}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.bigButton}
          onPress={() =>
            navigation.navigate("FlightResult", {
              departure,
              destination,
              departureDate: departureDate.toISOString().split("T")[0],
              returnDate: returnDate.toISOString().split("T")[0],
              passengers: totalPassengers,
              seatClass,
              stopover,
            })
          }
        >
          <Text style={styles.buttonText}>항공권 검색</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={resetForm}>
          <Text style={styles.buttonText}>초기화</Text>
        </TouchableOpacity>
      </View>

      {/* 하단에서 슬라이드 */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={options[modalType]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (modalType === "seatClass") setSeatClass(item);
                    else setStopover(item);
                    setModalVisible(false);
                  }}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPassengerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {ageGroups.map((group) => (
                <View key={group.key} style={styles.option}>
                  <View>
                    <Text style={styles.optionText}>{group.label}</Text>
                    <Text style={{ color: "gray" }}>{group.description}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => decrement(group.key)}
                      style={styles.btn}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>
                      {
                        passengerCounts[
                          group.key as keyof typeof passengerCounts
                        ]
                      }
                    </Text>

                    <TouchableOpacity
                      onPress={() => increment(group.key)}
                      style={styles.btn}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPassengerModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              최대 9명까지 선택할 수 있습니다.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowWarning(false)}
            >
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showMinWarning} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              최소한 1명의 승객을 추가해주시기 바랍니다.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMinWarning(false)}
            >
              <Text style={styles.modalCloseButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <PopularScreen /> 
    </View>
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
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateColumn: {
    flex: 1,
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  selectorItem: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  option: {
    paddingVertical: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
  },
  bigButton: {
    flex: 1,
    backgroundColor: "#f26522",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  smallButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  locationWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  swapButton: {
    position: "absolute",
    top: 30,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  swapIcon: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#f26522",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  btn: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  warningBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 24,
    width: 280,
    alignItems: "center",
    alignSelf: "center",
    marginTop: "50%",
  },
  warningText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
});
