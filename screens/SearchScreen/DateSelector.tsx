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
  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const isOneWay = tripType === "편도";

  // --- 폭 기반 애니메이션 (세로 튐 방지) ---
  const [rowWidth, setRowWidth] = useState(0);
  const progress = useRef(new Animated.Value(isOneWay ? 0 : 1)).current; // 0: 편도(귀국일 닫힘), 1: 왕복(열림)
  const labelOpacity = useRef(new Animated.Value(isOneWay ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOneWay ? 0 : 1,
      duration: 260,
      useNativeDriver: false, // width/opacity 애니메이션
    }).start();
  }, [isOneWay, progress]);
  useEffect(() => {
    // 편도로 갈 때는 라벨을 더 빠르게 사라지게(140ms)
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
      setReturnDate(new Date(day.dateString)); // 내부 형식 통일 목적
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

  return (
    <View>
      {/* KAYAK 스타일: 붙어있는 두 입력 */}
      <View
        style={styles.pillRow}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        {/* 출발일 */}
        <TouchableOpacity
          style={[styles.pillHalf, styles.pillLeft]}
          onPress={() => setShowDeparturePicker(true)}
          accessibilityLabel="출발일 선택"
        >
          <Text style={styles.pillLabel}>출발일</Text>
          <Text style={styles.pillValue}>{formatDate(departureDate)}</Text>
        </TouchableOpacity>

        {/* 구분선 (왕복에서만 페이드인) */}
        <Animated.View
          pointerEvents="none"
          style={[styles.pillDivider, { opacity: dividerOpacity }]}
        />

        <Animated.View
          style={[
            styles.returnWrap,
            rowWidth > 0 && {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (rowWidth - 1) / 2],
              }),
              opacity: progress, // 컨테이너 페이드(기존)
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
            {/* ✅ 라벨은 isOneWay 바뀌자마자 빠르게 페이드아웃 */}
            <Animated.Text
              style={[styles.pillLabel, { opacity: labelOpacity }]}
              numberOfLines={1}
            >
              귀국일
            </Animated.Text>

            {/* ✅ 값 텍스트는 폭이 어느 정도 나온 뒤에 등장(겹침 방지) */}
            <Animated.View
              pointerEvents="none"
              style={{
                opacity: returnTextOpacity,
                transform: [{ translateX: returnTextTranslateX }],
              }}
            >
              <Text
                style={styles.pillValue}
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
        {/* ✅ 바깥 어두운 영역 터치하면 닫힘 */}
        <TouchableWithoutFeedback onPress={() => setShowDeparturePicker(false)}>
          <View style={styles.modalContainer}>
            {/* ✅ 아래 시트 부분은 터치해도 닫히지 않도록 한 번 더 감싸서 이벤트 차단 */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.calendarWrapper}>
                <Calendar
                  key={String(startDate) + "_" + String(endDate)}
                  current={currentMonth}
                  onDayPress={onDayPress}
                  markedDates={markedDates}
                  markingType={"period"}
                  minDate={formatDate(new Date())}
                  theme={{
                    selectedDayBackgroundColor: THEME,
                    todayTextColor: THEME,
                    arrowColor: THEME,
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
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    overflow: "hidden",
    height: 56, // ✅ 세로 고정으로 높이 튐 방지
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
    overflow: "hidden", // ✅ 접히는 동안 내용 잘림 처리
  },
  pillDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    alignSelf: "stretch",
  },
  pillLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
    includeFontPadding: false,
  },
  pillValue: {
    fontSize: 16,
    color: "#111827",
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
