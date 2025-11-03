import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Splash">;

export default function SplashScreenCustom() {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation<SplashScreenNavigationProp>();

  // Animated 사용, 애니메이션 끝나면 replace 호출 -> 스플래시 사라지고 HomeScreen 전환
  useEffect(() => {
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace("HomeScreen");
    });
  }, []);

  // 글자 하나씩 잘라서 배열로 전환함 -> ['S','K','Y' ...]
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.textRow}>
        {"SKYTRACKER".split("").map((char, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.char}>{char}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0be5ecd7",
    justifyContent: "center",
    alignItems: "center",
  },
  textRow: {
    flexDirection: "row",
  },
  box: {
    backgroundColor: "white",
    marginHorizontal: 2,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  char: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0be5ecd7",
  },
});
