import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

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

const SeatStopoverSelector = ({ visible, modalType, onClose, onSelect }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <FlatList
            data={options[modalType]}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onSelect(modalType, item);
                  onClose();
                }}
                style={styles.option}
              >
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  option: {
    paddingVertical: 15,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#0be5ecd7",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "stretch",
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
