import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  visible: boolean;
  modalType: "seatClass" | "stopover";
  onClose: () => void;
  onSelect: (type: "seatClass" | "stopover", value: string) => void;
}

const options = {
  seatClass: ["일반석", "프리미엄일반석", "비즈니스", "일등석"],
  stopover: ["상관없음", "직항 또는 1회", "직항만"],
};

const MODAL_TITLE: Record<"seatClass" | "stopover", string> = {
  seatClass: "좌석 등급 선택",
  stopover: "경유 횟수 선택",
};

const unsupportedSeat = new Set(["프리미엄일반석", "일등석"]);

const notifyUnsupported = () => {
  const msg = "아직 미지원 좌석 등급입니다.";
  if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
  else Alert.alert(msg);
};

const SeatStopoverSelector = ({
  visible,
  modalType,
  onClose,
  onSelect,
}: Props) => {
  const { theme } = useTheme();
  const list = options[modalType];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* 오버레이 클릭 시 닫기 (로직 보존) */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.sheet, { backgroundColor: theme.card }]}>

              {/* ── Handle Bar ── */}
              <View style={[styles.handleBar, { backgroundColor: theme.border }]} />

              {/* ── 시트 타이틀 ── */}
              <View style={[styles.titleRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  {MODAL_TITLE[modalType]}
                </Text>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Ionicons name="close-outline" size={22} color={theme.subText} />
                </TouchableOpacity>
              </View>

              {/* ── 옵션 리스트 ── */}
              <FlatList
                data={list}
                keyExtractor={(item) => item}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                renderItem={({ item, index }) => {
                  const disabled =
                    modalType === "seatClass" && unsupportedSeat.has(item);
                  const isLast = index === list.length - 1;

                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (disabled) {
                          notifyUnsupported();
                          return;
                        }
                        onSelect(modalType, item);
                        onClose();
                      }}
                      activeOpacity={disabled ? 1 : 0.7}
                      style={[
                        styles.optionRow,
                        !isLast && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        },
                        disabled && styles.disabled,
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionText, { color: theme.text }]}>
                          {item}
                        </Text>
                        {disabled && (
                          <Text style={[styles.unsupportedLabel, { color: theme.subText }]}>
                            현재 미지원
                          </Text>
                        )}
                      </View>
                      {disabled ? (
                        <Ionicons name="lock-closed-outline" size={16} color={theme.border} />
                      ) : (
                        <Ionicons name="chevron-forward-outline" size={16} color={theme.border} />
                      )}
                    </TouchableOpacity>
                  );
                }}
              />

              {/* ── 닫기 버튼 ── */}
              <View style={styles.closeWrap}>
                <TouchableOpacity
                  style={[styles.closeBtn, { borderColor: theme.border }]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.closeBtnText, { color: theme.subText }]}>
                    닫기
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SeatStopoverSelector;

const styles = StyleSheet.create({
  // ── 오버레이 ──
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  // ── 시트 ──
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },

  // ── Handle Bar ──
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  // ── 타이틀 행 ──
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // ── 옵션 행 ──
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  unsupportedLabel: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },
  disabled: {
    opacity: 0.45,
  },

  // ── 닫기 버튼 ──
  closeWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
