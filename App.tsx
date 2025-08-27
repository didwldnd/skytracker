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

export type RootStackParamList = {
  Splash: undefined; // 추가
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <UserSettingsProvider>
      <PriceAlertProvider>
        <FavoriteProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="Splash" // 스플래시로 변경
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
