// utils/formatters.ts

/**
 * 가격 포맷터
 * - price: number | string | undefined 모두 안전 처리
 * - currency: 기본 "KRW"
 * - locale: 기본 "ko-KR"
 * - currencyDisplay: "symbol" | "code" | "name" (기본 "symbol")
 * - fractionDigits: 소수점 자릿수 강제 지정(기본: Intl 기본값 사용)
 *   - 예: KRW/JPY는 0, USD/EUR는 2가 기본. 강제하려면 { fractionDigits: 0 } 처럼 넘기세요.
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
  // 문자열 가격에 콤마 등 제거
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
    // 통화 코드가 이상해도 안전하게 표기 (기호 대신 코드 표기)
    const base = n.toLocaleString(locale);
    return currencyDisplay === "symbol" ? `${base} ${currency}`.trim() : `${base} ${currency}`.trim();
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
