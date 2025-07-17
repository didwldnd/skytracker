import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

// const handleKakaoLogin () => {

// }

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SkyTracker</Text>

      <Image source={require("../assets/main.png")} style={styles.mainImage} /> 

      <TouchableOpacity style={[styles.button, styles.google]}>
        <Image source={require("../assets/google.png")} style={styles.icon} />
        <Text style={styles.buttonText}>Google로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.kakao]}>
        <Image source={require("../assets/kakao.png")} style={styles.icon} />
        <Text style={styles.buttonText}>카카오로 로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.naver]}>
        <Image source={require("../assets/naver.png")} style={styles.icon} />
        <Text style={styles.buttonText}>네이버로 로그인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  mainImage: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  google: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  kakao: {
    backgroundColor: "#FEE500",
  },
  naver: {
    backgroundColor: "#03C75A",
  },
});
