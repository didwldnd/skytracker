import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';

import ProfileScreen from "./screens/ProfileScreen"
import JplanScreen from './screens/JplanScreen'
import SearchScreen from "./screens/SearchScreen"
import PriceAlertScreen from "./screens/PriceAlertScreen";
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
        tabBarActiveTintColor: '#f26522',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="검색" component={SearchScreen} />
      <Tab.Screen name="알리미" component={PriceAlertScreen} />
      <Tab.Screen name="J플랜" component={JplanScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen