import axios, { AxiosError } from "axios";

const AMADEUS_API_BASE = "https://test.api.amadeus.com/v1";
const TOKEN = "t30Z2KwqJb3T5YH6SQhJlK4tG09t";

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
