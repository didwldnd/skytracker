import axios from 'axios';
import { FlightSearchRequestDto } from '../types/FlightSearchRequestDto';

const API_BASE_URL = "http://192.168.219.10:8080/api/flights"; // wi-fi 바뀔때마다 설정

export async function searchFlights(request: FlightSearchRequestDto) {
    const response = await axios.post(`${API_BASE_URL}/search`, request);
    return response.data;
}
