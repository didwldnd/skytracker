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
import { Ionicons } from "@expo/vector-icons";
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

  useEffect(() => {
    if (!visible) setQuery("");
  }, [visible]);

  // 검색어 필터 → excludeCode 제거 → 중복 제거
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
      <View style={[styles.container, { backgroundColor: theme.background }]}>

        {/* ── 헤더 ── */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.card, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: theme.muted }]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={18} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {fieldLabel} 선택
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── 검색 입력창 ── */}
        <View
          style={[
            styles.inputRow,
            {
              backgroundColor: theme.card,
              borderBottomColor: theme.border,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.subText}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="도시, 공항 또는 코드 검색"
            placeholderTextColor={theme.placeholder}
            value={query}
            onChangeText={setQuery}
            autoFocus={visible}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── 반대편 공항 제외 안내 ── */}
        {excludeCode ? (
          <View style={[styles.notice, { backgroundColor: theme.muted }]}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={theme.subText}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.noticeText, { color: theme.subText }]}>
              {`반대편 공항(${excludeCode})은 목록에서 제외됩니다.`}
            </Text>
          </View>
        ) : null}

        {/* ── 공항 리스트 ── */}
        <FlatList
          data={filtered}
          keyExtractor={(item, index) => `${item.code}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, { borderBottomColor: theme.border }]}
              onPress={() => {
                onSelect(item.code);
                setQuery("");
              }}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.city, { color: theme.text }]}>
                  {item.city}
                </Text>
                <Text style={[styles.airport, { color: theme.subText }]}>
                  {item.airport}
                </Text>
              </View>
              <View style={[styles.codeBadge, { backgroundColor: theme.muted }]}>
                <Text style={[styles.code, { color: theme.primary }]}>
                  {item.code}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── 헤더 ──
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // ── 검색 입력 ──
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "400",
  },

  // ── 안내 배너 ──
  notice: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: "400",
    flex: 1,
  },

  // ── 리스트 아이템 ──
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  city: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  airport: {
    fontSize: 13,
    fontWeight: "400",
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 12,
  },
  code: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
