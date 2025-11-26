// components/SeatStopoverSelector.tsx
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

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {/* 오버레이 클릭 시 닫기 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          {/* 내부 눌렀을 땐 모달 유지 */}
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <FlatList
                data={options[modalType]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const disabled =
                    modalType === "seatClass" && unsupportedSeat.has(item);
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
                      style={[
                        styles.option,
                        { borderBottomColor: theme.border },
                        disabled && { opacity: 0.4 },
                      ]}
                    >
                      <Text style={[styles.optionText, { color: theme.text }]}>
                        {item}
                        {disabled ? " (미지원)" : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onClose}
              >
                <Text style={styles.modalCloseButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SeatStopoverSelector;

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
  },
  optionText: { fontSize: 18 },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#6ea1d4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
  },
  modalCloseButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
