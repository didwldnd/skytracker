import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { apiFetch } from "../../utils/apiClient";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt?: string;
};

type ChatResponseDto = {
  messageId: number;
  role: string; // "ai" or "user"
  content: string;
  createdAt: string;
};

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "안녕하세요! J플랜입니다. ✈️\n출발지, 도착지, 날짜, 경유 횟수, 인원 수를 알려주시면 그 일정에 영향을 줄 수 있는 교통·날씨·공휴일 정보를 알려드릴게요!\n입력 예시 : {부산} {바르셀로나} {2025-01-01} {직항만} {성인1명}",
};

const CHAT_HISTORY_URL = "/chatRoom";
const CHAT_ASK_URL = "/ask";

const JplanScreen = () => {
  const navigation = useNavigation<any>();

  // 로그인 여부
  const auth = useContext(AuthContext);
  const isLoggedIn = auth?.authState.isAuthenticated ?? false;

  const { theme } = useTheme(); // ⭐ 테마 사용

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // 🔹 사용법 안내 토글 + 애니메이션 상태
  const [showGuide, setShowGuide] = useState(true); // 논리 상태
  const [guideMounted, setGuideMounted] = useState(true); // 완전히 제거 여부
  const guideAnim = useRef(new Animated.Value(1)).current; // 0:숨김, 1:보임

  const goToLogin = () => {
    navigation.navigate("LoginScreen");
  };

  // 2) 로그인된 경우에만 히스토리 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isLoggedIn) {
        setMessages([WELCOME_MESSAGE]);
        setLoadingHistory(false);
        return;
      }

      try {
        const res = await apiFetch(CHAT_HISTORY_URL, {
          method: "GET",
        });

        if (!res.ok) {
          setMessages([WELCOME_MESSAGE]);
          return;
        }

        const data: ChatResponseDto[] = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const mapped: ChatMessage[] = data.map((m) => ({
            id: String(m.messageId),
            role:
              m.role === "assistant" || m.role === "ai" ? "assistant" : "user",
            content: m.content,
            createdAt: m.createdAt,
          }));

          setMessages(mapped);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (e) {
        console.log("[Jplan] history fetch error:", e);
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [isLoggedIn]);

  // 메시지 바뀔 때 맨 아래로 자동 스크롤
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (showGuide) {
      // 보이게 할 때: 먼저 마운트하고 애니메이션으로 내려오기
      setGuideMounted(true);
      Animated.timing(guideAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      // 숨길 때: 위로 사라지면서 투명 -> 끝나고 마운트 해제
      Animated.timing(guideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setGuideMounted(false);
        }
      });
    }
  }, [showGuide, guideAnim]);

  // ✅ 키보드 열릴 때 자동으로 맨 아래로 스크롤
  useEffect(() => {
    const eventName =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const showSub = Keyboard.addListener(eventName, () => {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });

    return () => {
      showSub.remove();
    };
  }, []);

  const handleSend = async () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }

    if (!input.trim() || sending) return;

    const trimmed = input.trim();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setSending(true);

      const res = await apiFetch(CHAT_ASK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "서버와 통신 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
          },
        ]);
        return;
      }

      const data: ChatResponseDto = await res.json();

      const botReply: ChatMessage = {
        id: String(data.messageId ?? Date.now() + 1),
        role:
          data.role === "assistant" || data.role === "ai"
            ? "assistant"
            : "user",
        content: data.content,
        createdAt: data.createdAt,
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (e) {
      console.log("[Jplan] ask fetch error:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content:
            "네트워크 오류가 발생했어요. 인터넷 연결을 확인하시고 다시 시도해 주세요.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // 1) 비회원 화면
  if (!isLoggedIn) {
    return (
      <View style={[styles.lockContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.lockIconWrap, { backgroundColor: theme.muted }]}>
          <Ionicons name="chatbubbles-outline" size={40} color={theme.primary} />
        </View>
        <Text style={[styles.lockTitle, { color: theme.text }]}>
          로그인 후 이용 가능한 서비스예요
        </Text>
        <Text style={[styles.lockDesc, { color: theme.subText }]}>
          J플랜은 회원 전용 AI 여행 도우미입니다.{`\n`}
          맞춤형 여행 정보를 받으려면 먼저 로그인해주세요.
        </Text>
        <TouchableOpacity
          style={[styles.lockButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate("LoginScreen")}
          activeOpacity={0.8}
        >
          <Text style={styles.lockButtonText}>로그인 하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 2) 로그인 상태 – 기존 챗봇 UI
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "android" ? 25 : 25}
    >
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* ── 상단 헤더 ── */}
        <View style={[styles.headerRow, { backgroundColor: theme.background }]}>
          <View>
            <Text style={[styles.headerSub, { color: theme.subText }]}>AI 여행 도우미</Text>
            <Text style={[styles.title, { color: theme.text }]}>J플랜</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowGuide((prev) => !prev)}
            style={[
              styles.guideToggle,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showGuide ? "chevron-up-outline" : "information-circle-outline"}
              size={14}
              color={theme.subText}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.guideToggleText, { color: theme.subText }]}>
              {showGuide ? "접기" : "사용법"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 사용법 안내 오버레이 ── */}
        {guideMounted && (
          <Animated.View
            pointerEvents={showGuide ? "auto" : "none"}
            style={[
              styles.guideOverlay,
              {
                opacity: guideAnim,
                transform: [
                  {
                    translateY: guideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.guideContainer,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.guideTitle, { color: theme.text }]}>
                J플랜 사용 가이드
              </Text>
              <Text style={[styles.guideText, { color: theme.subText }]}>
                • 도시명 또는 국가명을 입력하면{"\n"}
                {"  "}– 항공권이 저렴한 시기{"\n"}
                {"  "}– 여행하기 좋은 계절과 이유{"\n"}
                {"  "}– 가격 경향을 안내해 드려요.{"\n\n"}
                • 날짜를 함께 지정하면{"\n"}
                {"  "}– 여행 적합성 및 항공권 가격 경향을 상세히 알려드립니다.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* 🔹 채팅 영역 */}
        <View style={{ flex: 1 }}>
          {loadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                대화 기록을 불러오는 중입니다...
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 10, paddingTop: 4 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                if (item.role === "user") {
                  return (
                    <View style={[styles.bubble, styles.userBubble]}>
                      <Text style={styles.userText}>{item.content}</Text>
                    </View>
                  );
                }

                return (
                  <View style={styles.botMessageWrapper}>
                    <Text style={[styles.botIcon, { color: theme.text }]}>
                      🤖
                    </Text>
                    <View
                      style={[
                        styles.bubble,
                        styles.botBubble,
                        {
                          backgroundColor: theme.card,
                          // ⭐ 테두리 추가 (라이트에서만 특히 효과, 다크도 무난)
                          borderWidth: 1,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.botText, { color: theme.text }]}>
                        {item.content}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>

        {/* ── 입력창 ── */}
        <View
          style={[
            styles.inputBox,
            { backgroundColor: theme.card, borderTopColor: theme.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.muted,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={theme.placeholder}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[styles.sendBtn, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default JplanScreen;

const styles = StyleSheet.create({
  // ── 로딩 ──
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400",
  },

  // ── 비로그인 락 화면 ──
  lockContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  lockIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lockTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  lockDesc: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },
  lockButton: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  lockButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // ── 헤더 ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerSub: {
    fontSize: 13,
    fontWeight: "400",
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  guideToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  guideToggleText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ── 사용법 오버레이 ──
  guideOverlay: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  guideContainer: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  guideTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  guideText: {
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 20,
  },

  // ── 채팅 UI ──
  wrapper: { flex: 1 },
  container: { flex: 1 },
  bubble: {
    maxWidth: "80%",
    borderRadius: 14,
    marginVertical: 4,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#6ea1d4",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    maxWidth: "80%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    marginRight: 16,
  },
  userText: {
    color: "white",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  botMessageWrapper: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  botIcon: {
    marginLeft: 16,
    marginBottom: 4,
    fontSize: 18,
  },
  botBubble: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 16,
  },
  botText: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },

  // ── 입력창 ──
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
