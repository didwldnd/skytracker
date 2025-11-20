// utils/apiClient.ts
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../config/env";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// 🔐 토큰 helpers
async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/**
 * ✅ 인증 필요한 모든 요청은 이 함수만 사용하면 됨
 *  - 자동으로 accessToken을 헤더에 붙이고
 *  - 401 나오면 /api/user/refresh-token 호출해서 accessToken 재발급 후
 *  - 같은 요청을 새 토큰으로 한 번 더 보냄
 *
 *  실패 시:
 *   - refreshToken 없음 → Error("NO_REFRESH_TOKEN")
 *   - refresh 실패 → Error("REFRESH_FAILED")
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = await getAccessToken();

  // 공통 헤더 구성
  const baseHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const headersWithAccess: HeadersInit = {
    ...baseHeaders,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  // 🟢 1차 요청
  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: headersWithAccess,
  });

  // 🔴 accessToken 만료 (401) → refresh-token 로직 진입
  if (response.status === 401) {
    console.log("🔄 [apiFetch] 401 발생 → /api/user/refresh-token 요청 시도");

    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      console.log("❌ [apiFetch] refreshToken 없음 → 로그인 필요");
      throw new Error("NO_REFRESH_TOKEN");
    }

    // 🟡 refresh-token API 호출
    const refreshRes = await fetch(`${API_BASE}/api/user/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshRes.ok) {
      console.log(
        "❌ [apiFetch] refresh 실패, status:",
        refreshRes.status,
        refreshRes.statusText
      );
      throw new Error("REFRESH_FAILED");
    }

    const refreshData = await refreshRes.json();
    const newAccessToken = refreshData?.accessToken;

    if (!newAccessToken || typeof newAccessToken !== "string") {
      console.log("❌ [apiFetch] refresh 응답에 accessToken 없음");
      throw new Error("REFRESH_FAILED");
    }

    console.log("🔐 [apiFetch] 새 accessToken 발급:", newAccessToken);

    // 🟢 새 accessToken 저장
    await saveAccessToken(newAccessToken);

    // 🟢 새 accessToken으로 원래 요청 다시 시도
    const retryHeaders: HeadersInit = {
      ...baseHeaders,
      Authorization: `Bearer ${newAccessToken}`,
    };

    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: retryHeaders,
    });
  }

  // 최종 Response 반환 (성공이든, 401 이후 재시도든)
  return response;
}
