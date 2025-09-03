"use client"

import { useState, useEffect } from "react"
import { Languages } from "lucide-react"

type Language = "fr" | "en"

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("fr")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    // Ici vous pourriez déclencher un changement de langue dans votre app
    console.log(`Langue changée vers: ${newLanguage}`)
  }

  const languages = [
    { key: "fr" as Language, label: "Français", flag: "🇫🇷" },
    { key: "en" as Language, label: "English", flag: "🇺🇸" }
  ]

  if (!mounted) return null

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <Languages className="h-5 w-5" />
      </div>
      <ul tabIndex={0} className="menu dropdown-content bg-base-100 rounded-box z-50 w-40 p-2 shadow-lg border border-base-300">
        {languages.map(({ key, label, flag }) => (
          <li key={key}>
            <button
              onClick={() => changeLanguage(key)}
              className={`flex items-center gap-3 ${language === key ? "bg-primary/20 text-primary" : ""}`}
            >
              <span className="text-lg">{flag}</span>
              {label}
              {language === key && <span className="ml-auto">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}