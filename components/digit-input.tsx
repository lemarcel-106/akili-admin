"use client"

import { useState, useRef, useEffect, KeyboardEvent } from "react"

interface DigitInputProps {
  length: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export default function DigitInput({ length, value, onChange, disabled = false, className = "" }: DigitInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Sync with parent value
  useEffect(() => {
    const newDigits = value.padEnd(length, '').slice(0, length).split('')
    setDigits(newDigits)
  }, [value, length])

  const handleChange = (index: number, newValue: string) => {
    // Only allow single digit
    const digit = newValue.replace(/\D/g, '').slice(-1)
    
    const newDigits = [...digits]
    newDigits[index] = digit
    setDigits(newDigits)
    
    // Update parent
    onChange(newDigits.join(''))
    
    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current is empty, move to previous
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current digit
        const newDigits = [...digits]
        newDigits[index] = ''
        setDigits(newDigits)
        onChange(newDigits.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (/^\d$/.test(e.key)) {
      // If typing a number, replace current digit and move to next
      e.preventDefault()
      handleChange(index, e.key)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pasteData) {
      const newDigits = pasteData.padEnd(length, '').slice(0, length).split('')
      setDigits(newDigits)
      onChange(pasteData)
      
      // Focus the next empty input or the last input
      const nextEmptyIndex = newDigits.findIndex((digit, i) => i < length && !digit)
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(pasteData.length, length - 1)
      inputRefs.current[focusIndex]?.focus()
    }
  }

  return (
    <div className={`flex gap-3 justify-center ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-14 text-center text-xl font-mono font-semibold
            bg-white/50 dark:bg-gray-700/50 
            border-2 border-gray-200 dark:border-gray-600
            rounded-xl
            focus:ring-2 focus:ring-primary focus:border-primary
            transition-all duration-200
            text-gray-800 dark:text-white
            disabled:opacity-50 disabled:cursor-not-allowed
            ${digits[index] ? 'border-primary/50 bg-primary/5' : ''}
          `}
          autoComplete="off"
        />
      ))}
    </div>
  )
}