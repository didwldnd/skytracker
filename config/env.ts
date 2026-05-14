import Constants from "expo-constants";

const fromEnv = (
  process.env.EXPO_PUBLIC_API_BASE ||
  process.env.EXPO_PUBLIC_API_URL ||
  ""
).trim();
const extra = Constants.expoConfig?.extra as { apiBase?: unknown } | undefined;
const fromExtra =
  typeof extra?.apiBase === "string" ? extra.apiBase.trim() : "";

const rawApiBase = fromEnv || fromExtra;

const PLACEHOLDER_HOST = "your-production-api-domain.com";
if (
  typeof __DEV__ !== "undefined" &&
  __DEV__ &&
  rawApiBase.toLowerCase().includes(PLACEHOLDER_HOST)
) {
  console.warn(
    `[config] API 주소가 아직 예시 도메인(${PLACEHOLDER_HOST})입니다. .env의 EXPO_PUBLIC_API_BASE를 IntelliJ로 배포한 실제 URL로 바꾼 뒤 Metro를 재시작하세요 (npx expo start -c).`
  );
}

if (!rawApiBase) {
  throw new Error(
    "API_BASE가 없습니다. 프로젝트 루트에 .env를 만들고 EXPO_PUBLIC_API_BASE=https://... 를 넣거나, app.json의 expo.extra.apiBase에 같은 값을 넣은 뒤 Metro를 재시작하세요 (npx expo start -c)."
  );
}

export const API_BASE = rawApiBase.replace(/\/+$/, "");
