import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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

  const totalPassengers = Object.values(passengerCounts).reduce(
    (a, b) => a + b,
    0
  );

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
    setDeparture((prev) => {
      setDestination(prev);
      return destination;
    });
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
            if (type === "seatClass") setSeatClass(value);
            else setStopover(value);
          }}
        />

        <SearchButtons
          onReset={resetForm}
          onSearch={async () => {
            setLoading(true);
            try {
              let nonStop: boolean | undefined = undefined;
              let maxNumberOfConnections: number | undefined = undefined;

              if (stopover === "직항만") {
                nonStop = true;
              } else if (stopover === "직항 또는 1회") {
                maxNumberOfConnections = 1;
              }

              const requestDto: FlightSearchRequestDto = {
                originLocationAirport: departure,
                destinationLocationAirPort: destination,
                departureDate: departureDate.toISOString().split("T")[0],
                returnDate:
                  tripType === "왕복"
                    ? returnDate.toISOString().split("T")[0]
                    : undefined,
                currencyCode: "KRW",
                travelClass:
                  seatClass === "일반석"
                    ? "ECONOMY"
                    : seatClass === "프리미엄일반석"
                    ? "PREMIUM_ECONOMY"
                    : seatClass === "비즈니스"
                    ? "BUSINESS"
                    : seatClass === "일등석"
                    ? "FIRST"
                    : undefined,
                adults: passengerCounts.adult,
                max: 10,
                nonStop,
                maxNumberOfConnections,
              };

              const results = await searchFlights(requestDto);

              navigation.navigate("FlightResult", {
                originLocationCode: departure,
                destinationLocationCode: destination,
                departureDate: departureDate.toISOString(),
                returnDate: tripType === "왕복" ? returnDate.toISOString() : "",
                adults: passengerCounts.adult,
                travelClass: seatClass,
                stopover,
                results,
              });
            } catch (error) {
              console.error("항공편 검색 실패:", error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={!departure || !destination}
        />

        <FlightLoadingModal visible={loading} />
        <PopularScreen />
        <SearchModal
          visible={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelect={handleSelectAirport}
          data={airportData}
          fieldLabel={selectedField === "departure" ? "출발지" : "도착지"}
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
