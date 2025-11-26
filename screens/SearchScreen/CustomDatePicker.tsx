// components/CustomDatePicker.tsx
import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useTheme } from "../../context/ThemeContext";

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

const CustomDatePicker = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
}: Props) => {
  const { isDark } = useTheme();

  const bg = isDark ? "#101014" : "#ffffff";
  const textPrimary = isDark ? "#e8e8e8" : "#000000";
  const textSecondary = isDark ? "#888888" : "#aaaaaa";
  const border = isDark ? "#2c2c2e" : "#e0e0e0";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={[styles.container, { backgroundColor: bg }]}>
        <Calendar
          onDayPress={(day: DayType) => {
            onDateChange(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: "#6ea1d4",
            },
          }}
          theme={{
            // 전체 배경
            calendarBackground: bg,
            // 요일 텍스트
            textSectionTitleColor: textPrimary,
            // 날짜 텍스트
            dayTextColor: textPrimary,
            // 월 제목 (예: "11월 2025")
            monthTextColor: textPrimary,
            // 요일, 이전달/다음달 흐릿한 날짜
            textDisabledColor: textSecondary,

            // 오늘 색상
            todayTextColor: "#6ea1d4",

            // 네비게이션 화살표(+/- month)
            arrowColor: "#6ea1d4",

            // 선택된 날짜 배경
            selectedDayBackgroundColor: "#6ea1d4",
            selectedDayTextColor: "#ffffff",

            // 캘린더 border (달력 아래 선)
            'stylesheet.calendar.header': {
              header: {
                flexDirection: "row",
                justifyContent: "space-between",
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 10,
                alignItems: "center",
              },
              dayHeader: {
                color: textPrimary,
              },
            },
          }}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.applyBtn} onPress={onClose}>
            <Text style={styles.applyBtnText}>적용</Text>
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
  },
  container: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  closeBtn: {
    flex: 1,
    backgroundColor: "#444444",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  applyBtn: {
    flex: 1,
    backgroundColor: "#6ea1d4",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
});
