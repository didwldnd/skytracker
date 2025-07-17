import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Calendar } from "react-native-calendars";
import { LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  monthNamesShort: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: [
    '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일',
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};

LocaleConfig.defaultLocale = 'ko';

interface Props {
  departureDate: Date;
  returnDate: Date;
  showDeparturePicker: boolean;
  showReturnPicker: boolean;
  setShowDeparturePicker: (visible: boolean) => void;
  setShowReturnPicker: (visible: boolean) => void;
  setDepartureDate: (date: Date) => void;
  setReturnDate: (date: Date) => void;
}

const DateSelector = ({
  departureDate,
  returnDate,
  showDeparturePicker,
  showReturnPicker,
  setShowDeparturePicker,
  setShowReturnPicker,
  setDepartureDate,
  setReturnDate,
}: Props) => {
  const formatDate = (date: Date) =>
    date.toISOString().split("T")[0];

  return (
    <View style={styles.dateRow}>
      {/* 출발일 */}
      <View style={styles.dateColumn}>
        <Text style={styles.label}>출발일</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text>{formatDate(departureDate)}</Text>
        </TouchableOpacity>

        <Modal visible={showDeparturePicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.calendarWrapper}>
              <Calendar
                onDayPress={(day) => {
                  setDepartureDate(new Date(day.dateString));
                  setShowDeparturePicker(false);
                }}
                markedDates={{
                  [formatDate(departureDate)]: {
                    selected: true,
                    selectedColor: "#FF6F00",
                  },
                }}
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
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* 귀국일 */}
      <View style={styles.dateColumn}>
        <Text style={styles.label}>귀국일</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowReturnPicker(true)}
        >
          <Text>{formatDate(returnDate)}</Text>
        </TouchableOpacity>

        <Modal visible={showReturnPicker} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.calendarWrapper}>
              <Calendar
                onDayPress={(day) => {
                  setReturnDate(new Date(day.dateString));
                  setShowReturnPicker(false);
                }}
                markedDates={{
                  [formatDate(returnDate)]: {
                    selected: true,
                    selectedColor: "#FF6F00",
                  },
                }}
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
                onPress={() => setShowReturnPicker(false)}
              >
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
    backgroundColor: "#FF6F00",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
