// 프론트 백엔드 연결엔진
import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "../utils/tokenStorage";
import { API_BASE } from "../config/env";

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});