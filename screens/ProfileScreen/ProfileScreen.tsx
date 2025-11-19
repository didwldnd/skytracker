import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  Switch,
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
import * as SecureStore from "expo-secure-store";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "../../utils/tokenStorage";
import { logout } from "../../api/auth";
import { deleteAccount } from "../../api/user";
import { fetchProfile } from "../../api/user";

const themeColor = "white";
const HEADER_BG = "#0be5ecd7";

// ------------------ Reusable Pretty Info Sheet ------------------
function InfoSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.sheetBackdropTouch} onPress={onClose} />
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.sheetSubtitle}>{subtitle}</Text>}
          </View>

          <ScrollView
            style={{ maxHeight: 520 }}
            contentContainerStyle={{ padding: 16 }}
          >
            {children}
            <View style={{ height: 16 }} />
          </ScrollView>

          <Pressable style={styles.sheetCloseBtn} onPress={onClose}>
            <Text style={{ color: "white", fontWeight: "600" }}>확인</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ------------------ Small UI atoms ------------------
const Tag = ({
  label,
  selected = false,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
}) => (
  <View
    style={[
      styles.tag,
      selected && { backgroundColor: HEADER_BG + "22", borderColor: HEADER_BG },
      disabled && { opacity: 0.5 },
    ]}
  >
    <Text style={[styles.tagText, selected && { color: "#0b7285" }]}>
      {label}
    </Text>
  </View>
);

