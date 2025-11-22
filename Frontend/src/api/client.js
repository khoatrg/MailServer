import axios from 'axios';

const API_BASE_URL = process.env.API_BASE_URL || (typeof window !== 'undefined' && window.__env && window.__env.API_BASE_URL) || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// allow registering a handler to be called on 401 responses
let _on401 = null;
export function register401Handler(fn) { _on401 = fn; }

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401 && typeof _on401 === 'function') {
      try { _on401(err); } catch (e) { /* swallow */ }
    }
    return Promise.reject(err);
  }
);

export default api;
