import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setName(user.name || "")
        setEmail(user.email || "")
      }
    };
    loadUser();
  }, []) // user.name, user.email 불러오기

  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    await AsyncStorage.setItem("isLoggedIn", "false");
    nav.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={centered.view}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>{name}님</Text>
      <Text style={{ fontSize: 15, marginBottom: 20 }}>{email}</Text>
      <Button title="로그아웃" onPress={handleLogout} />
    </View>
  );
};

export default ProfileScreen;

const centered = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})