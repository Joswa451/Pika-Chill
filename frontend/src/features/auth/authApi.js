import { API_URL } from '../../lib/apiBase';

const REQUEST_TIMEOUT_MS = 30000;

async function postJson(path, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: controller.signal
    });

    const raw = await res.text();
    let data = null;

    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
    }

    if (!res.ok) {
      throw new Error(data?.error || `Request failed (${res.status}). Please try again.`);
    }

    if (!data) {
      throw new Error('The server returned an invalid response. Please try again.');
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.', { cause: error });
    }
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the server. Please check your connection and try again.', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function registerRequest({
  email,
  password,
  fullName,
  contactNumber
}) {
  return postJson('/auth/register', {
    email,
    password,
    fullName,
    contactNumber
  });
}

export async function loginRequest({ email, password }) {
  return postJson('/auth/login', { email, password });
}
