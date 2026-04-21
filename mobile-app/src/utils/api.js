import axios from 'axios';
import BASE_URL from './constants';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // Local IP set for mobile/physical device testing
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
