import axios from 'axios';

export const getApiBaseUrl = () => {
  const savedUrl = localStorage.getItem('reloop_api_url');
  if (savedUrl && savedUrl.trim()) {
    return savedUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:8080/api';
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const setApiBaseUrl = (newUrl) => {
  if (newUrl) {
    const cleaned = newUrl.trim().replace(/\/+$/, '');
    localStorage.setItem('reloop_api_url', cleaned);
    apiClient.defaults.baseURL = cleaned;
  } else {
    localStorage.removeItem('reloop_api_url');
    apiClient.defaults.baseURL = 'http://localhost:8080/api';
  }
};

/** Axios interceptor already returns the Spring ApiResponse body. */
export const unwrap = (res) => {
  if (res && typeof res === 'object' && 'data' in res) return res.data;
  return res;
};

export const asList = (res) => {
  const data = unwrap(res);
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
};

export const asPage = (res) => {
  const data = unwrap(res);
  if (data?.content && Array.isArray(data.content)) return data;
  if (Array.isArray(data)) {
    return {
      content: data,
      page: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      last: true,
    };
  }
  return { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0, last: true };
};

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('reloop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const body = error.response?.data;
    const fieldErrors =
      body?.data && typeof body.data === 'object' && !Array.isArray(body.data)
        ? Object.values(body.data).filter((v) => typeof v === 'string').join(', ')
        : null;
    const errorMsg =
      (body?.message && fieldErrors ? `${body.message}: ${fieldErrors}` : null) ||
      body?.message ||
      body?.error ||
      fieldErrors ||
      (error.code === 'ECONNABORTED' ? 'Request timed out. Is the backend running on port 8080?' : null) ||
      error.message ||
      'Server connection error. Please verify backend is running on port 8080.';

    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('reloop_token');
      localStorage.removeItem('reloop_user');
      window.dispatchEvent(new Event('reloop-auth-expired'));
    }

    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
