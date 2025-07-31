import React, { useState } from "react";
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
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import SearchModal from "../../components/SearchModal";
import { searchFlights } from "../../utils/api";
import { FlightSearchRequestDto } from "../../types/FlightSearchRequestDto";

const airportData = [
  { city: "인천", airport: "인천국제공항", code: "ICN" },
  { city: "뉴델리", airport: "인디라간디국제공항", code: "DEL" },
  { city: "인도르", airport: "인도레공항", code: "IDR" },
  { city: "인디애나폴리스", airport: "인디애나폴리스국제공항", code: "IND" },
  { city: "인스브루크", airport: "인스브루크 공항", code: "INN" },
  { city: "도쿄", airport: "나리타국제공항", code: "NRT" },
  { city: "파리", airport: "샤를드골공항", code: "CDG" },
  { city: "런던", airport: "히드로공항", code: "LHR" },
  { city: "뉴욕", airport: "존 F. 케네디국제공항", code: "JFK" },
  { city: "로스앤젤레스", airport: "로스앤젤레스국제공항", code: "LAX" },
  { city: "시드니", airport: "시드니국제공항", code: "SYD" },
  { city: "싱가포르", airport: "창이국제공항", code: "SIN" },
  { city: "홍콩", airport: "홍콩국제공항", code: "HKG" },
  { city: "베이징", airport: "수도국제공항", code: "PEK" },
  { city: "상하이", airport: "푸동국제공항", code: "PVG" },
  { city: "오사카", airport: "간사이국제공항", code: "KIX" },
  { city: "방콕", airport: "수완나품국제공항", code: "BKK" },
  { city: "토론토", airport: "피어슨국제공항", code: "YYZ" },
  { city: "프랑크푸르트", airport: "프랑크푸르트공항", code: "FRA" },
  { city: "암스테르담", airport: "스키폴공항", code: "AMS" },
];

const SearchScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
              const requestDto: FlightSearchRequestDto = {
                originLocationAirport: departure,
                destinationLocationAirPort: destination,
                departureDate: departureDate.toISOString().split("T")[0],
                returnDate: returnDate.toISOString().split("T")[0],
                currencyCode: "KRW",
                nonStop: stopover === "직항",
                travelClass:
                  seatClass === "일반석"
                    ? "ECONOMY"
                    : seatClass === "비즈니스석"
                    ? "BUSINESS"
                    : undefined,
                adults: passengerCounts.adult,
                max: 10,
              };

              const results = await searchFlights(requestDto);

              navigation.navigate("FlightResult", {
                originLocationCode: departure,
                destinationLocationCode: destination,
                departureDate: departureDate.toISOString(),
                returnDate: returnDate.toISOString(),
                adults: passengerCounts.adult,
                travelClass: seatClass,
                stopover,
                results,
              });
            } catch (error) {
              console.error("항공편 검색 실패:", error);
              // 원한다면 여기에서 Alert.alert(...) 같은 사용자 알림도 가능
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
