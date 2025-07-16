import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MyTripScreen = () => (
  <View style={centered.view}><Text>마이트립</Text></View>
);

export default MyTripScreen;


const centered = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})