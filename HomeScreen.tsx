import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from '@expo/vector-icons';

import ProfileScreen from "./screens/ProfileScreen"
import MyTripScreen from "./screens/MyTripScreen"
import SearchScreen from "./screens/SearchScreen"
import ExploreScreen from "./screens/PriceAlertScreen"

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
            미정: 'heart',
            프로필: 'person-outline',
          } as const;

          const iconName = iconMap[route.name as keyof typeof iconMap];

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="검색" component={SearchScreen} />
      <Tab.Screen name="알리미" component={ExploreScreen} />
      <Tab.Screen name="미정" component={MyTripScreen} />
      <Tab.Screen name="프로필" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default HomeScreen