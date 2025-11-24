// screens/LoginScreen.tsx
import React, { useState, useContext } from "react";
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
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import { API_BASE } from "../../config/env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { AuthContext } from "../../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

// refreshToken까지 처리하는 공통 함수
async function handleLoginSuccess(accessToken: string) {
  console.log("refresh URL:", `${API_BASE}/api/user/new-refresh-token`);
  console.log("🔥 [handleLoginSuccess] accessToken:", accessToken);

  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }

  // 1️⃣ accessToken 먼저 저장
  await SecureStore.setItemAsync("accessToken", String(accessToken));
  console.log("💾 accessToken SecureStore 저장 완료");

  // 2️⃣ 방금 받은 accessToken으로 refreshToken 발급 요청
  try {
    const res = await fetch(`${API_BASE}/api/user/new-refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`refreshToken 발급 실패: ${res.status}`);
    }

    const json = await res.json(); // {"refreshToken": "..."}
    const refreshToken = json.refreshToken;
    console.log("👉 서버에서 받은 refreshToken:", refreshToken);

    if (refreshToken) {
      await SecureStore.setItemAsync("refreshToken", String(refreshToken));
      console.log("💾 refreshToken SecureStore 저장 완료");
    } else {
      console.log("⚠️ refreshToken이 응답에 없습니다.");
    }

    // 확인용 (테스트 후 지워도 됨)
    const savedAccess = await SecureStore.getItemAsync("accessToken");
    const savedRefresh = await SecureStore.getItemAsync("refreshToken");
    console.log("🔍 최종 저장된 accessToken:", savedAccess);
    console.log("🔍 최종 저장된 refreshToken:", savedRefresh);
  } catch (e) {
    console.log("❌ /new-refresh-token 호출 중 에러:", e);
    // 그래도 accessToken은 있으니까 최소 동작은 가능
  }
}

type Provider = "google" | "kakao" | "naver";

const baseAPI = API_BASE;

/** 인가 시작 URL (백엔드 라우트 기준) */
function buildAuthorizeUrl(provider: Provider) {
  const encodedRedirect = encodeURIComponent(redirectUri);

  return `${baseAPI}/oauth2/authorization/${provider}?redirect_uri=${encodedRedirect}`;
}

/** 앱이 받는 리디렉션 URI: skytracker://redirect */
const redirectUri = AuthSession.makeRedirectUri({
  path: "redirect",
});

type ParsedParams = {
  accessToken: string | null;
  error: string | null;
};

function parseParams(url: string): ParsedParams {
  const parsed = (Linking.parse(url) as any) || {};
  const qp = parsed.queryParams || {};

  const accessToken = (qp.accessToken as string) ?? null;

  return {
    accessToken,
    error: (qp.error as string) ?? null,
  };
}

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const auth = useContext(AuthContext);

  const isDisabled = loadingProvider !== null;

  const handleProvider = (provider: Provider) => async () => {
    try {
      console.log(`🚀 [handleProvider] ${provider} 로그인 시작`);

      setLoadingProvider(provider);

      const authorizeUrl = buildAuthorizeUrl(provider);
      console.log("🔗 authorizeUrl:", authorizeUrl);
      console.log("🔁 redirectUri:", redirectUri);

      const result = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        redirectUri
      );

      console.log(`📥 [${provider}] AuthSession result:`, result);

      if (result.type !== "success") {
        console.log(`⚠️ [${provider}] AuthSession type:`, result.type);
        // 사용자가 취소하거나 에러 난 경우
        return;
      }

      if (!result.url) {
        throw new Error("리디렉션 URL이 없습니다.");
      }

      const { accessToken, error } = parseParams(result.url);
      console.log(`🔍 [${provider}] 파싱 결과:`, { accessToken, error });

      if (error) {
        throw new Error(String(error));
      }

      if (!accessToken) {
        throw new Error("accessToken을 리디렉션에서 찾을 수 없습니다.");
      }

      // 🔥 토큰 저장 + refreshToken 발급
      await handleLoginSuccess(accessToken);
      console.log(`✅ [${provider}] handleLoginSuccess 완료`);

      await auth?.login(accessToken);

      Alert.alert("로그인 완료", "로그인 성공", [
        {
          text: "확인",
          onPress: () => {
            console.log("🏠 HomeScreen으로 이동");
            navigation.reset({
              index: 0,
              routes: [{ name: "HomeScreen" as keyof RootStackParamList }],
            });
          },
        },
      ]);
    } catch (e: any) {
      console.log(`❌ [${provider}] 로그인 중 오류:`, e);
      Alert.alert(
        `${provider} 로그인 오류`,
        e?.message ?? "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoadingProvider(null);
    }
  };

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
        onPress={handleProvider("google")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "google" ? (
          <>
            <ActivityIndicator
              size="small"
              color="#444"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>로그인 중...</Text>
          </>
        ) : (
          <>
            <Image
              source={require("../../assets/google.png")}
              style={styles.icon}
            />
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
        onPress={handleProvider("kakao")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "kakao" ? (
          <>
            <ActivityIndicator
              size="small"
              color="#000"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>로그인 중...</Text>
          </>
        ) : (
          <>
            <Image
              source={require("../../assets/kakao.png")}
              style={styles.icon}
            />
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
        onPress={handleProvider("naver")}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loadingProvider === "naver" ? (
          <>
            <ActivityIndicator
              size="small"
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              로그인 중...
            </Text>
          </>
        ) : (
          <>
            <Image
              source={require("../../assets/naver.png")}
              style={styles.icon}
            />
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              네이버로 계속하기
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Guest Login */}
      <TouchableOpacity
        style={[styles.button, styles.guest]}
        onPress={() => navigation.navigate("HomeScreen")}
        activeOpacity={0.7}
      >
        <Text>비회원으로 계속하기</Text>
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
  guest: {
    backgroundColor: "#b7a1f1c2",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
