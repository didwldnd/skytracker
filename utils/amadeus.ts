import axios, { AxiosError } from "axios";

const AMADEUS_API_BASE = "https://test.api.amadeus.com/v1";
const TOKEN = "t30Z2KwqJb3T5YH6SQhJlK4tG09t"; // 실제 운영에선 백엔드 보안 처리 추천

export async function fetchAirports(keyword: string) {
  if (keyword.trim().length < 2) return [];

  try {
    const response = await axios.get(`${AMADEUS_API_BASE}/reference-data/locations`, {
      params: {
        subType: "AIRPORT,CITY",
        keyword,
      },
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    return (response.data.data || []).map((item: any) => ({
      city: item.address?.cityName ?? item.name,
      airport: item.name,
      code: item.iataCode,
    }));
  } catch (err) {
    const error = err as AxiosError;
    console.error("❌ Amadeus 공항 검색 실패:", error.response?.data || error.message);
    return [];
  }
}
