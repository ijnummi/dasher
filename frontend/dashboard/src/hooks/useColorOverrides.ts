import { useState, useCallback } from 'react'

const LS_KEY = 'dasher:widget-colors'

function readLS(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

/**
 * Manages per-widget color overrides stored in localStorage.
 * Used as an optimistic cache on top of the API's background_color field.
 */
export function useColorOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>(readLS)

  const setColor = useCallback((id: string, color: string | null) => {
    setOverrides((prev) => {
      const next = { ...prev }
      if (color === null) {
        delete next[id]
      } else {
        next[id] = color
      }
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { overrides, setColor }
}
