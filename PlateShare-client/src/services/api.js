const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalApiUrl = configuredApiUrl && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(`${configuredApiUrl}/`);
const API_URL = (
  import.meta.env.PROD && isLocalApiUrl
    ? '/api'
    : configuredApiUrl || (import.meta.env.DEV ? 'http://127.0.0.1:5001/api' : '/api')
).replace(/\/$/, '');

export async function api(path, options = {}) {
  const headers = { ...options.headers };
  const token = localStorage.getItem('plateshare.token');

  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    localStorage.removeItem('plateshare.token');
    window.dispatchEvent(new Event('plateshare:auth-expired'));
  }
  if (!response.ok)
    throw new Error(data.message || 'The request could not be completed.');
  return data;
}
