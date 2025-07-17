import React from "react";
import { View, Text, StyleSheet } from "react-native";

const JplanScreen = () => (
  <View style={centered.view}><Text>J플랜</Text></View>
);

export default JplanScreen;


const centered = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})