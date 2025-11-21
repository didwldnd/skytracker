import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../utils/apiClient";

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
const ACCESS_TOKEN_KEY = "accessToken";

const JplanScreen = () => {
  const navigation = useNavigation<any>();

  // 로그인 여부
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const goToLogin = () => {
    navigation.navigate("LoginScreen"); // 🔁 라우트 이름 프로젝트에 맞게 수정
  };

  // 1) 진입 시 로그인 여부 확인
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
        setIsLoggedIn(!!token);
      } catch (e) {
        console.log("[Jplan] checkLogin error:", e);
        setIsLoggedIn(false);
      } finally {
        setLoginChecked(true);
      }
    };
    checkLogin();
  }, []);

  // 2) 로그인된 경우에만 히스토리 불러오기
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isLoggedIn) {
        setLoadingHistory(false);
        return;
      }

      try {
        const res = await apiFetch(CHAT_HISTORY_URL, {
          method: "GET",
        });

        console.log("[Jplan] history status:", res.status);

        if (!res.ok) {
          console.log("[Jplan] history error status:", res.status);
          setMessages([WELCOME_MESSAGE]);
          return;
        }

        const data: ChatResponseDto[] = await res.json();
        console.log("[Jplan] history data:", data);

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

    if (loginChecked) {
      fetchHistory();
    }
  }, [loginChecked, isLoggedIn]);

  // 메시지 바뀔 때 맨 아래로 자동 스크롤
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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

      console.log("[Jplan] ask status:", res.status);

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
      console.log("[Jplan] ask data:", data);

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

  // 1) 로그인 체크 중 로딩
  if (!loginChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>로그인 상태 확인 중...</Text>
      </View>
    );
  }

  // 2) 비회원 화면 – 버튼 눌렀을 때만 로그인 이동
  if (!isLoggedIn) {
    return (
      <View style={styles.lockContainer}>
        <Text style={styles.lockTitle}>로그인 후 이용 가능한 서비스에요</Text>
        <Text style={styles.lockDesc}>
          J플랜은 회원 전용 서비스입니다.{`\n`}
          맞춤형 여행 일정을 이용하려면 먼저 로그인 해주세요.
        </Text>

        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => navigation.navigate("LoginScreen")}
        >
          <Text style={styles.lockButtonText}>로그인 하러 가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3) 로그인 상태 – 기존 챗봇 UI
  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={25}
    >
      <View style={styles.container}>
        <Text style={styles.title}>J플랜</Text>

        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>
              대화 기록을 불러오는 중입니다...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
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
                  <Text style={styles.botIcon}>🤖</Text>
                  <View style={[styles.bubble, styles.botBubble]}>
                    <Text style={styles.botText}>{item.content}</Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 10 }}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!sending && !loadingHistory}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={styles.sendBtn}
            disabled={sending || loadingHistory}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "white" }}>전송</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default JplanScreen;

const styles = StyleSheet.create({
  // 🔹 PriceAlertScreen이랑 맞춘 부분
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#555",
  },
  lockContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  lockDesc: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  lockButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#0be5ecd7",
  },
  lockButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  // 🔹 기존 J플랜 챗 UI
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 12,
    marginVertical: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0be5ecd7",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    maxWidth: "80%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    position: "relative",
    marginRight: 10,
  },
  userText: {
    color: "white",
  },
  botMessageWrapper: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  botIcon: {
    marginLeft: 10,
    marginBottom: 3,
    fontSize: 20,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    padding: 10,
    marginLeft: 10,
  },
  botText: {
    color: "black",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 20,
  },
  sendBtn: {
    backgroundColor: "#0be5ecd7",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 8,
  },
});
