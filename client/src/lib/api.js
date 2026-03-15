import axios from 'axios'

// Set VITE_API_BASE when the frontend and backend are on different origins (e.g. Vercel + Render)
const baseURL = import.meta.env.VITE_API_BASE || ''

export const api = axios.create({
  baseURL: baseURL || '/',
  withCredentials: false,
})

export const getSocketUrl = () =>
  import.meta.env.VITE_SOCKET_URL || window.location.origin
