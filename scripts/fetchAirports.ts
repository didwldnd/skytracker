import axios, { AxiosError } from "axios";

const AMADEUS_API_BASE = "https://test.api.amadeus.com/v1";
const TOKEN = process.env.AMADEUS_ACCESS_TOKEN?.trim();

interface AmadeusAirport {
  address?: {
    cityName?: string;
  };
  name: string;
  iataCode: string;
}

interface SimplifiedAirport {
  city: string;
  airport: string;
  code: string;
}

async function fetchAirports(keyword: string): Promise<void> {
  if (!TOKEN) {
    console.error("AMADEUS_ACCESS_TOKEN 환경 변수를 설정하세요 (로컬 .env는 커밋하지 마세요).");
    process.exit(1);
  }
  try {
    const res = await axios.get(`${AMADEUS_API_BASE}/reference-data/locations`, {
      params: {
        subType: "AIRPORT,CITY",
        keyword,
      },
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    });

    const formatted: SimplifiedAirport[] = res.data.data.map((item: AmadeusAirport) => ({
      city: item.address?.cityName || item.name,
      airport: item.name,
      code: item.iataCode,
    }));

    console.log("✈️ 결과:", formatted);
  } catch (err: unknown) {
    const error = err as AxiosError;
    if (error.response) {
      console.error("❌ 오류 발생:", error.response.data);
    } else {
      console.error("❌ 일반 오류:", error.message);
    }
  }
}

fetchAirports("incheon");