import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import HomeScreen from "./HomeScreen";
import FlightResult from "./screens/FlightResultScreen/FlightResultScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import FlightDetailScreen from "./screens/FlightResultScreen/FlightDetailScreen";
import SplashScreen from "./screens/SplashScreen/SplashScreen";
import FavoriteListScreen from "./screens/ProfileScreen/FavoriteListScreen";
import CityFlightListScreen from "./screens/SearchScreen/CityFlightListScreen";

import { FavoriteProvider } from "./context/FavoriteContext";
import { PriceAlertProvider } from "./context/PriceAlertContext";
import { UserSettingsProvider } from "./context/UserSettingsContext";
import { FlightSearchResponseDto } from "./types/FlightResultScreenDto";

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
  FlightDetail: { flight: FlightSearchResponseDto };
  FavoriteList: undefined;
  CityFlightList: { city: { cityKo: string; cityEn: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <UserSettingsProvider>
            <PriceAlertProvider>
              <FavoriteProvider>
                <NavigationContainer>
                  <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                    <Stack.Screen name="FlightResult" component={FlightResult} />
                    <Stack.Screen name="FlightDetail" component={FlightDetailScreen} />
                    <Stack.Screen name="FavoriteList" component={FavoriteListScreen} />
                    <Stack.Screen
                      name="CityFlightList"
                      component={CityFlightListScreen}
                      options={{ title: "도시별 항공편" }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </FavoriteProvider>
            </PriceAlertProvider>
          </UserSettingsProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
