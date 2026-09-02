import axios from 'axios';
import { tokenManager } from '../utils/tokenManager.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 Handling & Token Refresh Queue
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function parseFilename(disposition) {
  if (!disposition) return null;
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf?.[1]) return decodeURIComponent(utf[1].trim());
  const simple = /filename="?([^";]+)"?/i.exec(disposition);
  return simple?.[1]?.trim() || null;
}

api.interceptors.response.use(
  async (response) => {
    if (response.config?.responseType === 'blob') {
      const payload = response.data;
      const type = payload?.type || '';
      if (typeof Blob !== 'undefined' && payload instanceof Blob && type.includes('application/json')) {
        const text = await payload.text();
        let json = {};
        try {
          json = JSON.parse(text);
        } catch {
          json = {};
        }
        return Promise.reject({
          status: response.status,
          message: json.message || 'Unable to download file.',
          errors: json.errors || [],
        });
      }
      return {
        blob: payload,
        filename: parseFilename(response.headers?.['content-disposition']),
      };
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh-token');

    // Safe error message extractor (avoids exposing stack traces)
    let safeMessage =
      error.response?.data?.message ||
      (error.response?.data?.errors && error.response?.data?.errors[0]?.message) ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      'Unable to connect to the server. Please try again.';

    if (error.config?.responseType === 'blob' && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        if (json.message) safeMessage = json.message;
      } catch {
        // keep default
      }
    }

    const formattedError = {
      status,
      message: safeMessage,
      errors: error.response?.data?.errors || [],
    };

    // If 401 Unauthorized and not already refreshing / calling refresh endpoint
    if (status === 401 && !originalRequest._retry && !isAuthRefreshEndpoint) {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        tokenManager.clear();
        return Promise.reject(formattedError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        const newRefreshToken = refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken;

        if (newAccessToken) {
          tokenManager.setAccessToken(newAccessToken);
          if (newRefreshToken) tokenManager.setRefreshToken(newRefreshToken);

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh failed to return access token');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        tokenManager.clear();
        return Promise.reject(formattedError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formattedError);
  }
);
