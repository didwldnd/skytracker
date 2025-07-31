export const formatFlightTime = (iso?: string, airportCode?: string) => {
  if (!iso) return "시간 없음";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "시간 없음";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatDuration = (duration?: string) => {
  if (!duration) return "정보 없음";
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return "정보 없음";

  const hours = match[1] ?? "0";
  const minutes = match[2] ?? "0";
  return `${hours}시간 ${minutes}분`;
};
