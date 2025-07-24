import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import Toast from "react-native-root-toast";

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
  return (
    <>
      {/* 승객 선택 모달 */}
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {ageGroups.map((group) => (
                <View key={group.key} style={styles.option}>
                  <View>
                    <Text style={styles.optionText}>{group.label}</Text>
                    <Text style={{ color: "gray" }}>{group.description}</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => onDecrement(group.key)}
                      style={styles.btn}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={{ marginHorizontal: 10 }}>
                      {counts[group.key]}
                    </Text>
                    <TouchableOpacity
                      onPress={() => onIncrement(group.key)}
                      style={styles.btn}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={styles.modalCloseButtonText}>적용</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 최대 인원 경고 */}
      {showWarning && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                최대 9명까지 선택할 수 있습니다.
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onDismissWarning}
              >
                <Text style={styles.modalCloseButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 최소 인원 경고 */}
      {showMinWarning && (
        <Modal transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                최소한 1명의 승객을 추가해주시기 바랍니다.
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={onDismissMinWarning}
              >
                <Text style={styles.modalCloseButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  count: {
    marginHorizontal: 10,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#95ee21d7",
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
  warningBox: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 24,
    width: 280,
    alignItems: "center",
    alignSelf: "center",
    marginTop: "50%",
  },
  warningText: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
});
