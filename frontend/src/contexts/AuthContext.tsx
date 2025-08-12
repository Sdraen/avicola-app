"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react"
import { authAPI } from "../services/api"
import { useIdleTimer } from "../hooks/useIdleTimer"
import { showSessionExpiredAlert, showSessionRestoredToast } from "../utils/sweetAlert"

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
  refreshToken: () => Promise<void>
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

  // Configuración del timeout de inactividad
  const IDLE_TIMEOUT = 5 * 60 * 1000 // 5 minutos
  const WARNING_TIME = 30 * 1000 // 30 segundos de advertencia

  // OPTIMIZADO: Memoizar funciones para evitar re-creaciones
  const isTokenExpiringSoon = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000
      const timeUntilExpiry = payload.exp - currentTime
      return timeUntilExpiry < 3600
    } catch (error) {
      console.error("Error parsing token:", error)
      return true
    }
  }, [])

  const logout = useCallback(() => {
    console.log("🚪 Cerrando sesión")
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }, [])

  // OPTIMIZADO: Memoizar refreshToken para evitar dependencias circulares
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentToken = localStorage.getItem("token")
      if (!currentToken) return

      const response = await authAPI.verifyToken()
      if (response.data.user) {
        setUser(response.data.user)
        console.log("✅ Token verificado y usuario actualizado")
      }
    } catch (error: any) {
      console.error("❌ Error al verificar token:", error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log("🔄 Token inválido, cerrando sesión")
        logout()
      }
    }
  }, [logout])

  // OPTIMIZADO: Memoizar handlers para evitar re-creaciones
  const handleIdle = useCallback(async () => {
    if (user) {
      console.log("⏰ Sesión expirada por inactividad (5 minutos)")
      await showSessionExpiredAlert()
      logout()
    }
  }, [user, logout])

  const handleWarning = useCallback(() => {
    console.log("⚠️ Mostrando advertencia de inactividad")
  }, [])

  // OPTIMIZADO: Hook de inactividad con configuración optimizada
  useIdleTimer({
    timeout: IDLE_TIMEOUT,
    warningTime: WARNING_TIME,
    onIdle: handleIdle,
    onWarning: handleWarning,
    enabled: !!user,
    showWarning: true,
    events: ["mousedown", "keypress", "click"], // REDUCIDO - sin mousemove ni scroll
  })

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token")
      const storedUser = localStorage.getItem("user")

      if (storedToken && storedUser) {
        try {
          if (isTokenExpiringSoon(storedToken)) {
            console.log("⚠️ Token próximo a expirar, verificando con servidor")
            await refreshToken()
          } else {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
            console.log("✅ Sesión restaurada desde localStorage")
            showSessionRestoredToast()
          }
        } catch (error) {
          console.error("❌ Error al inicializar auth:", error)
          logout()
        }
      }
      setLoading(false)
    }

    initializeAuth()
  }, [isTokenExpiringSoon, refreshToken, logout])

  // OPTIMIZADO: Auto-refresh menos frecuente
  useEffect(() => {
    if (!token) return

    const interval = setInterval(
      () => {
        console.log("🔄 Verificación automática de token")
        refreshToken()
      },
      30 * 60 * 1000, // 30 minutos
    )

    return () => clearInterval(interval)
  }, [token, refreshToken])

  // Verificar token cuando la ventana recupera el foco
  useEffect(() => {
    const handleFocus = () => {
      if (token) {
        console.log("👁️ Ventana recuperó foco, verificando token")
        refreshToken()
      }
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [token, refreshToken])

  // ELIMINADO: El toast intermedio que se ejecutaba cada 3 minutos
  // Esto reducirá la carga de timers

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))
      console.log("✅ Login exitoso")
    } catch (error) {
      console.error("❌ Error en login:", error)
      throw error
    }
  }, [])

  const register = useCallback(async (email: string, password: string, rol: "admin" | "operador", nombre: string) => {
    try {
      const response = await authAPI.register(email, password, rol, nombre)
      const { token: newToken, user: userData } = response.data

      setToken(newToken)
      setUser(userData)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))
      console.log("✅ Registro exitoso")
    } catch (error) {
      console.error("❌ Error en registro:", error)
      throw error
    }
  }, [])

  // OPTIMIZADO: Memoización más estricta
  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      loading,
      refreshToken,
    }),
    [user, token, login, register, logout, loading, refreshToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
