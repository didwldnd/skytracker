import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const THEME_COLOR = "#0be5ecd7";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ====== 레이아웃 상수 (여백/간격) ======
const SIDE_INSET = 16; // 리스트 좌우 바깥 여백
const ITEM_GAP = 12; // 카드 사이 간격
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_INSET * 2) * 0.97; // 한 화면에 보일 카드 너비

// ====== 타입 ======
type PopularDestination = {
  cityKo: string;
  cityEn: string;
  image: any; // require(...) 또는 { uri: string }
  currentPrice: number; // KRW
  previousPrice: number;
};

// ====== 예시 데이터 (백엔드 연동 시 교체) ======
const mock: PopularDestination[] = [
  {
    cityKo: "도쿄",
    cityEn: "Tokyo",
    image: require("../../assets/tokyo.png"),
    currentPrice: 158000,
    previousPrice: 172000,
  },
  {
    cityKo: "오사카",
    cityEn: "Osaka",
    image: require("../../assets/osaka.png"),
    currentPrice: 132000,
    previousPrice: 129000,
  },
  {
    cityKo: "파리",
    cityEn: "Paris",
    image: require("../../assets/paris.png"),
    currentPrice: 848000,
    previousPrice: 910000,
  },
  {
    cityKo: "뉴욕",
    cityEn: "New York",
    image: require("../../assets/ny.png"),
    currentPrice: 769000,
    previousPrice: 769000,
  },
  // ... 총 10개
];

// ====== 유틸 ======
const formatKRW = (n: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);

const diffText = (cur: number, prev: number) => {
  if (prev <= 0) return "";
  const diff = cur - prev;
  const pct = Math.abs((diff / prev) * 100);
  if (diff > 0) return `+${pct.toFixed(0)}%`;
  if (diff < 0) return `-${pct.toFixed(0)}%`;
  return "0%";
};

export default function PopularScreen() {
  const data = mock; // ← 백엔드 데이터로 교체

  const [activeIndex, setActiveIndex] = useState(0);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const keyExtractor = (item: PopularDestination) =>
    `${item.cityKo}-${item.cityEn}`;

  const renderItem = ({
    item,
    index,
  }: {
    item: PopularDestination;
    index: number;
  }) => {
    const upDown = item.currentPrice - item.previousPrice;
    const isUp = upDown > 0;
    const isDown = upDown < 0;
    const arrowName = isUp
      ? "arrow-upward"
      : isDown
      ? "arrow-downward"
      : "arrow-forward";
    const arrowColor = isUp ? "#e24a4a" : isDown ? "#0aa35b" : "#888";

    return (
      <View
        style={{
          width: CARD_WIDTH,
          marginRight: index === data.length - 1 ? 0 : ITEM_GAP, // 카드 간격
        }}
      >
        <ImageBackground
          source={item.image}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay} />

          <View style={styles.headerTextWrap}>
            <Text style={styles.cityKo}>{item.cityKo}</Text>
            <Text style={styles.cityEn}>{item.cityEn}</Text>
          </View>

          <View style={styles.priceBadgeWrap}>
            {/* <Text style={styles.badgeSub}>최저가</Text> */}

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                {formatKRW(item.currentPrice)}
              </Text>
              <View style={styles.trendWrap}>
                <MaterialIcons
                  name={arrowName as any}
                  size={16}
                  color={arrowColor}
                />
                <Text style={[styles.diffText, { color: arrowColor }]}>
                  {diffText(item.currentPrice, item.previousPrice)}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  };

  const dots = useMemo(
    () => (
      <View style={styles.dotsRow}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex ? styles.dotActive : null]}
          />
        ))}
      </View>
    ),
    [data, activeIndex]
  );

  const listRef = useRef<FlatList<PopularDestination>>(null);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

  const onBeginDrag = (e: any) => {
    dragStartX.current = e.nativeEvent.contentOffset.x;
    dragStartIndex.current = activeIndex;
  };

  const onEndDrag = (e: any) => {
    const endX = e.nativeEvent.contentOffset.x;
    const delta = endX - dragStartX.current;

    const STEP = CARD_WIDTH + ITEM_GAP;
    const THRESHOLD = STEP * 0.1; // 살짝만 넘겨도 다음 카드로

    let next = dragStartIndex.current;
    if (delta > THRESHOLD) next = dragStartIndex.current + 1;
    else if (delta < -THRESHOLD) next = dragStartIndex.current - 1;

    next = Math.max(0, Math.min(next, data.length - 1));

    // 한 칸만 이동하도록 강제 스크롤
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인기 여행지 Top 10</Text>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        // ❌ 자동 페이징/스냅 끄기
        pagingEnabled={false}
        snapToInterval={undefined}
        snapToAlignment="start"
        decelerationRate="fast"
        // ✅ 한 칸만 이동하도록 드래그 시작/끝에서 수동 제어
        onScrollBeginDrag={onBeginDrag}
        onScrollEndDrag={onEndDrag}
        // scrollToIndex 성능 위해 유지
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + ITEM_GAP,
          offset: (CARD_WIDTH + ITEM_GAP) * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
        initialNumToRender={3}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{
          paddingLeft: 0,
          paddingHorizontal: SIDE_INSET,
        }}
      />

      {dots}
    </View>
  );
}

// ====== 스타일 ======
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    marginLeft: 3,
  },

  hero: {
    width: "100%",
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  heroImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  headerTextWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  cityKo: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
  },
  cityEn: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },

  priceBadgeWrap: {
    alignItems: "flex-end",
    padding: 12,
  },
  priceBadge: {},

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceText: {
    fontSize: 18, // 살짝 키워서 존재감
    fontWeight: "900",
    color: "#fff", // 사진 위라 흰색
    // 가독성용 그림자
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  trendWrap: {
    marginTop: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  diffText: {
    fontSize: 12,
    fontWeight: "800",
    // 색상은 arrowColor로 동적 적용됨
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  badgeSub: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#ddd",
  },
  dotActive: {
    width: 16,
    backgroundColor: THEME_COLOR,
  },
});
