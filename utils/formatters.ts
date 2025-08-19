// utils/formatters.ts

/**
 * 가격 포맷터
 * - price: number | string | undefined 모두 안전 처리
 * - currency: 기본 "KRW"
 * - locale: 기본 "ko-KR"
 * - currencyDisplay: "symbol" | "code" | "name" (기본 "symbol")
 * - fractionDigits: 소수점 자릿수 강제 지정(기본: Intl 기본값 사용)
 */
export const formatPrice = (
  price: unknown,
  currency: string = "KRW",
  locale: string = "ko-KR",
  {
    currencyDisplay = "symbol" as "symbol" | "code" | "name",
    fractionDigits,
  }: { currencyDisplay?: "symbol" | "code" | "name"; fractionDigits?: number } = {}
): string => {
  const normalizeNumber = (v: unknown): number | undefined => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const cleaned = v.replace(/[, ]/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : undefined;
    }
    if (v != null && !Number.isNaN(Number(v))) {
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const n = normalizeNumber(price);
  if (typeof n !== "number") return "가격정보 없음";

  try {
    const opts: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      currencyDisplay,
    };
    if (typeof fractionDigits === "number") {
      opts.minimumFractionDigits = fractionDigits;
      opts.maximumFractionDigits = fractionDigits;
    }
    return new Intl.NumberFormat(locale, opts).format(n);
  } catch {
    const base = n.toLocaleString(locale);
    return currencyDisplay === "symbol"
      ? `${base} ${currency}`.trim()
      : `${base} ${currency}`.trim();
  }
};

/**
 * ISO 날짜 문자열 -> "HH:mm"
 * - 잘못된 값이면 "시간 없음" 반환
 * - 기본: 로컬 시간대. UTC로 강제하려면 useUTC=true
 */
export const formatTimeHHmm = (iso?: string, useUTC = false): string => {
  if (!iso) return "시간 없음";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "시간 없음";
  const getH = useUTC ? d.getUTCHours.bind(d) : d.getHours.bind(d);
  const getM = useUTC ? d.getUTCMinutes.bind(d) : d.getMinutes.bind(d);
  const hh = String(getH()).padStart(2, "0");
  const mm = String(getM()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * 항공권 표기용 "HH:mm (ICN)" 형태
 * - code 없으면 "(ICN)" 없이 시간만 반환
 * - 잘못된 값이면 "시간 없음" 반환
 */
export function formatFlightTime(iso?: string, code?: string): string {
  if (!iso) return "시간 없음";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "시간 없음";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return code ? `${hh}:${mm} (${code})` : `${hh}:${mm}`;
}

/**
 * ISO 8601 Duration(PT#H#M[#S]) -> "X시간 Y분"
 * - 예: "PT2H30M" => "2시간 30분"
 * - 초까지 오면 반올림/표시 선택 가능
 */
export const formatDurationKo = (iso?: string, showSeconds = false): string => {
  if (!iso) return "정보 없음";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "정보 없음";
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  const s = m[3] ? Number(m[3]) : 0;

  if (!h && !min && !s) return "정보 없음";
  const parts = [
    h ? `${h}시간` : "",
    min ? `${min}분` : "",
    showSeconds && s ? `${s}초` : "",
  ].filter(Boolean);

  return parts.join(" ").trim();
};

/* -------------------------- 항공 보조 유틸 -------------------------- */

/**
 * "YYYY-MM-DDTHH:mm:ss" 두 개를 비교하여
 * 도착이 출발보다 며칠 뒤(+)인지 전(-)인지 계산
 * - 날짜 단위만 비교 (현지-로컬 표기 혼선 최소화)
 */
export function dayShiftBetween(fromIso?: string, toIso?: string): number {
  if (!fromIso || !toIso) return 0;
  const fromD = fromIso.split("T")[0];
  const toD = toIso.split("T")[0];
  if (!fromD || !toD) return 0;

  const [fy, fm, fd] = fromD.split("-").map(Number);
  const [ty, tm, td] = toD.split("-").map(Number);

  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  const diffDays = Math.round((toUtc - fromUtc) / 86400000);
  return diffDays;
}

/** +N/-N일 배지 텍스트 생성 (0이면 빈 문자열) */
export function formatDayShiftBadge(n: number): string {
  if (n === 0) return "";
  return n > 0 ? `+${n}일` : `${n}일`;
}

// utils/formatters.ts (맨 아래 보조 유틸 섹션에 추가)

export function parseIsoDurationToMinutes(iso?: string): number | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  const s = m[3] ? Number(m[3]) : 0; // 초가 오면 필요시 반영
  return h * 60 + min + Math.floor(s / 60);
}

export function dayShiftByDuration(iso?: string): number {
  const mins = parseIsoDurationToMinutes(iso);
  if (mins == null) return 0;
  return Math.floor(mins / 1440); // 24h 단위
}
