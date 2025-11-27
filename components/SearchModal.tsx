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
import { useTheme } from "../context/ThemeContext";

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
  /** 반대편에서 이미 선택된 공항 코드 → 목록에서 제외(동일 공항 선택 방지) */
  excludeCode?: string;
}

export default function SearchModal({
  visible,
  onClose,
  onSelect,
  data,
  fieldLabel = "출발지",
  excludeCode,
}: Props) {
  const { theme } = useTheme();
  const [query, setQuery] = useState("");

  // 모달 닫힐 때 검색어 초기화
  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  // 1) 검색어 필터 → 2) excludeCode 제거 → 3) code 기준 중복 제거(Map)
  const filtered = Array.from(
    new Map(
      data
        .filter(({ city, airport, code }) =>
          [city, airport, code].some((field) =>
            field.toLowerCase().includes(query.toLowerCase())
          )
        )
        .filter(({ code }) => !excludeCode || code !== excludeCode)
        .map((item) => [item.code, item])
    ).values()
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background }, // 🔹 배경
        ]}
      >
        {/* 상단 헤더 */}
              <View
          style={[
            styles.header,
            { borderColor: theme.border }, 
          ]}
        >
          <TouchableOpacity onPress={onClose}>
             <Text style={[styles.closeIcon, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{fieldLabel}</Text>
          <View style={{ width: 24 }} />
        </View>
        {/* (옵션) 동일 공항 제외 안내 */}
       {excludeCode ? (
          <View
            style={[
              styles.notice,
              {
                backgroundColor: theme.card,
              },
            ]}
          >
            <Text style={[styles.noticeText, { color: theme.subText }]}>
              {`선택된 반대편 공항(${excludeCode})은 목록에서 제외됩니다.`}
            </Text>
          </View>
        ) : null}

        {/* 검색창 */}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="도시, 공항 또는 코드 검색"
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={setQuery}
        />


        {/* 공항 리스트 */}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.code}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              onPress={() => {
                onSelect(item.code);
                setQuery("");
              }}
            >
              <View>
                <Text style={[styles.city, { color: theme.text }]}>
                  {item.city}
                </Text>
                <Text style={[styles.airport, { color: theme.subText }]}>
                  {item.airport}
                </Text>
              </View>
              <Text style={[styles.code, { color: theme.text }]}>
                {item.code}
              </Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeIcon: { fontSize: 20 },
  title: { fontSize: 16, fontWeight: "bold" },
  notice: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
  },
  noticeText: { fontSize: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  city: { fontWeight: "bold", fontSize: 16 },
  airport: { fontSize: 13 },
  code: { fontSize: 16, fontWeight: "bold", alignSelf: "center" },
});