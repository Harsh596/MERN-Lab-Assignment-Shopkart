import axios from 'axios';

// In production (e.g. on Vercel), set VITE_API_URL to your deployed backend URL.
// In local development, an empty string uses Vite's proxy configured in vite.config.js.
const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
