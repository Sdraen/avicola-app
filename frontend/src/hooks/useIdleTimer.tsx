"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { showSessionWarningAlert } from "../utils/sweetAlert"

interface UseIdleTimerProps {
  timeout: number
  warningTime?: number
  onIdle: () => void
  onWarning?: () => void
  events?: string[]
  enabled?: boolean
  showWarning?: boolean
}

// Función de throttle para limitar la frecuencia de ejecución
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const useIdleTimer = ({
  timeout,
  warningTime = 30000, // 30 segundos por defecto
  onIdle,
  onWarning,
  events = ["mousedown", "keypress", "click"], // REDUCIDOS - sin mousemove y scroll
  enabled = true,
  showWarning = true,
}: UseIdleTimerProps) => {
  const [isWarningShown, setIsWarningShown] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const onIdleRef = useRef(onIdle)
  const onWarningRef = useRef(onWarning)

  useEffect(() => {
    onIdleRef.current = onIdle
    onWarningRef.current = onWarning
  }, [onIdle, onWarning])

  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
  }, [])

  const showWarningModal = useCallback(async () => {
    if (!showWarning) return

    setIsWarningShown(true)
    onWarningRef.current?.()

    const result = await showSessionWarningAlert(warningTime / 1000)

    if (result.isConfirmed) {
      setIsWarningShown(false)
      resetTimer()
    } else {
      onIdleRef.current()
    }
  }, [warningTime, showWarning])

  // OPTIMIZADO: Throttle del resetTimer para evitar ejecuciones excesivas
  const resetTimer = useCallback(
    throttle(() => {
      if (!enabled) return

      const now = Date.now()
      lastActivityRef.current = now

      clearAllTimers()
      setIsWarningShown(false)

      if (showWarning) {
        warningTimeoutRef.current = setTimeout(() => {
          showWarningModal()
        }, timeout - warningTime)

        timeoutRef.current = setTimeout(() => {
          if (!isWarningShown) {
            onIdleRef.current()
          }
        }, timeout)
      } else {
        timeoutRef.current = setTimeout(() => {
          onIdleRef.current()
        }, timeout)
      }
    }, 1000), // Throttle a 1 segundo - máximo 1 ejecución por segundo
    [timeout, warningTime, clearAllTimers, showWarningModal, enabled, showWarning, isWarningShown],
  )

  const continueSession = useCallback(() => {
    setIsWarningShown(false)
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    if (!enabled) {
      clearAllTimers()
      setIsWarningShown(false)
      return
    }

    resetTimer()

    // OPTIMIZADO: Usar passive listeners para mejor performance
    const options = { passive: true }

    events.forEach((event) => {
      document.addEventListener(event, resetTimer, options)
    })

    return () => {
      clearAllTimers()
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [resetTimer, events, clearAllTimers, enabled])

  return {
    resetTimer,
    continueSession,
    isWarningShown,
  }
}