const PlaceholderRow = ({
  left,
  right,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
}) => (
  <View style={styles.placeholderRow}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {left}
    </View>
    {right}
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ------------------ Main Screen ------------------
const ProfileScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { favorites } = useFavorite(); // 필요시 사용
  const { preferredDepartureAirport, setPreferredDepartureAirport, loading } =
    useUserSettings();

  // ✅ 백엔드 유저 정보 상태
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ 프로필 조회
useEffect(() => {
  const loadProfile = async () => {
    try {
      const profile = await fetchProfile();
      console.log("🔥 profile from backend:", profile); // 👈 추가

      if (profile) {
        setUser({
          username: profile.username,
          email: profile.email,
        });
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("프로필 조회 에러:", e);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  loadProfile();
}, []);


  const handleLogoutPress = async () => {
    try {
      await logout(); // 🔥 서버 + 로컬 모두 처리

      navigation.reset({
        index: 0,
        routes: [{ name: "LoginScreen" }],
      });
    } catch (e) {
      console.error("로그아웃 에러:", e);
    }
  };

  // SearchModal 제어
  const [pickerOpen, setPickerOpen] = useState(false);
  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const handleSelectAirport = async (code: string) => {
    await setPreferredDepartureAirport(code); // 컨텍스트 + AsyncStorage 저장
    closePicker();
  };

  // Pretty placeholder sheet state
  type SheetKind =
    | "알림 설정"
    | "언어 및 통화"
    | "예약 내역"
    | "자주 묻는 질문"
    | "고객센터 문의"
    | "앱 설정"
    | null;
  const [sheet, setSheet] = useState<SheetKind>(null);

  const openSheet = (kind: Exclude<SheetKind, null>) => setSheet(kind);
  const closeSheet = () => setSheet(null);

  const airportLabel = useMemo(() => {
    if (!preferredDepartureAirport) return "미설정";
    const found = airportData.find((a) => a.code === preferredDepartureAirport);
    return found ? `${found.city} (${found.code})` : preferredDepartureAirport;
  }, [preferredDepartureAirport]);

  const handleGoLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>프로필</Text>

      {/* 프로필 헤더 */}
      <View style={styles.profileHeader}>
        {userLoading ? (
          <Text style={styles.loginRequiredText}>로딩 중...</Text>
        ) : user ? (
          // ✅ 로그인 된 상태
          <View style={styles.profileRow}>
            <Avatar.Text
              size={80}
              label={user?.username?.charAt(0) ?? "?"}
              style={styles.avatar}
              labelStyle={{ fontSize: 32 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>

              {/* 나의 출발 공항 행 */}
              <View style={styles.infoRow}>
                <Feather name="send" size={14} color="black" />
                <Text style={styles.infoText}>
                  나의 출발 공항: {loading ? "로딩중..." : airportLabel}
                </Text>
                <TouchableOpacity onPress={openPicker} style={styles.miniBtn}>
                  <Text style={{ fontSize: 12 }}>변경</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          // ❌ 로그아웃 상태
          <TouchableOpacity
            style={styles.loginRequiredBox}
            onPress={handleGoLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginRequiredText}>
              로그인이 필요한 서비스입니다
            </Text>
            <Text style={styles.loginRequiredSub}>
              로그인하고 나의 출발 공항, 즐겨찾기 등을 관리해 보세요.
            </Text>
          </TouchableOpacity>
        )}
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
                  openSheet(item.label as Exclude<SheetKind, null>);
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

      {/* 로그아웃 / 탈퇴 → 로그인 상태에서만 표시 */}
      {user && (
        <View style={styles.logoutRow}>
          <TouchableOpacity onPress={handleLogoutPress}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("계정 탈퇴", "정말로 탈퇴하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴",
                  style: "destructive",
                  onPress: () =>
                    Alert.alert("탈퇴 완료", "계정이 삭제되었습니다."),
                },
              ])
            }
          >
            <Text style={[styles.logoutText, { color: "red" }]}>계정 탈퇴</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ SearchModal 재사용 */}
      <SearchModal
        visible={pickerOpen}
        onClose={closePicker}
        onSelect={handleSelectAirport}
        data={airportData}
        fieldLabel="출발지"
      />

      {/* ✅ Pretty placeholder sheets (view-only) */}
      <InfoSheet
        visible={sheet === "알림 설정"}
        onClose={closeSheet}
        title="알림 설정"
        subtitle=""
      >
        <PlaceholderRow
          left={
            <>
              <Feather name="bell" size={16} />
              <Text>가격 알림 받기</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="tag" size={16} />
              <Text>특가/쿠폰 알림</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="airplay" size={16} />
              <Text>좌석 알림</Text>
            </>
          }
          right={<Switch value={false} disabled />}
        />
        <Divider />
        <Text style={styles.caption}>※ 실제 기능은 곧 제공 예정입니다.</Text>
      </InfoSheet>

      <InfoSheet
        visible={sheet === "언어 및 통화"}
        onClose={closeSheet}
        title="언어 및 통화"
        subtitle=""
      >
        <Text style={styles.subhead}>언어</Text>
        <View style={styles.rowWrap}>
          <Tag label="한국어" selected />
          <Tag label="English" />
          <Tag label="日本語" />
          <Tag label="中文" />
        </View>
        <Divider />
        <Text style={styles.subhead}>통화</Text>
        <View style={styles.rowWrap}>
          <Tag label="KRW ₩" selected />
          <Tag label="USD $" />
          <Tag label="JPY ¥" />
          <Tag label="EUR €" />
        </View>
        <Divider />
        <Text style={styles.caption}>
          ※ 선택해도 저장되지 않습니다 (UI 프리뷰).
        </Text>
      </InfoSheet>

      <InfoSheet
        visible={sheet === "예약 내역"}
        onClose={closeSheet}
        title="예약 내역"
        subtitle="아직 예약이 없어요"
      >
        {[1, 2].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skelRow}>
              <View style={styles.skelBadge} />
              <View style={{ flex: 1 }}>
                <View style={styles.skelLineWide} />
                <View style={styles.skelLine} />
              </View>
            </View>
            <View style={[styles.skelLine, { marginTop: 10, width: "40%" }]} />
          </View>
        ))}
        <Text style={[styles.caption, { marginTop: 8 }]}>
          실제 예약이 생성되면 여기에 표시됩니다.
        </Text>
      </InfoSheet>

      <InfoSheet
        visible={sheet === "자주 묻는 질문"}
        onClose={closeSheet}
        title="자주 묻는 질문"
        subtitle="탭하여 펼쳐보기"
      >
        <FAQ />
      </InfoSheet>

      <InfoSheet
        visible={sheet === "고객센터 문의"}
        onClose={closeSheet}
        title="고객센터 문의"
        subtitle="운영시간: 09:00 ~ 18:00 (KST)"
      >
        <View style={styles.contactCard}>
          <Feather name="mail" size={18} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600" }}>이메일</Text>
            <Text style={styles.caption}>skytrackerofficial@gmail.com</Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>보내기</Text>
          </View>
        </View>
        <View style={styles.contactCard}>
          <Feather name="phone" size={18} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600" }}>전화</Text>
            <Text style={styles.caption}>02-551-3122</Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>전화하기</Text>
          </View>
        </View>
        <View style={styles.contactCard}>
          <Feather name="message-circle" size={18} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600" }}>카카오톡</Text>
            <Text style={styles.caption}>@SKYTRACKER</Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>열기</Text>
          </View>
        </View>
        <Text style={[styles.caption, { marginTop: 8 }]}>
          ※ 버튼은 예시용으로만 표시됩니다.
        </Text>
      </InfoSheet>

      <InfoSheet
        visible={sheet === "앱 설정"}
        onClose={closeSheet}
        title="앱 설정"
        subtitle=""
      >
        <PlaceholderRow
          left={
            <>
              <Feather name="moon" size={16} />
              <Text>다크 모드</Text>
            </>
          }
          right={<Switch value={false} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="lock" size={16} />
              <Text>생체인증 잠금</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="wifi" size={16} />
              <Text>Wi-Fi에서만 이미지 로드</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <Divider />
        <Text style={styles.caption}>※ 실제 동작하지 않는 미리보기입니다.</Text>
      </InfoSheet>
    </ScrollView>
  );
};

