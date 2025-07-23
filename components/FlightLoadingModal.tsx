import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

type Props = {
  visible: boolean;
};

const FlightLoadingModal = ({ visible }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require("../assets/flight-loader.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    </Modal>
  );
};

export default FlightLoadingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: 200,
    height: 200,
  },
});
