import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from "react-native-calendars";

LocaleConfig.locales["ko"] = {
  monthNames: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  monthNamesShort: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
  dayNames: [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ],
  dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
  today: "오늘",
};

LocaleConfig.defaultLocale = "ko";

interface Props {
  departureDate: Date;
  returnDate: Date;
  showDeparturePicker: boolean;
  setShowDeparturePicker: (visible: boolean) => void;
  setDepartureDate: (date: Date) => void;
  setReturnDate: (date: Date) => void;
  startDate: string | null;
  endDate: string | null;
  markedDates: Record<string, any>;
  setStartDate: (date: string | null) => void;
  setEndDate: (date: string | null) => void;
  setMarkedDates: (dates: Record<string, any>) => void;
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
}

const DateSelector = ({
  departureDate,
  returnDate,
  showDeparturePicker,
  setShowDeparturePicker,
  setDepartureDate,
  setReturnDate,
  startDate,
  endDate,
  markedDates,
  setStartDate,
  setEndDate,
  setMarkedDates,
  currentMonth,
  setCurrentMonth,
}: Props) => {
  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const onDayPress = (day: { dateString: string }) => {
    setCurrentMonth(day.dateString);
    if (!startDate || (startDate && endDate)) {
      // 첫 번째 선택 -> 출발 후보일
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#FF6F00",
          textColor: "#fff",
        },
      });
    } else {
      // 두 번째 날짜 선택 -> 범위 확정
      const first = new Date(startDate);
      const second = new Date(day.dateString);

      const earlier = first < second ? startDate : day.dateString;
      const later = first < second ? day.dateString : startDate;

      const range = getDatesBetween(earlier, later);
      const newMarked: Record<string, any> = {};

      range.forEach((date, index) => {
        if (index === 0) {
          newMarked[date] = {
            startingDay: true,
            color: "#FF6F00",
            textColor: "#fff",
          };
        } else if (index === range.length - 1) {
          newMarked[date] = {
            endingDay: true,
            color: "#FF6F00",
            textColor: "#fff",
          };
        } else {
          newMarked[date] = {
            color: "#FFE0B2",
            textColor: "#000",
          };
        }
      });

      setStartDate(earlier);
      setEndDate(later);
      setMarkedDates(newMarked);

      // 출발일/귀국일도 정렬해서 부모에 전달
      setDepartureDate(new Date(earlier));
      setReturnDate(new Date(later));
    }
  };

  const getDatesBetween = (start: string, end: string): string[] => {
    const dates = [];
    let current = new Date(start);
    let last = new Date(end);

    if (current > last) [current, last] = [last, current];

    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  // reset 되었을 때 내부 달력 초기화 처리
  useEffect(() => {
    if (!startDate && !endDate) {
      setMarkedDates({});
      setCurrentMonth(formatDate(new Date())); // 현재 날짜의 월로 되돌림
    }
  }, [startDate, endDate]);

  return (
    <View style={styles.dateRow}>
      <View style={styles.dateColumn}>
        <Text style={styles.label}>출발일</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text>{formatDate(departureDate)}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateColumn}>
        <Text style={styles.label}>귀국일</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text>{formatDate(returnDate)}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showDeparturePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <Calendar
              key={startDate + "_" + endDate}
              current={currentMonth} // ✅ 현재 월 유지
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType={"period"}
              theme={{
                selectedDayBackgroundColor: "#FF6F00",
                todayTextColor: "#FF6F00",
                arrowColor: "#FF6F00",
                textDayFontWeight: "500",
                textMonthFontWeight: "bold",
              }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDeparturePicker(false)}
            >
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                  onPress={() => setShowDeparturePicker(false)}
                >
                  <Text style={styles.modalButtonText}>닫기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#FF6F00" }]}
                  onPress={() => setShowDeparturePicker(false)}
                >
                  <Text style={styles.modalButtonText}>적용</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  dateColumn: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  calendarWrapper: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