// ------------------ FAQ component (accordion) ------------------
const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    {
      q: "가격 알림은 어떻게 동작하나요?",
      a: "원하는 노선의 가격 변동을 추적해 알려드립니다. (데모 화면)",
    },
    {
      q: "예약은 어디서 확인하나요?",
      a: "프로필 > 예약 내역에서 확인할 수 있어요. (데모 화면)",
    },
    {
      q: "지원되는 결제 수단은?",
      a: "국내 주요 카드와 간편결제를 지원할 예정입니다.",
    },
  ];

  return (
    <View style={{ gap: 8 }}>
      {items.map((it, idx) => {
        const opened = open === idx;
        return (
          <View key={idx} style={styles.faqItem}>
            <TouchableOpacity
              style={styles.faqHeader}
              onPress={() => setOpen(opened ? null : idx)}
            >
              <Text style={{ fontWeight: "600" }}>{it.q}</Text>
              <Feather
                name={opened ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </TouchableOpacity>
            {opened && <Text style={styles.faqBody}>{it.a}</Text>}
          </View>
        );
      })}
    </View>
  );
};

// ------------------ Styles ------------------
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

  // ✅ 로그아웃 상태 문구용
  loginRequiredBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loginRequiredText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  loginRequiredSub: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },

  sheetBackdropTouch: {
    flex: 1,
  },

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
    backgroundColor: HEADER_BG,
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

  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  sheetHeader: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold" },
  sheetSubtitle: { fontSize: 12, color: "#64748b", marginTop: 4 },
  sheetCloseBtn: {
    margin: 16,
    backgroundColor: "#0be5ecd7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  // Atoms
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 9999,
  },
  tagText: { fontSize: 13, color: "#334155" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 16 },
  miniBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
  },

  // Placeholder list rows
  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  caption: { color: "#64748b", fontSize: 12 },
  subhead: { fontSize: 14, fontWeight: "600", marginBottom: 8 },

  // Skeletons
  skeletonCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  skelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  skelBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
  },
  skelLine: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    width: "60%",
    marginTop: 6,
  },
  skelLineWide: {
    height: 12,
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    width: "80%",
    marginBottom: 6,
  },

  // FAQ
  faqItem: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  faqBody: { paddingHorizontal: 12, paddingBottom: 12, color: "#334155" },

  // Contact
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 10,
  },
  disabledBtn: {
    backgroundColor: "#94a3b8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledBtnText: { color: "white", fontWeight: "600" },
});

export default ProfileScreen;
