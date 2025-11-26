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
  showWarning: boolean; // 최대 인원 경고
  showMinWarning: boolean; // 최소 인원 경고
  onDismissWarning: () => void;
  onDismissMinWarning: () => void;
}

const ageGroups = [
  { key: "adult", label: "성인", description: "만 18세 이상" },
  { key: "student", label: "학생", description: "만 18세 이상" },
  { key: "teen", label: "청소년", description: "만 12~17세" },
  { key: "child", label: "어린이", description: "만 2~11세" },
  { key: "infantWithSeat", label: "유아 (좌석)", description: "만 2세 미만" },
  {
    key: "infantOnLap",
    label: "유아 (성인 무릎 위)",
    description: "만 2세 미만",
  },
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

  // 최대 인원 경고
  useEffect(() => {
    if (showWarning) {
      const msg = "최대 9명까지 선택할 수 있습니다.";
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert("", msg);
      }
      onDismissWarning();
    }
  }, [showWarning, onDismissWarning]);

  // 최소 인원 경고
  useEffect(() => {
    if (showMinWarning) {
      const msg = "최소한 1명의 승객을 추가해주시기 바랍니다.";
      if (Platform.OS === "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
      } else {
        Alert.alert("", msg);
      }
      onDismissMinWarning();
    }
  }, [showMinWarning, onDismissMinWarning]);

  return (
    <>
      {/* 승객 선택 모달 */}
      <Modal visible={visible} animationType="slide" transparent>
        {/* 🔹 바깥(어두운 영역) 터치 시 닫기 */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            {/* 🔹 안쪽 시트는 터치해도 안 닫히게 한 번 더 래핑 */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <View
                style={[styles.modalContent, { backgroundColor: theme.card }]}
              >
                <ScrollView>
                  {ageGroups.map((group) => (
                    <View
                      key={group.key}
                      style={[
                        styles.option,
                        { borderBottomColor: theme.border },
                      ]}
                    >
                      <View>
                        <Text
                          style={[styles.optionText, { color: theme.text }]}
                        >
                          {group.label}
                        </Text>
                        <Text
                          style={{
                            color: (theme as any).subText ?? theme.text,
                          }}
                        >
                          {group.description}
                        </Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <TouchableOpacity
                          onPress={() =>
                            onDecrement(group.key as keyof Props["counts"])
                          }
                          style={[
                            styles.btn,
                            {
                              backgroundColor:
                                (theme as any).buttonBackground ?? "#eee",
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`${group.label} 감소`}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          {/* + / - 는 항상 검정색 */}
                          <Text style={{ color: "#000" }}>-</Text>
                        </TouchableOpacity>

                        <Text
                          style={{
                            marginHorizontal: 10,
                            color: theme.text,
                          }}
                        >
                          {counts[group.key as keyof Props["counts"]]}
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            onIncrement(group.key as keyof Props["counts"])
                          }
                          style={[
                            styles.btn,
                            {
                              backgroundColor:
                                (theme as any).buttonBackground ?? "#eee",
                            },
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={`${group.label} 증가`}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Text style={{ color: "#000" }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  style={[
                    styles.modalCloseButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="승객 수 적용"
                >
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
                  >
                    적용
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default PassengerSelector;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 18,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    minWidth: 36,
    alignItems: "center",
  },
  count: {
    marginHorizontal: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
  },
  modalCloseButtonText: {
    color: "#fff", // primary 위에 흰색 고정
    fontSize: 16,
    fontWeight: "bold",
  },
});
