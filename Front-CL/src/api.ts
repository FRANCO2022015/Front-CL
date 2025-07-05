import axios from 'axios';

const api = axios.create({
  baseURL: 'https://0bpi7wr4ma.execute-api.us-east-1.amazonaws.com/dev', // Cambia según el endpoint base que uses más
});

export default api;