// screens/SearchScreen/SearchButtons.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  onReset: () => void;
  onSearch: () => void;
  disabled?: boolean;
}

export default function SearchButtons({ onReset, onSearch, disabled }: Props) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetText}>초기화</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.searchButton, disabled && styles.disabled]}
        onPress={onSearch}
        disabled={disabled}
      >
        <Text style={styles.searchText}>항공권 검색</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  resetButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderColor: "#aaa",
    borderWidth: 1,
    alignItems: "center",
  },
  resetText: {
    color: "#333",
    fontWeight: "600",
  },
  searchButton: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#0be5ecd7",
    alignItems: "center",
  },
  searchText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});
