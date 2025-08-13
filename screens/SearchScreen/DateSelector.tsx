import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

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
  tripType: "왕복" | "편도";
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
  tripType,
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
  const isOneWay = tripType === "편도";

  // 👇 귀국일 페이드 아웃용 애니메이션 값
  const returnOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(returnOpacity, {
      toValue: isOneWay ? 0.35 : 1, // 편도면 흐릿하게(0.35~0.5 사이 추천)
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOneWay, returnOpacity]);

  const onDayPress = (day: { dateString: string }) => {
    const today = new Date(formatDate(new Date()));
    const selectedDate = new Date(day.dateString);
    if (selectedDate < today) return;

    setCurrentMonth(day.dateString);

    // 편도: 한 날짜만 선택
    if (isOneWay) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          endingDay: true,
          color: "#0be5ecd7",
          textColor: "#fff",
        },
      });
      setDepartureDate(new Date(day.dateString));
      setReturnDate(new Date(day.dateString)); // 내부 형식 통일 목적
      return;
    }

    // 왕복: 기존 로직
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#0be5ecd7",
          textColor: "#fff",
        },
      });
    } else {
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
            color: "#0be5ecd7",
            textColor: "#fff",
          };
        } else if (index === range.length - 1) {
          newMarked[date] = {
            endingDay: true,
            color: "#0be5ecd7",
            textColor: "#fff",
          };
        } else {
          newMarked[date] = { color: "#FFE0B2", textColor: "#000" };
        }
      });

      setStartDate(earlier);
      setEndDate(later);
      setMarkedDates(newMarked);
      setDepartureDate(new Date(earlier));
      setReturnDate(new Date(later));
    }
  };

  const getDatesBetween = (start: string, end: string): string[] => {
    const dates: string[] = [];
    let current = new Date(start);
    let last = new Date(end);
    if (current > last) [current, last] = [last, current];
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // reset 시 달력 초기화
  useEffect(() => {
    if (!startDate && !endDate) {
      setMarkedDates({});
      setCurrentMonth(formatDate(new Date()));
    }
  }, [startDate, endDate]);

  return (
    <View style={styles.dateRow}>
      {/* 출발일 */}
      <View style={styles.dateColumn}>
        <Text style={styles.label}>출발일</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDeparturePicker(true)}
        >
          <Text style={styles.inputText}>{formatDate(departureDate)}</Text>
        </TouchableOpacity>
      </View>

      {/* 귀국일: 항상 자리를 유지(폭 고정), 편도면 흐릿 + 터치 막기 */}
      <Animated.View
        style={[styles.dateColumn, { opacity: returnOpacity }]}
        pointerEvents={isOneWay ? "none" : "auto"} // 터치 차단
        accessibilityElementsHidden={isOneWay}
        importantForAccessibility={isOneWay ? "no-hide-descendants" : "auto"}
      >
        <Text style={[styles.label, isOneWay && styles.disabledLabel]}>
          귀국일
        </Text>
        <TouchableOpacity
          style={[styles.input, isOneWay && styles.inputDisabled]}
          onPress={() => setShowDeparturePicker(true)}
          disabled={isOneWay} // 터치 비활성화
        >
          <Text
            style={[styles.inputText, isOneWay && styles.inputTextDisabled]}
          >
            {isOneWay ? "-" : formatDate(returnDate)}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 달력 모달 */}
      <Modal visible={showDeparturePicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.calendarWrapper}>
            <Calendar
              key={String(startDate) + "_" + String(endDate)}
              current={currentMonth}
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType={"period"}
              minDate={formatDate(new Date())}
              theme={{
                selectedDayBackgroundColor: "#0be5ecd7",
                todayTextColor: "#0be5ecd7",
                arrowColor: "#0be5ecd7",
                textDayFontWeight: "500",
                textMonthFontWeight: "bold",
              }}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setShowDeparturePicker(false)}
              >
                <Text style={styles.modalButtonText}>닫기</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#0be5ecd7" }]}
                onPress={() => setShowDeparturePicker(false)}
              >
                <Text style={styles.modalButtonText}>적용</Text>
              </TouchableOpacity>
            </View>
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
    flex: 1, // 박스 폭 고정(1:1)
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: "#000",
  },
  disabledLabel: {
    color: "#9aa0a6",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  inputDisabled: {
    backgroundColor: "#f2f2f2",
    borderColor: "#e0e0e0",
  },
  inputText: {
    color: "#1f2937",
    fontWeight: "600",
  },
  inputTextDisabled: {
    color: "#9aa0a6",
    fontWeight: "500",
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
