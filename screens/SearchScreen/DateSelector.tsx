// components/search/DateSelector.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useTheme } from "../../context/ThemeContext";

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

const THEME = "#6ea1d4";

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
  const { isDark } = useTheme();

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const isOneWay = tripType === "편도";

  const [rowWidth, setRowWidth] = useState(0);
  const progress = useRef(new Animated.Value(isOneWay ? 0 : 1)).current;
  const labelOpacity = useRef(new Animated.Value(isOneWay ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOneWay ? 0 : 1,
      duration: 260,
      useNativeDriver: false,
    }).start();
  }, [isOneWay, progress]);

  useEffect(() => {
    Animated.timing(labelOpacity, {
      toValue: isOneWay ? 0 : 1,
      duration: isOneWay ? 140 : 180,
      useNativeDriver: false,
    }).start();
  }, [isOneWay, labelOpacity]);

  const dividerOpacity = progress;

  const onDayPress = (day: { dateString: string }) => {
    const today = new Date(formatDate(new Date()));
    const selectedDate = new Date(day.dateString);
    if (selectedDate < today) return;

    setCurrentMonth(day.dateString);

    if (isOneWay) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          endingDay: true,
          color: THEME,
          textColor: "#fff",
        },
      });
      setDepartureDate(new Date(day.dateString));
      setReturnDate(new Date(day.dateString));
      return;
    }

    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: THEME,
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
            color: THEME,
            textColor: "#fff",
          };
        } else if (index === range.length - 1) {
          newMarked[date] = {
            endingDay: true,
            color: THEME,
            textColor: "#fff",
          };
        } else {
          newMarked[date] = {
            color: isDark ? "#1f2937" : "#FFE0B2",
            textColor: isDark ? "#e5e7eb" : "#000",
          };
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

  useEffect(() => {
    if (!startDate && !endDate) {
      setMarkedDates({});
      setCurrentMonth(formatDate(new Date()));
    }
  }, [startDate, endDate]);

  const returnTextOpacity = progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0, 1],
  });

  const returnTextTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  // 라이트/다크 공통 pill 색
  const pillBg = isDark ? "#020617" : "#f9fafb";
  const pillBorder = isDark ? "#1e293b" : "#e5e7eb";
  const pillLabelColor = isDark ? "#9ca3af" : "#6b7280";
  const pillValueColor = isDark ? "#f9fafb" : "#111827";

  // 라이트 모드 때만 직접 색 세팅 (다크는 전역 패치에 맡김)
  const lightCalendarTheme = !isDark
    ? {
        backgroundColor: "#ffffff",
        calendarBackground: "#ffffff",
        dayTextColor: "#111827",
        textSectionTitleColor: "#111827",
        monthTextColor: "#111827",
        textDisabledColor: "#d1d5db",
      }
    : {};

  const calendarTheme = {
    selectedDayBackgroundColor: THEME,
    selectedDayTextColor: "#fff",
    todayTextColor: THEME,
    arrowColor: THEME,
    textDayFontWeight: "500",
    textMonthFontWeight: "bold",
    ...lightCalendarTheme,
  };

  const calendarStyle = !isDark
    ? { backgroundColor: "#ffffff", borderRadius: 12 }
    : { borderRadius: 12 };

  const wrapperStyle = !isDark
    ? [styles.calendarWrapper, { backgroundColor: "#ffffff" }]
    : [styles.calendarWrapper];

  return (
    <View>
      {/* KAYAK 스타일: 붙어있는 두 입력 */}
      <View
        style={[
          styles.pillRow,
          { borderColor: pillBorder, backgroundColor: pillBg },
        ]}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        {/* 출발일 */}
        <TouchableOpacity
          style={[styles.pillHalf, styles.pillLeft]}
          onPress={() => setShowDeparturePicker(true)}
          accessibilityLabel="출발일 선택"
        >
          <Text style={[styles.pillLabel, { color: pillLabelColor }]}>
            출발일
          </Text>
          <Text style={[styles.pillValue, { color: pillValueColor }]}>
            {formatDate(departureDate)}
          </Text>
        </TouchableOpacity>

        {/* 구분선 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pillDivider,
            { opacity: dividerOpacity, backgroundColor: pillBorder },
          ]}
        />

        {/* 귀국일 */}
        <Animated.View
          style={[
            styles.returnWrap,
            rowWidth > 0 && {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (rowWidth - 1) / 2],
              }),
              opacity: progress,
            },
          ]}
          pointerEvents={isOneWay ? "none" : "auto"}
          accessibilityElementsHidden={isOneWay}
          importantForAccessibility={isOneWay ? "no-hide-descendants" : "auto"}
        >
          <TouchableOpacity
            style={[styles.pillHalf, styles.pillRight]}
            onPress={() => setShowDeparturePicker(true)}
            disabled={isOneWay}
            accessibilityLabel="귀국일 선택"
            activeOpacity={0.8}
          >
            <Animated.Text
              style={[styles.pillLabel, { opacity: labelOpacity, color: pillLabelColor }]}
              numberOfLines={1}
            >
              귀국일
            </Animated.Text>

            <Animated.View
              pointerEvents="none"
              style={{
                opacity: returnTextOpacity,
                transform: [{ translateX: returnTextTranslateX }],
              }}
            >
              <Text
                style={[styles.pillValue, { color: pillValueColor }]}
                numberOfLines={1}
                ellipsizeMode="clip"
              >
                {isOneWay ? "" : formatDate(returnDate)}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 달력 모달 */}
      <Modal visible={showDeparturePicker} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowDeparturePicker(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={wrapperStyle}>
                <Calendar
                  key={String(startDate) + "_" + String(endDate)}
                  current={currentMonth}
                  onDayPress={onDayPress}
                  markedDates={markedDates}
                  markingType={"period"}
                  minDate={formatDate(new Date())}
                  style={calendarStyle}
                  theme={calendarTheme}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      { backgroundColor: isDark ? "#4b5563" : "#ccc" },
                    ]}
                    onPress={() => setShowDeparturePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>닫기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: THEME }]}
                    onPress={() => setShowDeparturePicker(false)}
                  >
                    <Text style={styles.modalButtonText}>적용</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default DateSelector;

const styles = StyleSheet.create({
  // ====== 붙은 입력 필 ======
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
    height: 56,
  },
  pillHalf: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    height: "100%",
  },
  pillLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  pillRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  returnWrap: {
    height: "100%",
    overflow: "hidden",
  },
  pillDivider: {
    width: 1,
    alignSelf: "stretch",
  },
  pillLabel: {
    fontSize: 12,
    marginBottom: 2,
    includeFontPadding: false,
  },
  pillValue: {
    fontSize: 16,
    fontWeight: "600",
    includeFontPadding: false,
  },

  // ====== 모달/캘린더 ======
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  calendarWrapper: {
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
