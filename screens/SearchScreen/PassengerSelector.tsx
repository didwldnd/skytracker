import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

interface Props {
  visible: boolean;
  counts: {
    adult: number;
    student: number;
    teen: number;
    child: number;
    infantWithSeat: number;
    infantOnLap: number;
  };
  onIncrement: (type: keyof Props["counts"]) => void;
  onDecrement: (type: keyof Props["counts"]) => void;
  onClose: () => void;
  showWarning: boolean;
  showMinWarning: boolean;
  onDismissWarning: () => void;
  onDismissMinWarning: () => void;
}

const ageGroups = [
  { key: "adult",           label: "성인",            description: "만 18세 이상" },
  { key: "student",         label: "학생",            description: "만 18세 이상" },
  { key: "teen",            label: "청소년",           description: "만 12~17세" },
  { key: "child",           label: "어린이",           description: "만 2~11세" },
  { key: "infantWithSeat",  label: "유아 (좌석)",      description: "만 2세 미만" },
  { key: "infantOnLap",     label: "유아 (무릎 위)",   description: "만 2세 미만" },
] as const;

const PassengerSelector = ({
  visible,
  counts,
  onIncrement,
  onDecrement,
  onClose,
  showWarning,
  showMinWarning,
  onDismissWarning,
  onDismissMinWarning,
}: Props) => {
  const { theme } = useTheme();

  // 최대 인원 경고 (로직 보존)
  useEffect(() => {
    if (showWarning) {
      const msg = "최대 9명까지 선택할 수 있습니다.";
      if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
      else Alert.alert("", msg);
      onDismissWarning();
    }
  }, [showWarning, onDismissWarning]);

  // 최소 인원 경고 (로직 보존)
  useEffect(() => {
    if (showMinWarning) {
      const msg = "최소한 1명의 승객을 추가해주시기 바랍니다.";
      if (Platform.OS === "android") ToastAndroid.show(msg, ToastAndroid.SHORT);
      else Alert.alert("", msg);
      onDismissMinWarning();
    }
  }, [showMinWarning, onDismissMinWarning]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.sheet, { backgroundColor: theme.card }]}>

              {/* ── Handle Bar ── */}
              <View style={[styles.handleBar, { backgroundColor: theme.border }]} />

              {/* ── 시트 타이틀 ── */}
              <View style={[styles.titleRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  여행객 선택
                </Text>
                <Text style={[styles.sheetSub, { color: theme.subText }]}>
                  최대 9명
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {ageGroups.map((group, idx) => {
                  const count = counts[group.key as keyof Props["counts"]];
                  const isLast = idx === ageGroups.length - 1;
                  return (
                    <View
                      key={group.key}
                      style={[
                        styles.row,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
                      ]}
                    >
                      {/* 레이블 */}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: theme.text }]}>
                          {group.label}
                        </Text>
                        <Text style={[styles.desc, { color: theme.subText }]}>
                          {group.description}
                        </Text>
                      </View>

                      {/* 카운터 */}
                      <View style={styles.counter}>
                        <TouchableOpacity
                          onPress={() => onDecrement(group.key as keyof Props["counts"])}
                          style={[
                            styles.counterBtn,
                            {
                              backgroundColor: theme.muted,
                              borderColor: theme.border,
                              opacity: count === 0 ? 0.4 : 1,
                            },
                          ]}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`${group.label} 감소`}
                        >
                          <Ionicons name="remove-outline" size={18} color={theme.text} />
                        </TouchableOpacity>

                        <Text style={[styles.countNum, { color: theme.text }]}>
                          {count}
                        </Text>

                        <TouchableOpacity
                          onPress={() => onIncrement(group.key as keyof Props["counts"])}
                          style={[
                            styles.counterBtn,
                            {
                              backgroundColor: theme.muted,
                              borderColor: theme.border,
                            },
                          ]}
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`${group.label} 증가`}
                        >
                          <Ionicons name="add-outline" size={18} color={theme.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* ── 적용 버튼 ── */}
              <View style={styles.applyWrap}>
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="승객 수 적용"
                >
                  <Text style={styles.applyText}>적용</Text>
                </TouchableOpacity>
              </View>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PassengerSelector;

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
    maxHeight: "75%",
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
    alignItems: "baseline",
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
  sheetSub: {
    fontSize: 13,
    fontWeight: "400",
  },

  // ── 승객 행 ──
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    fontWeight: "400",
  },

  // ── 카운터 ──
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  countNum: {
    fontSize: 17,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
  },

  // ── 적용 버튼 ──
  applyWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  applyBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
