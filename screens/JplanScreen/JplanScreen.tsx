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
} from "react-native";

const JplanScreen = () => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "assistant",
      content:
        "안녕하세요! J플랜입니다. ✈️\n출발지, 도착지, 날짜, 경유 횟수, 인원 수를 알려주시면 그 일정에 영향을 줄 수 있는 교통·날씨·공휴일 정보를 알려드릴게요!\n입력 예시 : {} {} {} {} {}",
    },
  ]);
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 챗봇 응답 1.2초 후에 추가
    setTimeout(() => {
      const botReply = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `${input}에 필요한 정보를 알려드릴게요.`,
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1200);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={25} // 입력창 가림 문제로 일단 하드코딩
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>J플랜</Text>
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

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="메시지를 입력하세요"
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Text style={{ color: "white" }}>전송</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default JplanScreen;

const styles = StyleSheet.create({
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
