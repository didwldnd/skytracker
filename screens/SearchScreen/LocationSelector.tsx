import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";

interface Props {
  departure: string;
  destination: string;
  onSwap: () => void;
  /**
   * 선택 모달을 여는 콜백.
   * - field: 어느 입력을 선택하는지
   * - options.excludeCode: 목록에서 제외할 공항 코드(=반대편 코드)
   *   → SearchModal에서 이 값을 이용해 동일 공항을 숨기면 실수 예방 가능
   */
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
  const sameOrEmpty = !departure || !destination || departure === destination;

  const handleSwap = () => {
    // 출/도착 중 하나가 비었거나 동일하면 스왑 금지
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
      <TouchableOpacity
        onPress={() => onSelectField("departure", { excludeCode: destination })}
        style={styles.input}
      >
        <Text style={styles.inputText}>
          {departure ? departure : "출발지 선택"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.swapButton, sameOrEmpty && styles.swapDisabled]}
        onPress={handleSwap}
        disabled={sameOrEmpty}
        accessibilityLabel="출발지와 도착지 교환"
        accessibilityState={{ disabled: sameOrEmpty }}
      >
        <Text style={styles.swapIcon}>⇅</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onSelectField("destination", { excludeCode: departure })}
        style={styles.input}
      >
        <Text style={styles.inputText}>
          {destination ? destination : "도착지 선택"}
        </Text>
      </TouchableOpacity>

      {/* 동일 공항 선택 시 안내 라벨 (선택 사항) */}
      {departure && destination && departure === destination && (
        <Text style={styles.helperText}>
          출발지와 도착지가 같습니다. 다른 공항을 선택해주세요.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  locationWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
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
  swapDisabled: {
    opacity: 0.4,
  },
  swapIcon: {
    fontSize: 16,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: "#d00",
  },
});
