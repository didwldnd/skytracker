import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Avatar } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { useFavorite } from "../../context/FavoriteContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useUserSettings } from "../../context/UserSettingsContext";
import SearchModal from "../../components/SearchModal";
import { airportData } from "../../data/airportData";

const themeColor = "white";

const ProfileScreen = () => {
  const user = {
    name: "양지웅",
    email: "wldnd4949@naver.com",
    profileImage: "",
  };

  const { favorites } = useFavorite(); // 필요시 사용
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {
    preferredDepartureAirport,
    setPreferredDepartureAirport,
    loading,
  } = useUserSettings();

  const handleLogout = () => Alert.alert("로그아웃", "로그아웃 되었습니다.");
  const handleDeleteAccount = () =>
    Alert.alert("계정 탈퇴", "정말로 탈퇴하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "탈퇴",
        style: "destructive",
        onPress: () => Alert.alert("탈퇴 완료", "계정이 삭제되었습니다."),
      },
    ]);

  // 🔽 SearchModal 제어
  const [pickerOpen, setPickerOpen] = useState(false);
  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const handleSelectAirport = async (code: string) => {
    await setPreferredDepartureAirport(code); // 컨텍스트 + AsyncStorage 저장
    closePicker();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>프로필</Text>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        <View style={styles.profileRow}>
          <Avatar.Text
            size={80}
            label={user.name.charAt(0)}
            style={styles.avatar}
            labelStyle={{ fontSize: 32 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>

            {/* 나의 출발 공항 행 */}
            <View style={styles.infoRow}>
              <Feather name="send" size={14} color="black" />
              <Text style={styles.infoText}>
                나의 출발 공항:{" "}
                {loading ? "로딩중..." : preferredDepartureAirport ?? "미설정"}
              </Text>
              <TouchableOpacity
                onPress={openPicker}
                style={{
                  marginLeft: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                  borderRadius: 6,
                }}
              >
                <Text style={{ fontSize: 12 }}>변경</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* 메뉴 섹션 */}
      {[
        {
          title: "내 정보 관리",
          icon: <Feather name="user" size={18} color={themeColor} />,
          items: [
            { label: "알림 설정", icon: "bell" },
            { label: "언어 및 통화", icon: "globe" },
          ],
        },
        {
          title: "여행 관리",
          icon: <Feather name="map-pin" size={18} color={themeColor} />,
          items: [
            { label: "즐겨찾기", icon: "heart" },
            { label: "예약 내역", icon: "calendar" },
          ],
        },
        {
          title: "고객 지원",
          icon: <Feather name="help-circle" size={18} color={themeColor} />,
          items: [
            { label: "자주 묻는 질문", icon: "help-circle" },
            { label: "고객센터 문의", icon: "phone" },
            { label: "앱 설정", icon: "settings" },
          ],
        },
      ].map((section, idx) => (
        <View key={idx} style={styles.sectionBox}>
          <View style={styles.sectionTitleRow}>
            {section.icon}
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.sectionItem}
              onPress={() => {
                if (item.label === "즐겨찾기") {
                  navigation.navigate("FavoriteList");
                } else {
                  Alert.alert(item.label);
                }
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather name={item.icon as any} size={16} color="black" />
                <Text style={styles.sectionLabel}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="gray" />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* 로그아웃 / 탈퇴 */}
      <View style={styles.logoutRow}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAccount}>
          <Text style={[styles.logoutText, { color: "red" }]}>계정 탈퇴</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ SearchModal 재사용 */}
      <SearchModal
        visible={pickerOpen}
        onClose={closePicker}
        onSelect={handleSelectAirport} // (code: string)
        data={airportData}
        fieldLabel="출발지"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 16 },
  profileHeader: {
    backgroundColor: themeColor,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { backgroundColor: "white", borderColor: themeColor, borderWidth: 2 },
  name: { color: "black", fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  email: { color: "black", marginBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  infoText: { color: "black", fontSize: 12 },
  sectionBox: {
    borderWidth: 1,
    borderColor: "#bae6fd",
    borderRadius: 10,
    marginBottom: 16,
    backgroundColor: "white",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#0be5ecd7",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "white" },
  sectionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionLabel: { fontSize: 14, color: "#1e293b" },
  logoutRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingBottom: 40,
  },
  logoutText: { fontSize: 14, color: "gray" },
  title: { fontSize: 24, fontWeight: "bold", marginLeft: 4 },
});

export default ProfileScreen;
