import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, name, email: userEmail } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ name, email: userEmail }))
    setUser({ name, email: userEmail })
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    const { token, name: n, email: e } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify({ name: n, email: e }))
    setUser({ name: n, email: e })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
