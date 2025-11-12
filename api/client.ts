import { API_BASE_URL } from "../config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function getAccessToken() {
  return AsyncStorage.getItem("accessToken");
}

async function setAccessToken(token: string) {
  await AsyncStorage.setItem("accessToken", token);
}

async function refreshAccessToken(): Promise<boolean> {
  // refresh_token은 HttpOnly 쿠키라 JS로 못 읽음 → 쿠키 포함해서 호출
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) return false;

  const data = await res.json(); // { accessToken: "..." }
  if (data?.accessToken) {
    await setAccessToken(data.accessToken);
    return true;
  }
  return false;
}

export async function apiFetch<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    headers?: Record<string, string>;
    auth?: boolean; // true면 Authorization 붙임
  } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth) {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const doFetch = async () =>
    fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include", // 🔥 refresh 쿠키 주고받기
    });

  let res = await doFetch();

  // 401 → 토큰 만료 가정 → refresh 시도 후 한 번 재시도
  if (res.status === 401 && options.auth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const token = await getAccessToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      res = await doFetch();
    }
  }

  // 여전히 실패면 에러
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}
