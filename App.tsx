// App.tsx
import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import HomeScreen from "./HomeScreen";
import FlightResult from "./screens/FlightResultScreen/FlightResultScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import FlightDetailScreen from "./screens/FlightResultScreen/FlightDetailScreen";
import SplashScreen from "./screens/SplashScreen/SplashScreen";
import CityFlightListScreen from "./screens/SearchScreen/CityFlightListScreen";

import { PriceAlertProvider } from "./context/PriceAlertContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

import { FlightSearchResponseDto } from "./types/FlightResultScreenDto";

import { patchStyleSheet } from "./utils/patchStyleSheet";

patchStyleSheet();

export type RootStackParamList = {
  Splash: undefined;
  Search: undefined;
  LoginScreen: undefined;
  HomeScreen: undefined;
  ProfileScreen: undefined;
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
  FlightDetail: { flight: FlightSearchResponseDto };
  FavoriteList: undefined;
  CityFlightList: { city: { cityKo: string; cityEn: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// ⭐ 여기서 theme을 실제 네비게이션/화면에 연결해 주는 컴포넌트
function AppInner() {
  const { theme, resolvedMode } = useTheme();

  // React Navigation 기본 다크/라이트 테마랑도 연동
  const navTheme = resolvedMode === "dark" ? DarkTheme : DefaultTheme;
  navTheme.colors.background = theme.background;
  navTheme.colors.card = theme.card;
  navTheme.colors.text = theme.text;
  navTheme.colors.primary = theme.primary;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="FlightResult" component={FlightResult} />
        <Stack.Screen name="FlightDetail" component={FlightDetailScreen} />
        <Stack.Screen
          name="CityFlightList"
          component={CityFlightListScreen}
          options={{ title: "도시별 항공편" }}
        />
        {/* ProfileScreen도 여기에 이미 등록돼 있겠지 */}
        {/* <Stack.Screen name="ProfileScreen" component={ProfileScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <AuthProvider>
            <UserSettingsProvider>
              <PriceAlertProvider>
                {/* ⭐ 요 ThemeProvider가 "앱 전체"를 감싸는 핵심 */}
                <ThemeProvider>
                  <AppInner />
                </ThemeProvider>
              </PriceAlertProvider>
            </UserSettingsProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
