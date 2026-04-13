import api from './axios'

export const login = (email, password) =>
  api.post('/api/auth/login', { email, password })

export const register = (datos) =>
  api.post('/api/auth/register', datos)
