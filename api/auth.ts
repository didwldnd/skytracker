// api/auth.ts 같은 곳에
import { API_BASE } from "../config/env";
import { getAccessToken, clearTokens } from "../utils/tokenStorage";

export async function logout() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    console.log("로그아웃 시도: accessToken 없음");
    await clearTokens();
    return;
  }

  const response = await fetch(`${API_BASE}/api/user/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, 
    },
  });

  const body = await response.text();  // 🔥 body 읽기
  console.log("📨 서버 응답:", body); // → "로그아웃 완료" 뜬다

  // 서버에서 블랙리스트 처리 성공/실패와 상관없이
  // 클라이언트에서는 토큰 삭제
  await clearTokens();
}
