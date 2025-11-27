// screens/PopularScreen.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  fetchHotRoutes,
  buildRequestFromHotRoute,
  searchFlights,
} from "../../utils/api";
import { HotRouteSummaryDto } from "../../types/HotRouteSummaryDto";
import { FlightSearchResponseDto } from "../../types/FlightResultScreenDto";
import { FlightSearchRequestDto } from "../../types/FlightSearchRequestDto";
import { RootStackParamList } from "../../App";
import { airportMap } from "../PriceAlertScreen/PriceAlertScreen";
import FlightLoadingModal from "../../components/FlightLoadingModal";

const THEME_COLOR = "#6ea1d4";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SIDE_INSET = 16;
const ITEM_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - SIDE_INSET * 2) * 0.97;

const airportToCity = (code: string) => {
  return airportMap[code] ?? code;
};

// 서버 DTO + 이미지 필드 하나 추가
type HotRouteWithImage = HotRouteSummaryDto & {
  image: any;
};

// 도착 공항 코드 기준으로 이미지 매핑
export const IMAGE_BY_ARRIVAL: Record<string, any> = {
  // KR 한국 (이미지 파일 있으면 사용)
  // PUS: require("../../assets/citys/pusan.png"),
  // ICN: require("../../assets/citys/incheon.png"),

  // 🇯🇵 일본
  NRT: require("../../assets/citys/tokyo.png"),
  HND: require("../../assets/citys/tokyo.png"),
  KIX: require("../../assets/citys/osaka.png"),
  ITM: require("../../assets/citys/osaka.png"),
  FUK: require("../../assets/citys/fukuoka.png"),

  // 🇨🇳 중국
  PEK: require("../../assets/citys/beijing.png"),
  PVG: require("../../assets/citys/shanghai.png"),

  // 🇭🇰 홍콩
  HKG: require("../../assets/citys/hongkong.png"),

  // 🇹🇭 태국
  BKK: require("../../assets/citys/bangkok.png"),

  // 🇸🇬 싱가포르
  SIN: require("../../assets/citys/singapore.png"),

  // 🇺🇸 미국
  JFK: require("../../assets/citys/ny.png"),
  LGA: require("../../assets/citys/ny.png"),
  EWR: require("../../assets/citys/ny.png"),
  LAX: require("../../assets/citys/losangeles.png"),
  SFO: require("../../assets/citys/sanfrancisco.png"),
  ORD: require("../../assets/citys/chicago.png"),
  IAD: require("../../assets/citys/washington.png"),
  DCA: require("../../assets/citys/washington.png"),

  // 🇨🇦 캐나다
  YYZ: require("../../assets/citys/toronto.png"),
  YVR: require("../../assets/citys/vancouver.png"),

  // 🇬🇧 영국
  LHR: require("../../assets/citys/london.png"),
  LGW: require("../../assets/citys/london.png"),

  // 🇫🇷 프랑스
  CDG: require("../../assets/citys/paris.png"),
  ORY: require("../../assets/citys/paris.png"),

  // 🇩🇪 독일
  FRA: require("../../assets/citys/frankfurt.png"),

  // 🇪🇸 스페인
  BCN: require("../../assets/citys/barcelona.png"),
  MAD: require("../../assets/citys/madrid.png"),

  // 🇮🇹 이탈리아
  MXP: require("../../assets/citys/milano.png"),
  FCO: require("../../assets/citys/roma.png"),
};

const fallbackImage = require("../../assets/citys/fallback-city.png");

