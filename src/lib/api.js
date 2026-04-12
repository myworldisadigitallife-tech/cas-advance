export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function getToken() {
  if (typeof localStorage === 'undefined') {
    return '';
  }

  return localStorage.getItem('token') ?? '';
}

export function buildAuthHeaders(headers = {}) {
  const token = getToken();

  return token
    ? {
        ...headers,
        Authorization: `Token ${token}`
      }
    : headers;
}

/**
 * @param {Response} response
 * @param {string} fallbackMessage
 */
export async function readErrorMessage(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null);

    if (payload && typeof payload === 'object') {
      const firstValue = Object.values(payload)[0];

      if (Array.isArray(firstValue) && firstValue[0]) {
        return String(firstValue[0]);
      }

      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
  }

  const text = await response.text().catch(() => '');
  return text || fallbackMessage;
}