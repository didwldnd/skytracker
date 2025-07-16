import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MyTripScreen = () => (
  <View style={centered.view}><Text>둘러보기</Text></View>
);

export default MyTripScreen;


const centered = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})