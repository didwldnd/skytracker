import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFavorite } from "../../context/FavoriteContext";
import FlightCard from "../../components/FlightCard";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import FlightLoadingModal from "../../components/FlightLoadingModal";

const FavoriteListScreen = () => {
  const { favorites } = useFavorite();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>즐겨찾기 항공편</Text>

      <FlightLoadingModal visible={loading} />

      <FlatList
        data={favorites}
        keyExtractor={(item, idx) =>
          `${item.airlineCode}-${item.flightNumber}-${idx}`
        }
        renderItem={({ item }) => (
          <FlightCard
            flight={item}
            onPress={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                navigation.navigate("FlightDetail", { flight: item });
              }, 1555);
            }}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>즐겨찾기 항공편이 없습니다.</Text>
        }
      />
    </View>
  );
};

export default FavoriteListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
  },
});
