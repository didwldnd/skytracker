# ✈️ SkyTracker

항공편 검색·가격 알림·여행 계획을 한 곳에서 할 수 있는 크로스플랫폼 앱입니다.

[![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 미리보기

- **웹**: [https://didwldnd.github.io/skytracker/](https://didwldnd.github.io/skytracker/)

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **검색** | 출발지·도착지, 날짜, 인원·좌석·경유 조건으로 항공편 검색 |
| **알리미** | 원하는 구간 가격 알림 설정 및 관리 |
| **J플랜** | 여행 계획(J플랜) 화면 |
| **프로필** | 로그인, 테마(라이트/다크), 설정 관리 |
| **도시별 항공편** | 인기 도시별 항공편 목록 조회 |

- **다크/라이트 테마** 지원  
- **Google / Kakao / Naver** 소셜 로그인  
- **웹 · iOS · Android** 동시 지원 (Expo)

---

## 🛠 기술 스택

- **프레임워크**: [Expo](https://expo.dev/) 54, [React Native](https://reactnative.dev/)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **네비게이션**: React Navigation (Native Stack, Bottom Tabs)
- **UI**: React Native Paper, Lottie, Bottom Sheet
- **상태/컨텍스트**: Auth, Theme, UserSettings, PriceAlert

---

## 📦 설치 및 실행

### 요구 사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
git clone https://github.com/didwldnd/skytracker.git
cd skytracker
npm install
```

### 실행

```bash
# 웹
npx expo start --web

# Android
npm run android
# 또는
npx expo run:android

# iOS (macOS 필요)
npm run ios
# 또는
npx expo run:ios
```

### 웹 빌드 및 GitHub Pages 배포

```bash
npm run build:web   # dist 폴더에 빌드
npm run deploy      # gh-pages 브랜치로 배포
```

---

## 📁 프로젝트 구조

```
skytracker/
├── App.tsx                 # 앱 진입점, 네비게이션·프로바이더 설정
├── HomeScreen.tsx          # 하단 탭 (검색 / 알리미 / J플랜 / 프로필)
├── api/                    # API 클라이언트 (auth, user)
├── components/             # 공통 컴포넌트 (FlightCard, SearchModal 등)
├── config/                 # 환경 설정 (env)
├── context/                # Auth, Theme, UserSettings, PriceAlert
├── screens/                # 화면별 코드
│   ├── SearchScreen/       # 검색·날짜·인원·인기 도시
│   ├── FlightResultScreen/ # 검색 결과·상세
│   ├── PriceAlertScreen/   # 가격 알림
│   ├── JplanScreen/        # J플랜
│   ├── ProfileScreen/      # 프로필·설정
│   └── LoginScreen/        # 소셜 로그인
├── types/                  # DTO·타입 정의
└── utils/                  # API, 포맷터, Amadeus 등
```

---

## 📄 라이선스

MIT (또는 원하시는 라이선스로 수정 가능)

---

<p align="center">
  <sub>Made with ✈️ for travelers</sub>
</p>
