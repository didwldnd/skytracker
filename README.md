# SkyTracker

**항공편 검색부터 가격 알림·여행 계획까지 한 앱에서 이어지는 크로스플랫폼 모바일·웹 서비스입니다.**  
Expo(React Native)와 TypeScript로 구현했으며, 동일한 코드베이스로 **웹 · iOS · Android**를 지원합니다.

| 항목 | 내용 |
|------|------|
| **라이브 데모 (웹)** | [https://didwldnd.github.io/skytracker/](https://didwldnd.github.io/skytracker/) |
| **저장소** | [https://github.com/didwldnd/skytracker](https://github.com/didwldnd/skytracker) |

---

## 주요 기능

### 검색·항공편

- **왕복 / 편도** 선택
- **출발·도착 공항** 선택, 공항 검색 모달(로컬 공항 데이터 기반)
- **가는 날 / 오는 날** 달력 선택
- **탑승 인원**(성인 등) 선택
- **좌석 등급**(일반석 등)·**경유**(직항만 등) 조건
- **인기·핫 노선** 섹션에서 노선 탐색 후 검색 조건으로 이어가기
- **직항 특가** 등 퀵 액션으로 자주 쓰는 흐름 바로가기
- 항공편 **검색 요청·로딩 UI** 후 결과 화면으로 이동
- 검색 결과 **목록** 및 항공편 **상세** 화면
- API 응답 기준 **동일 항공편 중복 정리** 후 **최저가** 위주로 표시
- **도시별 항공편** 화면(인기 도시 → 해당 도시 관련 항공편 흐름)

### 알리미(가격 알림)

- 항공편 **검색 결과**에서 조건에 맞는 **가격 알림 등록**(백엔드 POST)
- 서버에 등록된 **알림 목록** 조회
- 알림 **켜기/끄기**, **삭제**
- (로그인 사용자 기준) 백엔드 API와 연동

### J플랜

- **채팅형** 여행 일정·정보 안내(출발/도착/날짜/경유/인원 등 입력 가이드)
- 로그인 시 **대화 히스토리** 불러오기·이어서 질문

### 프로필·계정

- **Google / Kakao / Naver** 소셜 로그인(백엔드 OAuth + 앱 커스텀 스킴 리디렉션)
- **액세스·리프레시 토큰** `SecureStore` 저장, API 호출 시 갱신 흐름
- **프로필 조회·수정**, **로그아웃**, **회원 탈퇴**
- **라이트 / 다크 / 시스템** 테마 전환, OS 다크모드 연동·설정 **영속화**(`AsyncStorage`)
- 앱·알림 등 **사용자 설정** 관리

### 앱 공통

- **스플래시** 화면 후 메인 진입
- 하단 탭: **검색 · 알리미 · J플랜 · 프로필**
- **웹 · iOS · Android** 단일 코드베이스(Expo), 웹은 **GitHub Pages**로 배포 가능

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
