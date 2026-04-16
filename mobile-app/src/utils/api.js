import axios from 'axios';
<<<<<<< HEAD

const api = axios.create({
    baseURL: 'http://192.168.8.106:5000/api', // Local IP set for mobile/physical device testing
=======
import BASE_URL from './constants';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // Local IP set for mobile/physical device testing
>>>>>>> origin/theekshana-IT24102753
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;
