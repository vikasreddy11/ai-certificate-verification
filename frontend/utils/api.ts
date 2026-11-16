import axios from 'axios';

<<<<<<< HEAD
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://certiverify-backend-rmvy.onrender.com').replace(/\/$/, '');
=======
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://certiverify-backend-rmvy.onrender.com'
).replace(/\/$/, '');
>>>>>>> 2e22d99 (updates)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 70000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function isTransientNetworkError(err: any): boolean {
  const status = err?.response?.status;
  if (!err?.response) return true;
  return status === 502 || status === 503 || status === 504;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withWakeRetry<T>(
  fn: () => Promise<T>,
  onRetry?: (attempt: number) => void
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (!isTransientNetworkError(err) || attempt === 3) {
        throw err;
      }
      onRetry?.(attempt + 1);
      await sleep(5000);
    }
  }
  throw lastError;
}

export function warmUpBackend(): void {
  api.get('/api/health').catch(() => {});
}

export default api;
