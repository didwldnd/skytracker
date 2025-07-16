import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import DateTimePicker from "@react-native-community/datetimepicker";

const options = {
  passengers: Array.from({ length: 9 }, (_, i) => `${i + 1}명`),
  seatClass: ["일반석", "프리미엄일반석", "비즈니스", "일등석"],
  stopover: ["상관없음", "직항 또는 1회", "직항만"],
};

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>(new Date());
  const [returnDate, setReturnDate] = useState<Date>(new Date());
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [passengers, setPassengers] = useState<number>(1);
  const [seatClass, setSeatClass] = useState("일반석");
  const [stopover, setStopover] = useState("상관없음");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "passengers" | "seatClass" | "stopover"
  >("passengers");

  const handleOptionSelect = (value: string) => {
    if (modalType === "passengers") setPassengers(parseInt(value));
    else if (modalType === "seatClass") setSeatClass(value);
    else if (modalType === "stopover") setStopover(value);
    setModalVisible(false);
  };

  const resetForm = () => {
    setDeparture("");
    setDestination("");
    setDepartureDate(new Date());
    setReturnDate(new Date());
    setPassengers(parseInt("1명"));
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

      <TextInput
        style={styles.input}
        placeholder="출발지 (예: ICN)"
        value={departure}
        onChangeText={setDeparture}
      />
      <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
        <Text>⇅</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="도착지 (예: JFK)"
        value={destination}
        onChangeText={setDestination}
      />

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
        {[
          { label: "여행객", value: passengers, type: "passengers" },
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
              passengers,
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
                  onPress={() => handleOptionSelect(item)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="닫기" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
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
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  option: {
    paddingVertical: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
  },
  bigButton: {
    flex: 1,
    backgroundColor: "#007BFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  smallButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  swapButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  swapIcon: {
    fontSize: 18,
  },
});
