import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import FlightResult from "./screens/FlightResultScreen/FlightResultScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import { FlightSearchResponseDto } from "./types/FlightResultScreenDto";
import FlightDetailScreen from "./screens/FlightResultScreen/FlightDetailScreen";
import SplashScreen from "./screens/SplashScreen/SplashScreen";
import { FavoriteProvider } from "./context/FavoriteContext";
import FavoriteListScreen from "./screens/ProfileScreen/FavoriteListScreen";
import { PriceAlertProvider } from "./context/PriceAlertContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import CityFlightListScreen from "./screens/SearchScreen/CityFlightListScreen";

// 타입 오류나 잘못된 값 전달 방지위한 타입 정의
export type RootStackParamList = {
  Splash: undefined;
  Search: undefined;
  LoginScreen: undefined;
  HomeScreen: undefined;
  FlightResult: {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate: string;
    adults: number;
    travelClass: string;
    stopover: string;
    results?: FlightSearchResponseDto[];
  };
  FlightDetail: {
    flight: FlightSearchResponseDto;
  };
  FavoriteList: undefined;
  CityFlightList: {
    city: { cityKo: string; cityEn: string };
  };
};

// 앱 전체화면 전환을 담당하는 StackNavigator이고 제네릭으로 위에 정의한 RootStackParamList 연결
const Stack = createNativeStackNavigator<RootStackParamList>();

// 앱 시작점이자 전체 Provider/네비게이션 구조 감싸는 루트 컴포넌트
// 전역상태 관리 (UserSettings, PriceAlert, Favorite)
// SafeAreaView, GestureHandlerRootView로 레이아웃 안정성 확보 (제스처 충돌 방지용)
// NavigationContainer, Stack.Navigator로 화면 전환 구조 설정
export default function App() {
  return (
    <UserSettingsProvider>
      <PriceAlertProvider>
        <FavoriteProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Splash" // 앱 최초 실행시 Splash 화면 노출
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="Splash" component={SplashScreen} />
                  <Stack.Screen name="HomeScreen" component={HomeScreen} />
                  <Stack.Screen name="LoginScreen" component={LoginScreen} />
                  <Stack.Screen name="FlightResult" component={FlightResult} />
                  <Stack.Screen
                    name="FlightDetail"
                    component={FlightDetailScreen}
                  />
                  <Stack.Screen
                    name="FavoriteList"
                    component={FavoriteListScreen}
                  />
                  <Stack.Screen
                    name="CityFlightList"
                    component={CityFlightListScreen}
                    options={{ title: "도시별 항공편" }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </GestureHandlerRootView>
          </SafeAreaView>
        </FavoriteProvider>
      </PriceAlertProvider>
    </UserSettingsProvider>
  );
}
