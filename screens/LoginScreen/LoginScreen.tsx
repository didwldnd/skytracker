// screens/LoginScreen.tsx
import React, { useState } from "react";
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
import * as Google from "expo-auth-session/providers/google"
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession(); // 브라우저 세션 마무리 (앱 시작 시 1회)

type Provider = "google" | "kakao" | "naver";

/** ✅ 네이티브 전용: skytracker://redirect 로 복귀 */
const redirectUri = AuthSession.makeRedirectUri({
  scheme: "skytracker",
  path: "redirect", // => skytracker://redirect
});

const API_BASE = "https://sherril-palaeanthropic-nonavoidably.ngrok-free.dev";

/** 쿼리 파라미터 파싱 유틸 */
function parseParams(url: string) {
  const u = new URL(url);
  const qp = u.searchParams;
  return {
    code: qp.get("code"),
    state: qp.get("state"),
    session: qp.get("session"),
    token: qp.get("token"),
    error: qp.get("error"),
    provider: qp.get("provider") as Provider | null,
  };
}

/** 인가 시작 URL 생성 (백엔드 라우트에 맞춰 필요시 수정) */
function buildAuthorizeUrl(provider: Provider, state: string) {
  const url = new URL(`${API_BASE}/oauth2/authorization/${provider}`);
  url.searchParams.set("state", state);
  return url.toString();
}

/** 로그인 공통 함수: 버튼 → 브라우저 → 딥링크 → 백엔드 POST */
async function loginWithProvider(provider: Provider) {
  const state = Math.random().toString(36).slice(2);

  const authorizeUrl = buildAuthorizeUrl(provider, state);
  const result = await WebBrowser.openAuthSessionAsync(authorizeUrl, redirectUri);

  if (result.type !== "success" || !result.url) return;

  const { code, session, token, error, state: returnedState } = parseParams(result.url);
  if (error) throw new Error(error);
  if (returnedState && returnedState !== state) throw new Error("State mismatch");

  // ✅ 백엔드 설계에 맞춰 한 가지 패턴만 쓰면 됨.
  // [A] code를 서버로 넘겨서 최종 토큰 교환:
  if (code) {
    const res = await fetch(`${API_BASE}/oauth2/mobile/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // refresh_token 쿠키 수신
      body: JSON.stringify({ provider, code, state, redirectUri }),
    });
    if (!res.ok) throw new Error("Token exchange failed");
    const data = await res.json(); // { jwt, user, ... } 형식 가정

    const accessToken = data.accessToken ?? data.jwt ?? data.token;
    if (!accessToken) throw new Error("No access token from server");
    await AsyncStorage.setItem("accessToken", data.accessToken);

    return data;
  }

  // [B] 서버가 이미 session 또는 token을 딥링크에 실어주는 경우:
  if (session) {
    const res = await fetch(`${API_BASE}/oauth2/mobile/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 쿠키 유지
      body: JSON.stringify({ provider, session }),
    });
    if (!res.ok) throw new Error("Finalize failed");
    const data = await res.json();

    const accessToken = data.accesstoKen ?? data.jwt ?? data.token;
    if (accessToken) await AsyncStorage.setItem("accessToken", accessToken);

    return data;
  }

  if (token) {
    // 토큰이 직접 넘어오는 경우 바로 사용
    await AsyncStorage.setItem("accessToken", token);
    return { jwt: token };
  }

  throw new Error("Missing code/session/token");
}

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const handle = (provider: Provider) => async () => {
    try {
      setLoadingProvider(provider);
      const result = await loginWithProvider(provider);
      // TODO: result.jwt 등을 SecureStore/AsyncStorage에 저장하고 내 앱 세션 처리
      Alert.alert("로그인 완료", `${provider} 로그인 성공`);
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
