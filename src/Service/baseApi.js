let rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'
).trim().replace(/\/+$/, '');

// Fix https://localhost or https://127.0.0.1 to prevent ERR_SSL_PROTOCOL_ERROR in local dev
if (rawBaseUrl.startsWith('https://localhost') || rawBaseUrl.startsWith('https://127.0.0.1')) {
  rawBaseUrl = rawBaseUrl.replace(/^https:\/\//i, 'http://');
}

export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl}/api`;

/**
 * Standardized HTTP Request wrapper with token attachment & error formatting
 */
export const baseRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('gotech_hrms_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Auto-purge session if unauthorized / token expired
      if (response.status === 401) {
        localStorage.removeItem('gotech_hrms_token');
        localStorage.removeItem('gotech_hrms_user');
      }

      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const baseApi = {
  get: (endpoint, options = {}) => baseRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => baseRequest(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => baseRequest(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => baseRequest(endpoint, { ...options, method: 'DELETE' }),
};

export default baseApi;
