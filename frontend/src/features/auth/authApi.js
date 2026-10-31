
const API_URL = (
  import.meta.env.VITE_API_URL || 'https://pika-chill.onrender.com'
).replace(/\/$/, '');

export async function registerRequest({
  email,
  password,
  fullName,
  contactNumber
}) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      contactNumber
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
}

export async function loginRequest({ email, password }) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
}
