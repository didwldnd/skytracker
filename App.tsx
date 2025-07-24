import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import FlightResult from "./screens/FlightResultScreen/FlightResultScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen"; // 추후 반영
import { FlightSearchResponseDto } from "./types/FlightResultScreenDto";

export type RootStackParamList = {
  Search: undefined;
  LoginScreen: undefined; // 로그인 화면
  HomeScreen: undefined; // 하단 바
  FlightResult: {
    originLocationCode: string; // 출발지
    destinationLocationCode: string; // 도착지
    departureDate: string; // 출발 날짜
    returnDate: string; // 귀국 날짜 (왕복일 경우)
    adults: number; // 성인 인원 수 (탑승객 전체로?)
    travelClass: string; // 좌석 클래스
    stopover: string; // 좌석 클래스, 직항 선택 모달

    results?: FlightSearchResponseDto[];
    // currencyCode, totalPrice, lastUpdatedAt 추가
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="HomeScreen"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ title: "" }}
            />
            <Stack.Screen
              name="FlightResult"
              component={FlightResult}
              options={{ title: "" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

// 로그인 기능 넣으면 초기 로그인화면으로 설정
