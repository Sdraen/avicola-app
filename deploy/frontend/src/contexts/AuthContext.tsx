"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authAPI } from "../services/api"

interface User {
  id: number
  email: string
  rol: "admin" | "operador"
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, rol: "admin" | "operador", nombre: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)

      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  const register = async (email: string, password: string, rol: "admin" | "operador", nombre: string) => {
    try {
      const response = await authAPI.register(email, password, rol, nombre)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)

      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
