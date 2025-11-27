import React, { useMemo, useState, useEffect, useContext } from "react";
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
  TextInput,
} from "react-native";
import { Avatar } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useUserSettings } from "../../context/UserSettingsContext";
import SearchModal from "../../components/SearchModal";
import { airportData } from "../../data/airportData";
import { logout } from "../../api/auth";
import { deleteAccount, fetchProfile, updateUser } from "../../api/user";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const HEADER_BG = "#6ea1d4";

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
  const { theme } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.sheetBackdropTouch} onPress={onClose} />
        <View style={[styles.sheetCard, { backgroundColor: theme.card }]}>
          <View
            style={[
              styles.sheetHeader,
              { backgroundColor: theme.muted, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.sheetTitle, { color: theme.text }]}>
              {title}
            </Text>
            {!!subtitle && (
              <Text style={[styles.sheetSubtitle, { color: theme.subText }]}>
                {subtitle}
              </Text>
            )}
          </View>

          <ScrollView
            style={{ maxHeight: 520 }}
            contentContainerStyle={{ padding: 16 }}
          >
            {children}
            <View style={{ height: 16 }} />
          </ScrollView>

          <Pressable
            style={[styles.sheetCloseBtn, { backgroundColor: HEADER_BG }]}
            onPress={onClose}
          >
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
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.tag,
        { borderColor: theme.border },
        selected && {
          backgroundColor: HEADER_BG + "22",
          borderColor: HEADER_BG,
        },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={[
          styles.tagText,
          { color: theme.text },
          selected && { color: HEADER_BG },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

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

const Divider = () => {
  const { theme } = useTheme();
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
};

// ------------------ Main Screen ------------------
const ProfileScreen = () => {
  const auth = useContext(AuthContext);
  const { theme, resolvedMode, setThemePreference } = useTheme();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { preferredDepartureAirport, setPreferredDepartureAirport, loading } =
    useUserSettings();

  // ✅ 백엔드 유저 정보 상태
  const [user, setUser] = useState<{
    username: string;
    email: string;
  } | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // ✅ 내 정보 수정 모달용 상태
  const [editVisible, setEditVisible] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ 프로필 조회
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        console.log("🔥 profile from backend:", profile);

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

  // 로그아웃 실행 함수
  const handleConfirmLogout = async () => {
    try {
      await logout();

      if (auth) {
        await auth.logout();
      }
      setUser(null);

      Alert.alert("로그아웃", "정상적으로 로그아웃되었습니다.");
    } catch (e) {
      console.error("로그아웃 에러:", e);
      Alert.alert("에러", "로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogoutPress = () => {
    Alert.alert("로그아웃", "정말 로그아웃하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: handleConfirmLogout,
      },
    ]);
  };

  // SearchModal 제어
  const [pickerOpen, setPickerOpen] = useState(false);
  const openPicker = () => setPickerOpen(true);
  const closePicker = () => setPickerOpen(false);

  const handleSelectAirport = async (code: string) => {
    await setPreferredDepartureAirport(code);
    closePicker();
  };

  // Pretty placeholder sheet state
  type SheetKind =
    | "즐겨찾기"
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

  const openEditModal = () => {
    if (!user) {
      Alert.alert("알림", "로그인이 필요합니다.");
      return;
    }
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editUsername.trim()) {
      Alert.alert("알림", "이름을 입력해주세요.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateUser({
        username: editUsername.trim(),
        email: editEmail,
      });

      setUser({
        username: updated.username,
        email: updated.email,
      });

      Alert.alert("완료", "내 정보가 수정되었습니다.");
      setEditVisible(false);
    } catch (e) {
      console.error("내 정보 수정 에러:", e);
      Alert.alert("에러", "정보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Text style={[styles.title, { color: theme.text }]}>프로필</Text>

      {/* 프로필 헤더 */}
      <View style={[styles.profileHeader, { backgroundColor: theme.card }]}>
        {userLoading ? (
          <Text style={[styles.loginRequiredText, { color: theme.text }]}>
            로딩 중...
          </Text>
        ) : user ? (
          <View style={styles.profileRow}>
            <Avatar.Text
              size={80}
              label={user?.username?.charAt(0) ?? "?"}
              style={{
                backgroundColor: HEADER_BG,
                borderColor: theme.background,
                borderWidth: 2,
              }}
              labelStyle={{ fontSize: 32, color: "white" }}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>
                {user.username}
              </Text>
              <Text style={[styles.email, { color: theme.subText }]}>
                {user.email}
              </Text>

              <View style={styles.infoRow}>
                <Feather name="send" size={14} color={theme.subText} />
                <Text style={[styles.infoText, { color: theme.subText }]}>
                  나의 출발 공항: {loading ? "로딩중..." : airportLabel}
                </Text>
                <TouchableOpacity
                  onPress={openPicker}
                  style={[styles.miniBtn, { borderColor: theme.border }]}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.text,
                    }}
                  >
                    변경
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loginRequiredBox}
            onPress={handleGoLogin}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginRequiredText, { color: theme.text }]}>
              로그인이 필요한 서비스입니다
            </Text>
            <Text style={[styles.loginRequiredSub, { color: theme.subText }]}>
              로그인하고 회원 전용 서비스를 경험 해보세요.
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 메뉴 섹션 */}
      {[
        {
          title: "내 정보 관리",
          icon: <Feather name="user" size={18} color="white" />,
          items: [
            { label: "알림 설정", icon: "bell" },
            { label: "언어 및 통화", icon: "globe" },
            { label: "내 정보 수정", icon: "key" },
          ],
        },
        {
          title: "여행 관리",
          icon: <Feather name="map-pin" size={18} color="white" />,
          items: [
            { label: "즐겨찾기", icon: "heart" },
            { label: "예약 내역", icon: "calendar" },
          ],
        },
        {
          title: "고객 지원",
          icon: <Feather name="help-circle" size={18} color="white" />,
          items: [
            { label: "자주 묻는 질문", icon: "help-circle" },
            { label: "고객센터 문의", icon: "phone" },
            { label: "앱 설정", icon: "settings" },
          ],
        },
      ].map((section, idx) => (
        <View
          key={idx}
          style={[
            styles.sectionBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[styles.sectionTitleRow, { backgroundColor: HEADER_BG }]}
          >
            {section.icon}
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
          {section.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.sectionItem, { borderColor: theme.border }]}
              onPress={() => {
                if (item.label === "내 정보 수정") {
                  openEditModal();
                } else {
                  openSheet(item.label as Exclude<SheetKind, null>);
                }
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Feather name={item.icon as any} size={16} color={theme.text} />
                <Text style={[styles.sectionLabel, { color: theme.text }]}>
                  {item.label}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* 로그아웃 / 탈퇴 */}
      {user && (
        <View style={styles.logoutRow}>
          <TouchableOpacity onPress={handleLogoutPress}>
            <Text style={[styles.logoutText, { color: theme.subText }]}>
              로그아웃
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("계정 탈퇴", "정말로 탈퇴하시겠습니까?", [
                { text: "취소", style: "cancel" },
                {
                  text: "탈퇴",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      if (auth) {
                        await auth.logout?.();
                      }
                      setUser(null);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: "HomeScreen" }],
                      });
                      Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.");
                    } catch (e) {
                      console.error("계정 삭제 에러:", e);
                      Alert.alert(
                        "에러",
                        (e as any)?.message ??
                          "계정 삭제에 실패했습니다. 다시 시도해주세요."
                      );
                    }
                  },
                },
              ])
            }
          >
            <Text style={[styles.logoutText, { color: "red" }]}>계정 탈퇴</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SearchModal */}
      <SearchModal
        visible={pickerOpen}
        onClose={closePicker}
        onSelect={handleSelectAirport}
        data={airportData}
        fieldLabel="출발지"
      />

      {/* 즐겨찾기 안내 시트 */}
      <InfoSheet
        visible={sheet === "즐겨찾기"}
        onClose={closeSheet}
        title="즐겨찾기"
        subtitle="자주 조회하는 항공편을 한 곳에 모아볼 수 있어요."
      >
        <Text style={[styles.subhead, { color: theme.text }]}>
          서비스 준비 중
        </Text>
        <Text style={[styles.caption, { color: theme.subText }]}>
          즐겨찾기 기능은 현재 준비 중입니다.{"\n"}곧 원하는 항공편을
          저장해두고, 가격 변동과 함께 한 번에 확인할 수 있도록 업데이트될
          예정이에요.
        </Text>
        <Divider />
        <Text style={[styles.caption, { color: theme.subText }]}>
          조금만 기다려 주시면 더 편리한 경험을 제공해 드릴게요 ✈️
        </Text>
      </InfoSheet>

      {/* 알림 설정 */}
      <InfoSheet
        visible={sheet === "알림 설정"}
        onClose={closeSheet}
        title="알림 설정"
        subtitle=""
      >
        <PlaceholderRow
          left={
            <>
              <Feather name="bell" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>가격 알림 받기</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="tag" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>특가/쿠폰 알림</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="airplay" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>좌석 알림</Text>
            </>
          }
          right={<Switch value={false} disabled />}
        />
        <Divider />
        <Text style={[styles.caption, { color: theme.subText }]}>
          ※ 실제 기능은 곧 제공 예정입니다.
        </Text>
      </InfoSheet>

      {/* 언어 및 통화 */}
      <InfoSheet
        visible={sheet === "언어 및 통화"}
        onClose={closeSheet}
        title="언어 및 통화"
        subtitle=""
      >
        <Text style={[styles.subhead, { color: theme.text }]}>언어</Text>
        <View style={styles.rowWrap}>
          <Tag label="한국어" selected />
          <Tag label="English" />
          <Tag label="日本語" />
          <Tag label="中文" />
        </View>
        <Divider />
        <Text style={[styles.subhead, { color: theme.text }]}>통화</Text>
        <View style={styles.rowWrap}>
          <Tag label="KRW ₩" selected />
          <Tag label="USD $" />
          <Tag label="JPY ¥" />
          <Tag label="EUR €" />
        </View>
        <Divider />
        <Text style={[styles.caption, { color: theme.subText }]}>
          ※ 선택해도 저장되지 않습니다 (UI 프리뷰).
        </Text>
      </InfoSheet>

      {/* 예약 내역 */}
      <InfoSheet
        visible={sheet === "예약 내역"}
        onClose={closeSheet}
        title="예약 내역"
        subtitle="아직 예약이 없어요"
      >
        {[1, 2].map((i) => (
          <View
            key={i}
            style={[
              styles.skeletonCard,
              {
                borderColor: theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            <View style={styles.skelRow}>
              <View
                style={[styles.skelBadge, { backgroundColor: theme.muted }]}
              />
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.skelLineWide,
                    { backgroundColor: theme.muted },
                  ]}
                />
                <View
                  style={[styles.skelLine, { backgroundColor: theme.muted }]}
                />
              </View>
            </View>
            <View
              style={[
                styles.skelLine,
                {
                  marginTop: 10,
                  width: "40%",
                  backgroundColor: theme.muted,
                },
              ]}
            />
          </View>
        ))}
        <Text style={[styles.caption, { marginTop: 8, color: theme.subText }]}>
          실제 예약이 생성되면 여기에 표시됩니다.
        </Text>
      </InfoSheet>

      {/* FAQ */}
      <InfoSheet
        visible={sheet === "자주 묻는 질문"}
        onClose={closeSheet}
        title="자주 묻는 질문"
        subtitle="탭하여 펼쳐보기"
      >
        <FAQ />
      </InfoSheet>

      {/* 고객센터 */}
      <InfoSheet
        visible={sheet === "고객센터 문의"}
        onClose={closeSheet}
        title="고객센터 문의"
        subtitle="운영시간: 09:00 ~ 18:00 (KST)"
      >
        <View style={[styles.contactCard, { borderColor: theme.border }]}>
          <Feather name="mail" size={18} color={theme.text} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", color: theme.text }}>이메일</Text>
            <Text style={[styles.caption, { color: theme.subText }]}>
              skytrackerofficial@gmail.com
            </Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>보내기</Text>
          </View>
        </View>
        <View style={[styles.contactCard, { borderColor: theme.border }]}>
          <Feather name="phone" size={18} color={theme.text} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", color: theme.text }}>전화</Text>
            <Text style={[styles.caption, { color: theme.subText }]}>
              02-551-3122
            </Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>전화하기</Text>
          </View>
        </View>
        <View style={[styles.contactCard, { borderColor: theme.border }]}>
          <Feather name="message-circle" size={18} color={theme.text} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "600", color: theme.text }}>
              카카오톡
            </Text>
            <Text style={[styles.caption, { color: theme.subText }]}>
              @SKYTRACKER
            </Text>
          </View>
          <View style={styles.disabledBtn}>
            <Text style={styles.disabledBtnText}>열기</Text>
          </View>
        </View>
        <Text style={[styles.caption, { marginTop: 8, color: theme.subText }]}>
          ※ 버튼은 예시용으로만 표시됩니다.
        </Text>
      </InfoSheet>

      {/* 앱 설정 (다크 모드 토글) */}
      <InfoSheet
        visible={sheet === "앱 설정"}
        onClose={closeSheet}
        title="앱 설정"
        subtitle=""
      >
        <PlaceholderRow
          left={
            <>
              <Feather name="moon" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>다크 모드</Text>
            </>
          }
          right={
            <Switch
              value={resolvedMode === "dark"}
              onValueChange={(value) =>
                setThemePreference(value ? "dark" : "light")
              }
            />
          }
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="lock" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>생체인증 잠금</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <PlaceholderRow
          left={
            <>
              <Feather name="wifi" size={16} color={theme.text} />
              <Text style={{ color: theme.text }}>Wi-Fi에서만 이미지 로드</Text>
            </>
          }
          right={<Switch value={true} disabled />}
        />
        <Divider />
        <Text style={[styles.caption, { color: theme.subText }]}>
          ※ 실제 동작하지 않는 미리보기입니다.
        </Text>
      </InfoSheet>

      {/* 내 정보 수정 모달 */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.editBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setEditVisible(false)}
          />

          <View style={[styles.editCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.editTitle, { color: theme.text }]}>
              내 정보 수정
            </Text>

            <Text style={[styles.editLabel, { color: theme.subText }]}>
              이름
            </Text>
            <TextInput
              style={[
                styles.editInput,
                {
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={editUsername}
              onChangeText={setEditUsername}
              placeholder="이름을 입력하세요"
              placeholderTextColor={theme.subText}
            />

            <Text style={[styles.editLabel, { color: theme.subText }]}>
              이메일 (변경 불가)
            </Text>
            <TextInput
              style={[
                styles.editInput,
                styles.editInputDisabled,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.muted,
                  color: theme.subText,
                },
              ]}
              value={editEmail}
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor={theme.subText}
            />

            <View style={styles.editButtonRow}>
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.muted }]}
                onPress={() => setEditVisible(false)}
                disabled={saving}
              >
                <Text style={{ fontWeight: "600", color: theme.text }}>
                  취소
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: HEADER_BG }]}
                onPress={handleSaveEdit}
                disabled={saving}
              >
                <Text style={{ fontWeight: "600", color: "white" }}>
                  {saving ? "저장 중..." : "저장"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ------------------ FAQ component (accordion) ------------------
const FAQ = () => {
  const { theme } = useTheme();
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    {
      q: "가격 알림은 어떻게 동작하나요?",
      a: "검색한 특정 항공편을 저장해두면, 해당 항공편의 가격을 서버가 주기적으로 다시 조회합니다. 가격이 내려가면 즉시 알림으로 알려드립니다.",
    },
    {
      q: "예약은 어디서 확인하나요?",
      a: "프로필 > 예약 내역에서 확인할 수 있어요.",
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
          <View
            key={idx}
            style={[styles.faqItem, { borderColor: theme.border }]}
          >
            <TouchableOpacity
              style={[styles.faqHeader, { backgroundColor: theme.muted }]}
              onPress={() => setOpen(opened ? null : idx)}
            >
              <Text style={{ fontWeight: "600", color: theme.text }}>
                {it.q}
              </Text>
              <Feather
                name={opened ? "chevron-up" : "chevron-down"}
                size={18}
                color={theme.text}
              />
            </TouchableOpacity>
            {opened && (
              <Text style={[styles.faqBody, { color: theme.subText }]}>
                {it.a}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  profileHeader: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  name: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  email: { marginBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  infoText: { fontSize: 12 },

  loginRequiredBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  loginRequiredText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginRequiredSub: {
    marginTop: 6,
    fontSize: 12,
    textAlign: "center",
  },

  sheetBackdropTouch: {
    flex: 1,
  },

  sectionBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
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
  },
  sectionLabel: { fontSize: 14 },

  logoutRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingBottom: 40,
  },
  logoutText: { fontSize: 14 },

  title: { fontSize: 24, fontWeight: "bold", marginLeft: 4 },

  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
  },
  sheetCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  sheetHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold" },
  sheetSubtitle: { fontSize: 12, marginTop: 4 },
  sheetCloseBtn: {
    margin: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  // Atoms
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 9999,
  },
  tagText: { fontSize: 13 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  divider: { height: 1, marginVertical: 16 },
  miniBtn: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 6,
  },

  placeholderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  caption: { fontSize: 12 },
  subhead: { fontSize: 14, fontWeight: "600", marginBottom: 8 },

  // Skeletons
  skeletonCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  skelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  skelBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  skelLine: {
    height: 10,
    borderRadius: 6,
    width: "60%",
    marginTop: 6,
  },
  skelLineWide: {
    height: 12,
    borderRadius: 6,
    width: "80%",
    marginBottom: 6,
  },

  // FAQ
  faqItem: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  faqBody: { paddingHorizontal: 12, paddingBottom: 12 },

  // Contact
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1,
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

  // 내 정보 수정 모달
  editBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  editCard: {
    width: "88%",
    borderRadius: 16,
    padding: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  editInputDisabled: {},
  editButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});

export default ProfileScreen;
