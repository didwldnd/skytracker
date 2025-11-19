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
import * as SecureStore from "expo-secure-store";
import WebView from "react-native-webview"; // ✅ 새로 추가
import { API_BASE } from "../../config/env";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

async function handleLoginSuccess(accessToken: string) {
  console.log("🔥 [handleLoginSuccess] accessToken:", accessToken);

  if (!accessToken) {
    throw new Error("accessToken이 없습니다.");
  }

  // 1️⃣ accessToken 먼저 저장
  await SecureStore.setItemAsync("accessToken", String(accessToken));
  console.log("💾 accessToken SecureStore 저장 완료");

  // 2️⃣ 방금 받은 accessToken으로 refreshToken 발급 요청
  try {
    const res = await fetch(`${API_BASE}/new-refresh-token`, {
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

    // 확인용 (원하면 삭제)
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
  return `${baseAPI}/oauth2/authorization/${provider}`;
}

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [currentProvider, setCurrentProvider] = useState<Provider | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(false);

  const isDisabled = loadingProvider !== null;

  const openWebView = (provider: Provider) => {
    setLoadingProvider(provider);
    setCurrentProvider(provider);
    setWebViewVisible(true);
  };

  const closeWebView = () => {
    setWebViewVisible(false);
    setCurrentProvider(null);
    setLoadingProvider(null);
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleWebViewMessage = async (event: any) => {
    const raw = event.nativeEvent.data;
    console.log("🌐 WebView로부터 받은 데이터:", raw);

    try {
      const data = JSON.parse(raw); // 최종 JSON 페이지라고 가정
      if (!data.accessToken) {
        console.log("⚠️ accessToken 없는 데이터, 무시:", data);
        return;
      }

      await handleLoginSuccess(data.accessToken);
      Alert.alert("로그인 완료", "로그인 성공", [
        {
          text: "확인",
          onPress: () => {
            closeWebView();

            navigation.reset({
              index: 0,
                routes: [{ name: "HomeScreen" as keyof RootStackParamList }],

            });
          },
        },
      ]);

      closeWebView();
    } catch (e) {
      // 중간 카카오/구글 HTML 페이지들도 여기로 들어오지만 JSON.parse 실패 → 무시
      console.log("JSON 파싱 실패 (중간 페이지일 가능성):", e);
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
        onPress={() => openWebView("google")}
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
        onPress={() => openWebView("kakao")}
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
        onPress={() => openWebView("naver")}
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

      <Text style={styles.footer}>
        로그인하면 SkyTracker의 <Text style={styles.link}>서비스 약관</Text>과{" "}
        <Text style={styles.link}>개인정보 처리방침</Text>에 동의하게 됩니다.
      </Text>

      {/* ✅ WebView 오버레이 */}
      {webViewVisible && currentProvider && (
        <View style={styles.webviewOverlay}>
          {/* 상단 닫기 버튼 */}
          <View style={styles.webviewHeader}>
            <TouchableOpacity onPress={closeWebView} style={styles.closeButton}>
              <Text style={{ color: "#fff", fontSize: 16 }}>닫기</Text>
            </TouchableOpacity>
            <Text style={styles.webviewTitle}>
              {currentProvider.toUpperCase()} 로그인
            </Text>
            <View style={{ width: 60 }} />
          </View>

          {webViewLoading && (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" />
            </View>
          )}

          <WebView
            style={{ flex: 1 }}
            source={{ uri: buildAuthorizeUrl(currentProvider) }}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onMessage={handleWebViewMessage}
            injectedJavaScript={`
              (function() {
                function trySend() {
                  try {
                    var text = document.body && document.body.innerText;
                    if (!text) return;
                    // 최종 JSON 페이지일 경우에만 보내기 시도
                    try {
                      var obj = JSON.parse(text);
                      if (obj && obj.accessToken) {
                        window.ReactNativeWebView.postMessage(JSON.stringify(obj));
                      }
                    } catch (e) {
                      // JSON 아니면 무시
                    }
                  } catch (e) {}
                }
                // 페이지 렌더링 후 한 번 시도
                setTimeout(trySend, 500);
              })();
              true;
            `}
          />
        </View>
      )}
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

  // ✅ WebView 오버레이 스타일
  webviewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000aa",
  },
  webviewHeader: {
    height: 56,
    backgroundColor: "#0be5ecd7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  webviewTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  webviewLoading: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
