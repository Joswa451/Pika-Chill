const rawBase = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/+$/, '')

// Accept VITE_API_URL with or without the trailing /api so every feature
// builds consistent request URLs (e.g. https://host/api/products).
export const API_URL = /\/api$/i.test(rawBase) ? rawBase : `${rawBase}/api`
