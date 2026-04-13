import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.8.106:5000/api', // Local IP set for mobile/physical device testing
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
