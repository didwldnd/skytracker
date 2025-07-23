import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // 색이쁘게

export default function LoginScreen() {
  const [loadingProvider, setLoadingProvider] = useState<
    null | "google" | "kakao" | "naver"
  >(null);

  const handleLogin = (provider: "google" | "kakao" | "naver") => {
    setLoadingProvider(provider);
    // 여기에 실제 로그인 API 호출
    setTimeout(() => {
      setLoadingProvider(null); // 테스트용 2초 후 초기화
    }, 2000);
  };

  // 버튼 공통 비활성화 여부
  const isDisabled = loadingProvider !== null;

  return (
    <LinearGradient
      colors={["#FFA726", "#FB8C00"]} 
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconCircle}>
        <FontAwesome name="plane" size={28} color="#FF6F00" />
      </View>

      <Text style={styles.title}>SkyTracker</Text>
      <Text style={styles.subtitle}>하늘을 향한 여정의 시작</Text>
      <Text style={styles.subsubtitle}>최고의 항공편을 찾아 떠나세요</Text>

      {/* 구글 로그인 */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.google,
          isDisabled && loadingProvider !== "google" && styles.disabledButton,
        ]}
        onPress={() => handleLogin("google")}
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

      {/* 카카오 로그인 */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.kakao,
          isDisabled && loadingProvider !== "kakao" && styles.disabledButton,
        ]}
        onPress={() => handleLogin("kakao")}
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

      {/* 네이버 로그인 */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.naver,
          isDisabled && loadingProvider !== "naver" && styles.disabledButton,
        ]}
        onPress={() => handleLogin("naver")}
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FF6F00",
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
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 4,
  },
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
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  google: {
    backgroundColor: "#fff",
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  naver: {
    backgroundColor: "#03C75A",
  },
  footer: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginTop: 24,
    opacity: 0.8,
  },
  link: {
    textDecorationLine: "underline",
  },
});
