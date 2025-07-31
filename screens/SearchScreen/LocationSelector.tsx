import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

interface Props {
  departure: string;
  destination: string;
  onSwap: () => void;
  onSelectField: (field: "departure" | "destination") => void;
}

export default function LocationSelector({
  departure,
  destination,
  onSwap,
  onSelectField,
}: Props) {
  return (
    <View style={styles.locationWrapper}>
      <TouchableOpacity onPress={() => onSelectField("departure")} style={styles.input}>
        <Text style={styles.inputText}>
          {departure ? departure : "출발지 선택"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
        <Text style={styles.swapIcon}>⇅</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onSelectField("destination")} style={styles.input}>
        <Text style={styles.inputText}>
          {destination ? destination : "도착지 선택"}
        </Text>
      </TouchableOpacity>
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
  swapIcon: {
    fontSize: 16,
  },
});
