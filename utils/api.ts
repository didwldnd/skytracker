import axios from 'axios';
import { FlightSearchRequestDto } from '../types/FlightSearchRequestDto';

export const API_BASE_URL = "http://10.200.4.224:8080/api/flights";

export async function searchFlights(request: FlightSearchRequestDto) {
    const response = await axios.post(`${API_BASE_URL}/search`, request);
    return response.data;
}
