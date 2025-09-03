"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, X } from "lucide-react"

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Select2Props {
  options: Option[]
  value?: string | number
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  className?: string
  required?: boolean
  onChange?: (value: string | number) => void
  onClear?: () => void
}

export function Select2({
  options,
  value,
  placeholder = "Sélectionnez une option",
  searchable = true,
  clearable = false,
  disabled = false,
  className = "",
  required = false,
  onChange,
  onClear
}: Select2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(opt => opt.value === value)
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchTerm("")
      setHighlightedIndex(-1)
    }
  }

  const handleSelect = (option: Option) => {
    if (!option.disabled) {
      onChange?.(option.value)
      setIsOpen(false)
      setSearchTerm("")
      setHighlightedIndex(-1)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSearchTerm("")
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          flex items-center justify-between w-full px-4 py-3 
          bg-base-100 border-2 border-base-300 rounded-lg cursor-pointer
          transition-all duration-200 hover:border-primary/50
          ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${required && !selectedOption ? 'border-error' : ''}
          min-h-[48px]
        `}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
      >
        <span className={`truncate ${selectedOption ? 'text-base-content font-medium' : 'text-base-content/60'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2 ml-2">
          {clearable && selectedOption && !disabled && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-base-200 rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4 text-base-content/60" />
            </button>
          )}
          <ChevronDown 
            className={`h-5 w-5 text-base-content/60 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-base-100 border-2 border-base-300 rounded-lg shadow-xl max-h-64 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-base-300 bg-base-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-base-content/60" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setHighlightedIndex(-1)
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-base-100 border border-base-300 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
          )}
          
          <div className="max-h-52 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-6 text-center text-base-content/60 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Aucune option trouvée
              </div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`
                    px-4 py-3 cursor-pointer transition-all duration-150
                    ${index === highlightedIndex ? 'bg-primary/10 text-primary' : ''}
                    ${option.value === value ? 'bg-primary/20 text-primary font-semibold border-l-4 border-primary' : 'hover:bg-base-200'}
                    ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    flex items-center justify-between
                  `}
                  onClick={() => handleSelect(option)}
                >
                  <span className="text-sm">{option.label}</span>
                  {option.value === value && (
                    <span className="text-primary font-bold">✓</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}