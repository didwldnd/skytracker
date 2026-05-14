// 하단 탭
import React from "react"
import { Platform } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "./context/ThemeContext";

import index from "./screens/SearchScreen/index"
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen"
import JplanScreen from './screens/JplanScreen/JplanScreen'
import PriceAlertScreen from "./screens/PriceAlertScreen/PriceAlertScreen";

const Tab = createBottomTabNavigator()

type TabRouteName = "검색" | "알리미" | "J플랜" | "프로필";

const ICON_OUTLINE: Record<TabRouteName, React.ComponentProps<typeof Ionicons>["name"]> = {
  검색: "search-outline",
  알리미: "alarm-outline",
  "J플랜": "chatbubbles-outline",
  프로필: "person-outline",
};

const ICON_FILLED: Record<TabRouteName, React.ComponentProps<typeof Ionicons>["name"]> = {
  검색: "search",
  알리미: "alarm",
  "J플랜": "chatbubbles",
  프로필: "person",
};

const HomeScreen = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const name = route.name as TabRouteName;
          const iconName = focused ? ICON_FILLED[name] : ICON_OUTLINE[name];
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subText,
        tabBarStyle: {
          height: Platform.OS === "android" ? 60 : 64,
          backgroundColor: theme.card,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 8,
          paddingBottom: Platform.OS === "android" ? 8 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 0.2,
          marginTop: 2,
        },
      })}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen name="검색" component={index} />
      <Tab.Screen name="알리미" component={PriceAlertScreen} />
      <Tab.Screen name="J플랜" component={JplanScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen
