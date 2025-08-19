// utils/formatFlightTime.ts

export { formatFlightTime } from "./formatters";

// 과거 이름 호환: formatDuration -> 내부의 formatDurationKo 사용
export { formatDurationKo as formatDuration } from "./formatters";

// 필요시 함께 쓰던 헬퍼도 그대로 전달 가능
export {
  formatTimeHHmm,
  dayShiftBetween,
  formatDayShiftBadge,
  formatPrice,
} from "./formatters";

export { dayShiftByDuration } from "./formatters";

