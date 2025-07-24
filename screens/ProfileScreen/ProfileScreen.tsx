import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState("user@example.com"); // 실제 로그인 연동 필요
  const [departureAirport, setDepartureAirport] = useState("");
  const [savedAirport, setSavedAirport] = useState("");

  const handleSaveAirport = () => {
    if (!departureAirport.trim()) return;
    setSavedAirport(departureAirport);
    Alert.alert("저장됨", `출발공항이 '${departureAirport}'로 설정되었습니다.`);
    setDepartureAirport("");
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "로그아웃 되었습니다."); // 실제 로그아웃 로직 연결 필요
  };

  const handleDeleteAccount = () => {
    Alert.alert("계정 탈퇴", "정말로 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: () => {
          // 실제 탈퇴 처리 로직
          Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.");
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>프로필</Text>

      {/* 이메일 표시 */}
      <View style={styles.section}>
        <Text style={styles.label}>이메일</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      {/* 출발공항 설정 */}
      <View style={styles.section}>
        <Text style={styles.label}>기본 출발공항</Text>
        <TextInput
          style={styles.input}
          placeholder="예: 인천국제공항(ICN)"
          value={departureAirport}
          onChangeText={setDepartureAirport}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAirport}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
        {savedAirport ? (
          <Text style={styles.savedText}>설정됨: {savedAirport}</Text>
        ) : null}
      </View>

      {/* 로그아웃 / 탈퇴 */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.actionText}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAccount}>
          <Text style={[styles.actionText, { color: "red" }]}>계정 탈퇴</Text>
        </TouchableOpacity>
      </View>
{/* // 로그인 넘어갈려고 만든거 임시 */}
      <View>
        <Button
          title="로그인 화면으로 이동"
          onPress={() => navigation.navigate("LoginScreen")}
        /> 
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: "#0be5ecd7",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  savedText: {
    marginTop: 8,
    color: "#666",
  },
  actions: {
    marginTop: "auto",
  },
  actionText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 12,
  },
});
