// utils/paramMappers.ts
export type SeatLabel = "일반석" | "프리미엄일반석" | "비즈니스" | "일등석";
export type StopoverLabel = "상관없음" | "직항 또는 1회" | "직항만";

export function mapSeatClassToBackend(label?: SeatLabel) {
  switch (label) {
    case "일반석": return "ECONOMY";
    case "비즈니스": return "BUSINESS";
    // 현재 미지원
    case "프리미엄일반석":
    case "일등석":
    default:
      return undefined;
  }
}

export function mapStopoverToNonStop(label?: StopoverLabel) {
  // 현재 백엔드는 nonStop만 지원 (직항 또는 1회는 추후 maxNumberOfConnections=1로 확장 예정)
  return label === "직항만";
}
