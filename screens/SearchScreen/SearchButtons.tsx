// screens/SearchScreen/SearchButtons.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext"; // ⭐ 추가

interface Props {
  onReset: () => void;
  onSearch: () => void;
  disabled?: boolean;
}

export default function SearchButtons({ onReset, onSearch, disabled }: Props) {
  const { theme, isDark } = useTheme(); // ⭐ 다크모드 정보 가져오기

  return (
    <View style={styles.buttonRow}>
      {/* 초기화 버튼 */}
      <TouchableOpacity
        style={[
          styles.resetButton,
          { borderColor: isDark ? "#555" : "#aaa" } // ⭐ 다크모드 경계선
        ]}
        onPress={onReset}
      >
        <Text
          style={[
            styles.resetText,
            { color: isDark ? theme.text : "#333" } // ⭐ 다크모드 글씨
          ]}
        >
          초기화
        </Text>
      </TouchableOpacity>

      {/* 검색 버튼 */}
      <TouchableOpacity
        style={[
          styles.searchButton,
          disabled && styles.disabled,
          { backgroundColor: theme.primary } // ⭐ 다크모드에서도 theme.primary 사용
        ]}
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
    borderWidth: 1,
    alignItems: "center",
  },
  resetText: {
    fontWeight: "600",
  },
  searchButton: {
    flex: 2,
    padding: 14,
    borderRadius: 8,
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
