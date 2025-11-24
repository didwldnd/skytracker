import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getAccessToken } from "../utils/tokenStorage";

// 1. AuthState 타입 정의
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
}

// 2. Context에서 제공할 값 타입 정의
interface AuthContextType {
  authState: AuthState;
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 3. createContext에 null 대신 "AuthContextType | null" 넣기
export const AuthContext = createContext<AuthContextType | null>(null);

// 4. Provider props 타입 명시
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
  });

  // 앱 시작 시 저장된 토큰 로드
useEffect(() => {
  async function load() {
    const token = await getAccessToken();

    // ❗ 이미 로그인 중이면 덮어쓰지 말아야 함
    setAuthState(prev => {
      if (prev.isAuthenticated) {
        return prev; // 🔥 이미 로그인 반영된 상태면 그대로 유지
      }

      if (token) {
        return { isAuthenticated: true, accessToken: token };
      }
      return { isAuthenticated: false, accessToken: null };
    });
  }
  load();
}, []);


  const login = async (token: string) => {
    setAuthState({
      isAuthenticated: true,
      accessToken: token,
    });
  };

  const logout = async () => {
    setAuthState({
      isAuthenticated: false,
      accessToken: null,  
    });
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
