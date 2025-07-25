import React from "react";
import { Modal, View, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

interface Props {
  visible: boolean;
}

const FlightDetailLoadingModal: React.FC<Props> = ({ visible }) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <LottieView
          source={require("../assets/detail-loader.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  lottie: {
    width: width * 0.4,
    height: width * 0.4,
  },
});

export default FlightDetailLoadingModal;
