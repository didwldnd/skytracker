# RN 0.79.x/Expo 53 개발용
FROM node:18-bullseye

# 기본 빌드 툴 (native 모듈 컴파일 대비)
RUN apt-get update && apt-get install -y \
  python3 make g++ git openssh-client \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Windows 바인드마운트에서 파일변경 감지를 위해 폴링 사용
ENV CHOKIDAR_USEPOLLING=1
ENV WATCHPACK_POLLING=true

# 포트: Metro(8081), Expo dev(19000,19001)
EXPOSE 8081 19000 19001

# 컨테이너 기본 명령 (필요시 변경 가능)
CMD ["sh", "-c", "npm ci || npm install && npx expo start --host lan --port 8081"]