export default function PopularScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [data, setData] = useState<HotRouteWithImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true); // hot-routes 로딩
  const [searching, setSearching] = useState(false); // 배너 클릭 후 검색 로딩

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const listRef = useRef<FlatList<HotRouteWithImage>>(null);
  const dragStartX = useRef(0);
  const dragStartIndex = useRef(0);

  // 🔹 1) 첫 렌더링 시 /hot-routes 호출
  useEffect(() => {
    const load = async () => {
      try {
        const hotRoutes = await fetchHotRoutes();

        if (!hotRoutes || hotRoutes.length === 0) {
          setData([]);
          return;
        }

        const mapped: HotRouteWithImage[] = hotRoutes.map((h) => ({
          ...h,
          image: IMAGE_BY_ARRIVAL[h.arrivalAirportCode] ?? fallbackImage,
        }));

        setData(mapped);
      } catch (e) {
        console.error("Failed to load hot routes", e);
        Alert.alert("오류", "인기 노선을 불러오지 못했어요.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const keyExtractor = (item: HotRouteWithImage) => item.uniqueKey;

  // 🔹 2) 카드 탭 → HotRoute → FlightSearchRequestDto → /search → FlightResult로 이동
  const onPressRoute = async (item: HotRouteWithImage) => {
    if (searching) return;
    setSearching(true);

    try {
      const dto: FlightSearchRequestDto = buildRequestFromHotRoute(item);
      const results: FlightSearchResponseDto[] = await searchFlights(dto);

      if (!results || results.length === 0) {
        Alert.alert("검색 결과 없음", "해당 노선의 항공편을 찾지 못했어요.");
        return;
      }

      navigation.navigate("FlightResult", {
        originLocationCode: item.departureAirportCode,
        destinationLocationCode: item.arrivalAirportCode,
        departureDate: item.departureDate,
        returnDate: item.arrivalDate ?? "",
        adults: 1,
        travelClass: "일반석", // 화면에 표시용
        stopover: "상관없음",
        results,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("오류", "인기 노선 검색 중 문제가 발생했습니다.");
    } finally {
      setSearching(false);
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: HotRouteWithImage;
    index: number;
  }) => {
    const dateText = item.arrivalDate
      ? `${item.departureDate} ~ ${item.arrivalDate}`
      : `${item.departureDate} (편도)`;

    return (
      <Pressable
        onPress={() => onPressRoute(item)}
        style={{
          width: CARD_WIDTH,
          marginRight: index === data.length - 1 ? 0 : ITEM_GAP,
        }}
        android_ripple={{ borderless: false }}
      >
        <ImageBackground
          source={item.image}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay} />

          <View style={styles.headerTextWrap}>
            <Text style={styles.cityKo}>
              #{item.rank} {airportToCity(item.departureAirportCode)} →{" "}
              {airportToCity(item.arrivalAirportCode)}
            </Text>
            <Text style={styles.cityEn}>{dateText}</Text>
            <Text style={styles.cityEn}>성인 {item.adults}명</Text>
          </View>
        </ImageBackground>
      </Pressable>
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

  const onBeginDrag = (e: any) => {
    dragStartX.current = e.nativeEvent.contentOffset.x;
    dragStartIndex.current = activeIndex;
  };

  const onEndDrag = (e: any) => {
    const endX = e.nativeEvent.contentOffset.x;
    const delta = endX - dragStartX.current;
    const STEP = CARD_WIDTH + ITEM_GAP;
    const THRESHOLD = STEP * 0.1;

    let next = dragStartIndex.current;
    if (delta > THRESHOLD) next = dragStartIndex.current + 1;
    else if (delta < -THRESHOLD) next = dragStartIndex.current - 1;

    next = Math.max(0, Math.min(next, data.length - 1));
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
  };

  // hot-routes 로딩 중
  if (loading) {
    return (
      <View style={{ marginTop: 20, alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 데이터 없으면 섹션 숨김
  if (!loading && data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인기 노선 Top 10</Text>

      <FlatList
        ref={listRef}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={onBeginDrag}
        onScrollEndDrag={onEndDrag}
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

      {/* 🔥 배너 눌러서 검색하는 동안 뜨는 로딩 모달 */}
      <FlightLoadingModal visible={searching} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, marginLeft: 3 },

  hero: {
    width: "100%",
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 16,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  heroImage: { resizeMode: "cover" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  headerTextWrap: { paddingHorizontal: 16, paddingTop: 14 },

  cityKo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cityEn: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 999, backgroundColor: "#ddd" },
  dotActive: { width: 16, backgroundColor: THEME_COLOR },
});
