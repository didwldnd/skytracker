export const formatFlightTime = (iso?: string, code?: string) => {
  if (!iso) return "시간 없음";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "시간 없음";

  const hour = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${min} (${code})`;
};


export const formatDuration = (iso?: string) => {
  if (!iso) return "정보 없음";
  const match = iso.match(/PT(\d+H)?(\d+M)?/);
  if (!match) return "정보 없음";

  const hours = match[1]?.replace("H", "") ?? "0";
  const minutes = match[2]?.replace("M", "") ?? "0";
  return `${hours}시간 ${minutes}분`;
};
