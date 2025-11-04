import axios from 'axios'

// Use absolute API base for cross-origin deployments (e.g., Vercel front-end + Render API)
// Example: VITE_API_BASE=https://your-render-service.onrender.com
const baseURL = import.meta.env.VITE_API_BASE || ''

export const api = axios.create({
  baseURL: baseURL || '/',
  withCredentials: false,
})

export const getSocketUrl = () => {
  // Example: VITE_SOCKET_URL=https://your-render-service.onrender.com
  return import.meta.env.VITE_SOCKET_URL || window.location.origin
}
