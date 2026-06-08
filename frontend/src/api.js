// Centralized API helper:
// - In development, keep requests relative (proxy in vite.config.js forwards /api to localhost:8080)
// - In production (Railway), point to the backend service by setting VITE_API_BASE_URL
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  if (!path) return API_BASE;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!API_BASE) return path; // relative, so dev proxy works
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}

