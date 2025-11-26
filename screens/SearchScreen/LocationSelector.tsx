import React, { useMemo } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { airportData } from "../../data/airportData";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  departure: string;   // IATA 코드, 예: "ICN"
  destination: string; // IATA 코드, 예: "NRT"
  onSwap: () => void;
  onSelectField: (
    field: "departure" | "destination",
    options?: { excludeCode?: string }
  ) => void;
}

export default function LocationSelector({
  departure,
  destination,
  onSwap,
  onSelectField,
}: Props) {
  const { theme } = useTheme();

  // code -> city 맵
  const codeToCity = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of airportData) {
      map[a.code.toUpperCase().trim()] = a.city;
    }
    return map;
  }, []);

  // "도시 ( CODE )" 라벨
  const labelFromCode = (code?: string) => {
    if (!code) return "";
    const normalized = code.toUpperCase().trim();
    const city = codeToCity[normalized] || normalized;
    return `${city} (${normalized})`;
  };

  const sameOrEmpty = !departure || !destination || departure === destination;

  const handleSwap = () => {
    if (sameOrEmpty) {
      Alert.alert(
        "경로 교환 불가",
        !departure || !destination
          ? "출발지와 도착지를 모두 선택한 후 교환할 수 있습니다."
          : "출발지와 도착지가 같습니다. 다른 공항을 선택해주세요."
      );
      return;
    }
    onSwap();
  };

  return (
    <View style={styles.locationWrapper}>
      {/* 출발지 */}
      <TouchableOpacity
        onPress={() => onSelectField("departure", { excludeCode: destination })}
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        accessibilityLabel="출발지 선택"
      >
        <Text style={[styles.inputText, { color: theme.text }]}>
          {departure ? labelFromCode(departure) : "출발지 선택"}
        </Text>
      </TouchableOpacity>

      {/* 스왑 버튼 */}
      <TouchableOpacity
        style={[
          styles.swapButton,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
          sameOrEmpty && styles.swapDisabled,
        ]}
        onPress={handleSwap}
        disabled={sameOrEmpty}
        accessibilityLabel="출발지와 도착지 교환"
        accessibilityState={{ disabled: sameOrEmpty }}
      >
        <Text style={[styles.swapIcon, { color: theme.text }]}>⇅</Text>
      </TouchableOpacity>

      {/* 도착지 */}
      <TouchableOpacity
        onPress={() =>
          onSelectField("destination", { excludeCode: departure })
        }
        style={[
          styles.input,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
          },
        ]}
        accessibilityLabel="도착지 선택"
      >
        <Text style={[styles.inputText, { color: theme.text }]}>
          {destination ? labelFromCode(destination) : "도착지 선택"}
        </Text>
      </TouchableOpacity>

      {departure && destination && departure === destination && (
        <Text style={styles.helperText}>
          출발지와 도착지가 같습니다. 다른 공항을 선택해주세요.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationWrapper: { position: "relative", marginBottom: 15 },
  input: {
    borderColor: "#ccc",      // 실제 사용 시 theme.border로 오버라이드
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9", // 실제 사용 시 theme.card로 오버라이드
    marginBottom: 8,
  },
  inputText: { fontSize: 16, color: "#333" }, // 실제 사용 시 theme.text로 오버라이드
  swapButton: {
    position: "absolute",
    top: 30,
    right: 10,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f9f9f9", // theme.card로 오버라이드
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",       // theme.border로 오버라이드
  },
  swapDisabled: { opacity: 0.4 },
  swapIcon: { fontSize: 16, color: "#333" }, // theme.text로 오버라이드
  helperText: { marginTop: 4, fontSize: 12, color: "#d00" },
});
