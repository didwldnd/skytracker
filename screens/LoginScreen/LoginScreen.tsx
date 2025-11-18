// screens/LoginScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { API_BASE } from "../../config/env";

WebBrowser.maybeCompleteAuthSession(); // 브라우저 세션 마무리 (앱 시작 시 1회)

async function handleLoginSuccess(data: any) {
  console.log("🔥 [handleLoginSuccess] 서버에서 받은 데이터:", data);

  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken ?? null;

  console.log("👉 accessToken:", accessToken);
  console.log("👉 refreshToken:", refreshToken);

  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }

  await SecureStore.setItemAsync("accessToken", String(accessToken));
  if (refreshToken) {
    await SecureStore.setItemAsync("refreshToken", String(refreshToken));
  }

  console.log("💾 SecureStore 저장 완료!");
}


type Provider = "google" | "kakao" | "naver";

/** ✅ 네이티브 전용: skytracker://redirect 로 복귀 */
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "skytracker",
  path: "redirect", // => skytracker://redirect
});

const baseAPI = API_BASE;

/** 쿼리 파라미터 파싱 (RN 호환) */
function parseParams(url: string) {
  const parsed = (Linking.parse(url) as any) || {};
  const qp = parsed.queryParams || {};
  return {
    code: (qp.code as string) ?? null,
    state: (qp.state as string) ?? null,
    session: (qp.session as string) ?? null,
    token: (qp.token as string) ?? null,
    error: (qp.error as string) ?? null,
    provider: (qp.provider as Provider) ?? null,
  };
}

/** 인가 시작 URL (백엔드 라우트 기준) */
function buildAuthorizeUrl(provider: Provider) {
  return `${baseAPI}/oauth2/authorization/${provider}`;
}

/** 로그인 공통 함수: 버튼 → 브라우저 → 딥링크 → (옵션) 서버 교환 */
async function loginWithProvider(provider: Provider) {
  const authorizeUrl = buildAuthorizeUrl(provider);

  // 세션 방식: 브라우저 열고, 복귀는 딥링크 리스너에서 처리
  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);

  // 일부 기기는 result.url이 비어 있고, 딥링크 리스너에서만 토큰을 받음
  if (result.type !== "success") return;

  if (result.url) {
    const { token, error, code, session } = parseParams(result.url);
    if (error) throw new Error(String(error));

    // [A] code 교환 방식 (백엔드가 요구 시 사용)
    if (code) {
      const res = await fetch(`${API_BASE}/oauth2/mobile/callback`, {
        method: "POST",
        headers: { "Context-Type": "application/json" },
        body: JSON.stringify({ provider, code, redirectUri }),
      });
      if (!res.ok) throw new Error("Token exchange failed");

      const data = await res.json();
      await handleLoginSuccess(data); // 여기서 둘다 저장
      
      return data;
    }

    // [B] 토큰이 직접 넘어오는 경우
    if (token) {
      // await handleLoginSuccess({ accessToken: token, refreshToken }); // 서버 포맷에 맞게
      await handleLoginSuccess({ accessToken: token }); 
      return { token };
    }

    // [C] 세션 식별자 방식 (백엔드가 지원 시)
    if (session) {
      const res = await fetch(`${API_BASE}/oauth2/mobile/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, session }),
      });
      if (!res.ok) throw new Error("Finalize failed");

      const data = await res.json();
      await handleLoginSuccess(data); // 저장 위치 통합
      return data;
    }
  }
}

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  // 🔔 딥링크 리스너: 백엔드가 skytracker://redirect?token=... 으로 보낼 때 토큰 저장
 useEffect(() => {
  const sub = Linking.addEventListener("url", async ({ url }) => {
    console.log("🔗 [딥링크 URL 수신]:", url);
    const parsed = parseParams(url);
    console.log("🔍 [딥링크 파싱 결과]:", parsed);

    const { token, error } = parsed;

    if (error) {
      console.log("❌ 딥링크 오류:", error);
      setLoadingProvider(null);
      return;
    }

    if (token) {
      console.log("🎉 딥링크 토큰 받음:", token);

      await handleLoginSuccess({ accessToken: token });
      setLoadingProvider(null);
      Alert.alert("로그인 완료", "로그인 성공");
    }
  });

  return () => sub.remove();
}, []);


  const handle = (provider: Provider) => async () => {
    try {
      setLoadingProvider(provider);
      const result = await loginWithProvider(provider);
      if (result?.token || result?.accessToken || result?.jwt) {
        Alert.alert("로그인 완료", `${provider} 로그인 성공`);
      }
    } catch (e: any) {
      Alert.alert(`${provider} 로그인 오류`, e?.message ?? "Unknown error");
    } finally {
      setLoadingProvider(null);
    }
  };

  const isDisabled = loadingProvider !== null;

  return (
    <LinearGradient
      colors={["#97fcccff", "#0be5ecd7", "#5dccffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <FontAwesome name="plane" size={28} color="#0be5ecd7" />
      </View>

      <Text style={styles.title}>SkyTracker</Text>
      <Text style={styles.subtitle}>하늘을 향한 여정의 시작</Text>
      <Text style={styles.subsubtitle}>최고의 항공편을 찾아 떠나세요</Text>

      {/* Google */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.google,
          isDisabled && loadingProvider !== "google" && styles.disabledButton,
        ]}
        onPress={handle("google")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "google" ? (
          <>
            <ActivityIndicator size="small" color="#444" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>로그인 중...</Text>
          </>
        ) : (
          <>
            <Image source={require("../../assets/google.png")} style={styles.icon} />
            <Text style={styles.buttonText}>Google로 계속하기</Text>
          </>
          
        )}
      </TouchableOpacity>

      {/* Kakao */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.kakao,
          isDisabled && loadingProvider !== "kakao" && styles.disabledButton,
        ]}
        onPress={handle("kakao")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "kakao" ? (
          <>
            <ActivityIndicator size="small" color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>로그인 중...</Text>
          </>
        ) : (
          <>
            <Image source={require("../../assets/kakao.png")} style={styles.icon} />
            <Text style={styles.buttonText}>카카오로 계속하기</Text>
          </>
        )}
      </TouchableOpacity>
      

      {/* Naver */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.naver,
          isDisabled && loadingProvider !== "naver" && styles.disabledButton,
        ]}
        onPress={handle("naver")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "naver" ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.buttonText, { color: "#fff" }]}>로그인 중...</Text>
          </>
        ) : (
          <>
            <Image source={require("../../assets/naver.png")} style={styles.icon} />
            <Text style={[styles.buttonText, { color: "#fff" }]}>네이버로 계속하기</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        로그인하면 SkyTracker의 <Text style={styles.link}>서비스 약관</Text>과{" "}
        <Text style={styles.link}>개인정보 처리방침</Text>에 동의하게 됩니다.
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#0be5ecd7",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: { fontSize: 16, color: "#fff", textAlign: "center", marginTop: 4 },
  subsubtitle: {
    fontSize: 14,
    color: "#f5f5f5",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  disabledButton: { opacity: 0.5 },
  icon: { width: 24, height: 24, marginRight: 8 },
  buttonText: { fontSize: 16, fontWeight: "600", color: "#000" },
  google: { backgroundColor: "#fff" },
  kakao: { backgroundColor: "#FEE500" },
  naver: { backgroundColor: "#03C75A" },
  footer: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginTop: 24,
    opacity: 0.8,
  },
  link: { textDecorationLine: "underline" },
});
