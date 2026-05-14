# SkyTracker

**항공편 검색부터 가격 알림·여행 계획까지 한 앱에서 이어지는 크로스플랫폼 모바일·웹 서비스입니다.**  
Expo(React Native)와 TypeScript로 구현했으며, 동일한 코드베이스로 **웹 · iOS · Android**를 지원합니다.

| 항목 | 내용 |
|------|------|
| **라이브 데모 (웹)** | [https://didwldnd.github.io/skytracker/](https://didwldnd.github.io/skytracker/) |
| **저장소** | [https://github.com/didwldnd/skytracker](https://github.com/didwldnd/skytracker) |

---

## 인사·채용 담당자께 (한 페이지 요약)

- **사용자 관점의 문제 정의**: API가 동일 항공편을 여러 번 반환하는 현실을 반영해, “같은 비행”을 어떻게 정의할지부터 설계했습니다. 항공사·편명·공항·출발·도착 시각을 기준으로 한 **고유 키**와 `Map` 기반 **중복 제거·최저가 유지** 로직으로 검색 결과의 신뢰도를 높였습니다.
- **백엔드와 프론트의 경계 정리**: 백엔드는 **leg(구간) 단위**로 내려오고, 화면은 **왕복 한 건**으로 다루어야 합니다. `utils/mapBackendFlight.ts`에 **단일 매핑 레이어**를 두어 DTO 변환을 한곳에 모았고, 예약 가능 좌석 등은 여러 구간 중 **보수적(최소값)** 기준으로 표시하도록 했습니다.
- **제품 완성도**: 시스템·라이트·다크 테마, OS 설정 연동, `AsyncStorage`로 설정 **영속화**. Google·Kakao·Naver **소셜 로그인**과 보안 저장소 연동으로 계정 흐름을 구성했습니다.
- **배포 경험**: 웹 빌드 후 **GitHub Pages**로 배포해, 코드뿐 아니라 **실제 동작하는 결과물**으로 검증 가능합니다.

기술 스택과 실행 방법은 아래에 정리했습니다.

---

## 주요 기능

| 영역 | 설명 |
|------|------|
| 검색 | 출발·도착, 날짜, 인원·좌석·경유 조건, 인기 도시 기반 탐색 |
| 알리미 | 관심 구간 **가격 알림** 설정·관리 |
| J플랜 | 여행 계획 화면 |
| 프로필 | 로그인, 테마·설정 |
| 플랫폼 | 웹 / iOS / Android (Expo 단일 프로젝트) |

---

## 기술 스택

| 구분 | 사용 기술 |
|------|------------|
| 프레임워크 | Expo 54, React Native 0.81 |
| 언어 | TypeScript 5.9 |
| 네비게이션 | React Navigation (Native Stack, Bottom Tabs) |
| UI | React Native Paper, Bottom Sheet, Lottie |
| 상태·컨텍스트 | 인증, 테마, 사용자 설정, 가격 알림 등 도메인별 Context |
| 네트워크 | Axios, Amadeus·자체 API 연동 |
| 기타 | Reanimated, Gesture Handler, Secure Store, OAuth |

---

## 실행 방법 (로컬 검증)

**요구 사항**: Node.js 18 이상, npm 또는 yarn

```bash
git clone https://github.com/didwldnd/skytracker.git
cd skytracker
npm install
npx expo start --web    # 웹
npm run android         # Android 네이티브 빌드
# iOS는 macOS에서: npm run ios
```

웹 정적 배포:

```bash
npm run build:web
npm run deploy
```

---

## 코드 구조 (요약)

```
skytracker/
├── App.tsx              # 진입점, 네비게이션·프로바이더
├── HomeScreen.tsx       # 하단 탭
├── components/          # 공통 UI (검색 모달, 카드 등)
├── context/             # Auth, Theme, UserSettings, PriceAlert
├── screens/             # 검색·결과·알림·J플랜·프로필·로그인
├── utils/               # API, OAuth, mapBackendFlight 등
└── types/               # 타입·DTO
```

---

## 라이선스

MIT
