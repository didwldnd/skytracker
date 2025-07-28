// 현지시간 변환 luxon

import { DateTime } from "luxon"; // DateTime 객체
import { airportTimezones } from "./airportTimezones";

// 출도착 시간 포맷
export const formatFlightTime = (isoDate: string, airportCode: string) => {
  const timezone = airportTimezones[airportCode];
  if (!timezone) return isoDate;

  const local = DateTime.fromISO(isoDate, { zone: timezone });
  return local.toFormat("M월 d일 a h:mm");
};

// duration (PT14H25M) → '14시간 25분'
export const formatDuration = (isoDuration: string): string => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  // 정규식 : PT뒤에 값에 따라 match
  if (!match) return isoDuration;

  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);

  const hourPart = hours > 0 ? `${hours}시간` : "";
  const minutePart = minutes > 0 ? `${minutes}분` : "";

  return `${hourPart} ${minutePart}`.trim() || "0분";
};