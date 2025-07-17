import React from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  departure: string;
  destination: string;
  onChangeDeparture: (text: string) => void;
  onChangeDestination: (text: string) => void;
  onSwap: () => void;
}

export default function LocationSelector({
  departure,
  destination,
  onChangeDeparture,
  onChangeDestination,
  onSwap,
}: Props) {
  return (
    <View style={styles.locationWrapper}>
      <TextInput
        style={styles.input}
        placeholder="출발지 (예: ICN)"
        value={departure}
        onChangeText={onChangeDeparture}
      />
      <TouchableOpacity style={styles.swapButton} onPress={onSwap}>
        <Text style={styles.swapIcon}>⇅</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="도착지 (예: JFK)"
        value={destination}
        onChangeText={onChangeDestination}
      />
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
