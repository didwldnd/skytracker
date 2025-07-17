import React, { useState } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";

const popularDestinations = [
  {
    korean: "도쿄",
    english: "Tokyo",
    image: require("../../assets/tokyo.png"),
  },
  {
    korean: "오사카",
    english: "Osaka",
    image: require("../../assets/osaka.png"),
  },
  {
    korean: "파리",
    english: "Paris",
    image: require("../../assets/paris.png"),
  },
  {
    korean: "뉴욕",
    english: "New York",
    image: require("../../assets/ny.png"),
  },
  // 필요 시 더 추가
];

export default function PopularScreen() {
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인기 여행지 Top 20</Text>
      <FlatList
        horizontal
        pagingEnabled
        snapToAlignment="start"
        decelerationRate="fast"
        data={popularDestinations.slice(0, visibleCount)}
        keyExtractor={(item) => item.korean}
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.firstCard]}>
            <Text style={styles.city}>{item.korean}</Text>
            <Text style={styles.sub}>{item.english}</Text>
            <Image source={item.image} style={styles.image} />
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        onEndReached={() => {
          if (visibleCount < popularDestinations.length) {
            setVisibleCount((prev) => prev + 1);
          }
        }}
        onEndReachedThreshold={0.1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  card: {
    marginRight: 12,
    width: 180,
  },
  firstCard: {
    width: 240,
  },
  city: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sub: {
    fontSize: 14,
    color: "gray",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginTop: 8,
  },
});
