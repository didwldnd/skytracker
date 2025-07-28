// 하단 탭
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';

import index from "./screens/SearchScreen/index"
import ProfileScreen from "./screens/ProfileScreen/ProfileScreen"
import JplanScreen from './screens/JplanScreen/JplanScreen'
import PriceAlertScreen from "./screens/PriceAlertScreen/PriceAlertScreen";
const Tab = createBottomTabNavigator()

const HomeScreen = () => {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          
          const iconMap = {
            검색: 'search',
            알리미: 'alarm',
            J플랜: 'chatbubbles',
            프로필: 'person-outline',
          } as const;

          const iconName = iconMap[route.name as keyof typeof iconMap];

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0be5ecd7',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="검색" component={index} />
      <Tab.Screen name="알리미" component={PriceAlertScreen} />
      <Tab.Screen name="J플랜" component={JplanScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen