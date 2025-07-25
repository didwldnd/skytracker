import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
import { ScrollView } from "react-native-gesture-handler";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
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
    setStartDate(null);
    setEndDate(null);
    setMarkedDates({});
  };

  const handleSwap = () => {
    setDeparture((prevDeparture) => {
      setDestination(prevDeparture);
      return destination;
    });
  };

  const [loading, setLoading] = useState(false); // 검색버튼 로딩 애니메이션

  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().split("T")[0]
  );

  const mockResults: FlightSearchResponseDto[] = [
    {
      airlineCode: "KE",
      airlineName: "KOREAN AIR",
      flightNumber: 907,
      departureAirport: "ICN",
      departureTime: "2025-07-25",
      arrivalAirport: "LHR",
      arrivalTime: "2025-07-25T17:20:00",
      duration: "PT14H25M",
      travelClass: "ECONOMY",
      numberOfBookableSeats: 9,
      hasCheckedBags: true,
      isRefundable: false,
      isChangeable: false,
      currency: "KRW",
      price: 1118800,
    },
  ];

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>항공권 검색</Text>

        <LocationSelector
          departure={departure}
          destination={destination}
          onChangeDeparture={setDeparture}
          onChangeDestination={setDestination}
          onSwap={handleSwap}
        />

        <DateSelector
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

        {/* 여행객 수 선택 버튼 */}
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

          {[
            // 좌석 + 경유 횟수
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

        <SeatStopoverSelector
          visible={modalVisible}
          modalType={modalType}
          onClose={() => setModalVisible(false)}
          onSelect={(type, value) => {
            if (type === "seatClass") setSeatClass(value);
            else setStopover(value);
          }}
        />
        <SearchButtons
          onReset={resetForm}
          onSearch={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              navigation.navigate("FlightResult", {
                originLocationCode: departure,
                destinationLocationCode: destination,
                departureDate: departureDate.toISOString(),
                returnDate: returnDate.toISOString(),
                adults: totalPassengers,
                travelClass: seatClass,
                stopover,
                results: mockResults, 
              });
            }, 2000);
          }}
          disabled={!departure || !destination}
        />
        <FlightLoadingModal visible={loading} />

        {/* // FlightResult로 네비게이션, 검색 애니메이션 2초로 일단 고정 */}

        <PopularScreen />
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
