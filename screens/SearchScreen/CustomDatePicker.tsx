// components/CustomDatePicker.tsx
import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { Calendar, DateData } from "react-native-calendars";

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
};

type DayType = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
};

const CustomDatePicker = ({ visible, onClose, selectedDate, onDateChange }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Calendar
            onDayPress={(day: DayType) => {
              onDateChange(day.dateString);
              onClose(); // 날짜 선택 후 닫기
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#FF6F00",
              },
            }}
            theme={{
              selectedDayBackgroundColor: "#FF6F00",
              todayTextColor: "#FF6F00",
              arrowColor: "#FF6F00",
            }}
          />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDatePicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FF6F00",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
