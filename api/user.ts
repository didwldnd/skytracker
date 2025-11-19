import { API_BASE } from "../config/env";
import { getAccessToken, clearTokens } from "../utils/tokenStorage";

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
