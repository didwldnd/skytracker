import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { fetchAirports } from "../utils/amadeus"; // 경로 확인

interface Airport {
  city: string;
  airport: string;
  code: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  data: Airport[];
  fieldLabel?: string;
}

export default function SearchModal({
  visible,
  onClose,
  onSelect,
  data,
  fieldLabel = "출발지",
}: Props) {
  const [query, setQuery] = useState("");

  // query에 포함되는 city, airport, code 항목을 먼저 필터링한 뒤,
  // 공항 코드(code)를 기준으로 중복 항목 제거
  // → Map을 이용해 동일한 code는 하나만 남기고 중복 제거함
  const filtered = Array.from(
    new Map(
      data
        .filter(({ city, airport, code }) =>
          [city, airport, code].some((field) =>
            field.toLowerCase().includes(query.toLowerCase())
          )
        )
        .map((item) => [item.code, item]) // code를 key로 설정해서 Map 생성 → 중복 자동 제거
    ).values() // Map에서 고유한 값들만 배열로 변환
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{fieldLabel}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* 검색창 */}
        <TextInput
          style={styles.input}
          placeholder="도시, 공항 또는 코드 검색"
          value={query}
          onChangeText={setQuery}
        />

        {/* 공항 리스트 */}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.code}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                onSelect(item.code);
                setQuery("");
              }}
            >
              <View>
                <Text style={styles.city}>{item.city}</Text>
                <Text style={styles.airport}>{item.airport}</Text>
              </View>
              <Text style={styles.code}>{item.code}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  closeIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    backgroundColor: "#f9f9f9",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  city: {
    fontWeight: "bold",
    fontSize: 16,
  },
  airport: {
    fontSize: 13,
    color: "#666",
  },
  code: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    alignSelf: "center",
  },
});
