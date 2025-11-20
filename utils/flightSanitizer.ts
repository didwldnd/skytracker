// utils/flightSanitizer.ts
import { FlightSearchResponseDto } from "../types/FlightResultScreenDto";

// 어떤 입력이 와도 Flight 배열로 "강제 변환"
function coerceToArray(input: unknown): FlightSearchResponseDto[] {
  // 1) 이미 배열이면 그대로
  if (Array.isArray(input)) return input as FlightSearchResponseDto[];

  // 2) axios 스타일 { data: [...] }
  const data = (input as any)?.data;
  if (Array.isArray(data)) return data as FlightSearchResponseDto[];

  // 3) { results: [...] } 스타일
  const results = (input as any)?.results;
  if (Array.isArray(results)) return results as FlightSearchResponseDto[];

  // 4) 객체 속성들 중 배열인 것 하나라도 있으면 사용
  if (input && typeof input === "object") {
    for (const v of Object.values(input as Record<string, unknown>)) {
      if (Array.isArray(v)) return v as FlightSearchResponseDto[];
    }
  }

  // 5) 그 외에는 빈 배열
  return [];
}

export const sanitizeResults = (input: unknown) => {
  const arr = coerceToArray(input);
  const valid = arr;          // 필터링 안 하고 전부 사용
  const invalid: FlightSearchResponseDto[] = []; // 필요하면 나중에 사용
  return { valid, invalid };
};
