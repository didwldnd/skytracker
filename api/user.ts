import { API_BASE } from "../config/env";
import { getAccessToken, clearTokens } from "../utils/tokenStorage";

export interface UserProfile {
    userId: number;
    email: string;
    username: string;
}

// 계정 삭제
export async function deleteAccount() {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("로그인 상태가 아닙니다.");

  const response = await fetch(`${API_BASE}/api/user`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error("계정 삭제 실패: " + text);
  }

  // 서버에서 성공했으면 로컬 토큰 제거
  await clearTokens();

  return true;
}


// 프로필 조회
export async function fetchProfile(): Promise<UserProfile | null> {
  const accessToken = await getAccessToken();

  // 토큰 없으면 = 로그아웃 상태
  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${API_BASE}/api/user/profile-screen`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // 토큰 만료 / 인증 안 됨 → 로그인 필요 상태로 처리
  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error("프로필 조회 실패: " + text);
  }

  const data = (await response.json()) as UserProfile;
  return data;
}