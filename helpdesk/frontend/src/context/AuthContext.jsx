import { createContext, useContext, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [usuario, setUsuario] = useState(() => {
    const stored = localStorage.getItem('usuario')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin(email, password)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    setToken(data.token)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setToken(null)
    setUsuario(null)
    navigate('/login')
  }, [navigate])

  const rol = usuario?.rol ?? null

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, rol }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
