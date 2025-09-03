"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function PageLoader() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => {
      setLoading(true)
      setProgress(10)
    }

    const handleComplete = () => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 200)
    }

    // Simuler le chargement pour les changements de route
    handleStart()
    
    // Progression progressive
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return prev + Math.random() * 20
        }
        return prev
      })
    }, 100)

    // Compléter après un délai
    const timeout = setTimeout(() => {
      clearInterval(interval)
      handleComplete()
    }, 800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
      <div 
        className="h-full bg-gradient-to-r from-primary via-secondary to-primary transition-all duration-300 ease-out shadow-lg"
        style={{ 
          width: `${Math.min(progress, 100)}%`,
          boxShadow: '0 0 10px rgba(255, 109, 0, 0.5)'
        }}
      />
    </div>
  )
}