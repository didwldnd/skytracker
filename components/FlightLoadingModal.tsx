import React, { useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Path, Text as SvgText, Defs, LinearGradient, Stop } from "react-native-svg";

// Animated Path
const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  width?: number;
  height?: number;
  color?: string;          // 선/로고 컬러
  bgStart?: string;        // 그라데이션 시작
  bgEnd?: string;          // 그라데이션 끝
  durationMs?: number;     // 전체 애니메이션 시간
  autoPlay?: boolean;
};

export default function KayakLineSplash({
  width = 360,
  height = 780,
  color = "#FFFFFF",
  bgStart = "#FF6A00",
  bgEnd = "#FF3D00",
  durationMs = 1400,
  autoPlay = true,
}: Props) {
  // 로고 박스 크기/위치(비율 기반)
  const boxW = width * 0.34;              // K를 둘러싸는 프레임 너비
  const boxH = boxW * 0.62;               // 프레임 높이
  const cx = width * 0.5;                 // 중앙 X
  const cy = height * 0.58;               // 프레임 하단 기준선 Y (Kayak처럼 약간 아래)
  const boxLeft   = cx - boxW / 2;
  const boxRight  = cx + boxW / 2;
  const boxBottom = cy;                    // 하단 라인 = 선이 달리는 기준선
  const boxTop    = boxBottom - boxH;

  // 선이 따라갈 경로: A(-20,bottom)→B(boxRight,bottom)→C(boxRight,top)→D(boxLeft,top)
  // →E(boxLeft,bottom)→F(boxRight,bottom)→G(width+20,bottom)
  const pA = { x: -20,       y: boxBottom };
  const pB = { x: boxRight,  y: boxBottom };
  const pC = { x: boxRight,  y: boxTop    };
  const pD = { x: boxLeft,   y: boxTop    };
  const pE = { x: boxLeft,   y: boxBottom };
  const pF = { x: boxRight,  y: boxBottom };
  const pG = { x: width+20,  y: boxBottom };

  const pathD = `M ${pA.x},${pA.y} L ${pB.x},${pB.y} L ${pC.x},${pC.y} L ${pD.x},${pD.y} L ${pE.x},${pE.y} L ${pF.x},${pF.y} L ${pG.x},${pG.y}`;

  // 총 길이(직선 합)
  const segLen = (p1: {x:number;y:number}, p2:{x:number;y:number}) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

  const totalLength = useMemo(() => (
    segLen(pA,pB) + segLen(pB,pC) + segLen(pC,pD) + segLen(pD,pE) + segLen(pE,pF) + segLen(pF,pG)
  ), [boxLeft, boxRight, boxTop, boxBottom, width, height]);

  // 애니메이션 값: strokeDashoffset을 totalLength -> 0
  const dash = useRef(new Animated.Value(totalLength)).current;

  useEffect(() => {
    if (!autoPlay) return;
    dash.setValue(totalLength);
    Animated.timing(dash, {
      toValue: 0,
      duration: durationMs,
      useNativeDriver: true,
    }).start();
  }, [autoPlay, totalLength, durationMs]);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* 배경 그라데이션 */}
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={bgStart} />
            <Stop offset="1" stopColor={bgEnd} />
          </LinearGradient>
        </Defs>
        <Path d={`M0,0 H${width} V${height} H0 Z`} fill="url(#bg)" />

        {/* 선 경로 (그려지는 애니메이션) */}
        <AnimatedPath
          d={pathD}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          // 핵심: 길이를 두 번 넣고 offset만 애니메이션
          strokeDasharray={`${totalLength}, ${totalLength}`}
          strokeDashoffset={dash as unknown as number}
        />

        {/* 중앙의 'K' (굵고 큼직하게) */}
        <SvgText
          x={cx}
          y={boxTop + (boxH * 0.64)}
          fill={color}
          fontSize={boxH * 0.9}
          fontWeight="bold"
          textAnchor="middle"
        >
          K
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({});
