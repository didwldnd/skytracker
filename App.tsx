import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./HomeScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LoginScreen from "./screens/LoginScreen";

export type RootStackParamList = {
  LoginScreen: undefined;
  Login: undefined;
  SignUp: undefined;
  HomeScreen: undefined;
  FlightResult: {
    departure: string;
    destination: string;
    departureDate: string;
    returnDate: string;
    passengers: number;
    seatClass: string;
    stopover: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{ title: "" }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ title: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

// 로그인 기능 넣으면 초기 로그인화면으로
