"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Type, X, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'

// Component to render LaTeX math
function MathPreview({ latex }: { latex: string }) {
  const previewRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (previewRef.current && latex) {
      import('mathlive').then(() => {
        if (previewRef.current) {
          // Create a read-only math-field for preview
          previewRef.current.innerHTML = ''
          const preview = document.createElement('math-field') as MathfieldElement
          preview.value = latex
          preview.readOnly = true
          preview.style.fontSize = '1.25rem'
          preview.style.border = 'none'
          preview.style.padding = '0'
          preview.style.background = 'transparent'
          preview.style.cursor = 'default'
          previewRef.current.appendChild(preview)
        }
      })
    }
  }, [latex])
  
  return <div ref={previewRef} className="text-center" />
}

// Types for MathLive
interface MathfieldElement extends HTMLElement {
  value: string
  placeholder?: string
  smartMode?: boolean
  virtualKeyboardMode?: string
  readOnly?: boolean
  executeCommand: (command: any[]) => void
  focus: () => void
  style: CSSStyleDeclaration
}

interface MathInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  required?: boolean
  label?: string
}

export function MathInput({ 
  value, 
  onChange, 
  placeholder = "Saisissez votre texte ou formule mathématique...",
  className,
  rows = 4,
  required = false,
  label
}: MathInputProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mathfieldRef = useRef<MathfieldElement | null>(null)
  const [mode, setMode] = useState<'text' | 'math'>('text')
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (mode === 'math' && containerRef.current && !mathfieldRef.current) {
      // Dynamically import MathLive
      import('mathlive').then((ml) => {
        if (!containerRef.current) return
        
        // Create math-field element
        const mf = document.createElement('math-field') as MathfieldElement
        mf.className = cn(
          "w-full rounded-xl border-2 border-gray-200 dark:border-gray-700",
          "px-4 py-3 text-base bg-white dark:bg-gray-900",
          "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20",
          "transition-all min-h-[120px]"
        )
        
        // Configure MathLive with enhanced options
        mf.value = localValue
        mf.placeholder = placeholder
        mf.smartMode = true
        mf.virtualKeyboardMode = 'onfocus'
        
        // Set custom keyboard layouts - prioritize math symbols
        mf.setAttribute('virtual-keyboard-theme', 'material')
        mf.setAttribute('virtual-keyboards', 'numeric symbols alphabetic greek')
        mf.setAttribute('default-mode', 'math')
        mf.setAttribute('virtual-keyboard-container', 'body')
        
        // Disable customization menu
        mf.setAttribute('menu-items', '')  // Disable context menu
        mf.setAttribute('smart-fence', 'false')
        mf.setAttribute('smart-superscript', 'false')
        
        // Style customization
        mf.style.fontSize = '2.125rem'  // 34px - slightly larger for better readability
        mf.style.minHeight = `${rows * 2.5}rem`
        
        // Add event listener
        mf.addEventListener('input', (evt: Event) => {
          const target = evt.target as MathfieldElement
          const mathValue = target.value
          setLocalValue(mathValue)
          onChange(mathValue)
        })
        
        // Clear container and append
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(mf)
        mathfieldRef.current = mf
        
        // Focus
        setTimeout(() => mf.focus(), 100)
      }).catch(err => {
        console.error('Failed to load MathLive:', err)
      })
    }
    
    return () => {
      if (mathfieldRef.current) {
        mathfieldRef.current.remove()
        mathfieldRef.current = null
      }
    }
  }, [mode])

  useEffect(() => {
    setLocalValue(value)
    if (mathfieldRef.current && mode === 'math') {
      mathfieldRef.current.value = value
    }
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const switchMode = (newMode: 'text' | 'math') => {
    setMode(newMode)
    if (newMode === 'text' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }

  const insertMathSymbol = (symbol: string) => {
    if (mode === 'math' && mathfieldRef.current) {
      mathfieldRef.current.executeCommand(['insert', symbol])
      mathfieldRef.current.focus()
    } else if (mode === 'text' && textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newValue = localValue.slice(0, start) + symbol + localValue.slice(end)
      setLocalValue(newValue)
      onChange(newValue)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + symbol.length
          textareaRef.current.selectionEnd = start + symbol.length
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const toggleVirtualKeyboard = () => {
    if (mode === 'math' && mathfieldRef.current) {
      mathfieldRef.current.executeCommand(['toggleVirtualKeyboard'])
      mathfieldRef.current.focus()
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-base font-medium text-gray-900 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Mode Switcher & Quick Symbols */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('text')}
            className="h-8"
          >
            <Type className="h-4 w-4 mr-1" />
            Texte
          </Button>
          <Button
            type="button"
            variant={mode === 'math' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('math')}
            className="h-8"
          >
            <Calculator className="h-4 w-4 mr-1" />
            Math
          </Button>
          {mode === 'math' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleVirtualKeyboard}
              className="h-8"
              title="Afficher/Masquer le clavier virtuel"
            >
              <Keyboard className="h-4 w-4 mr-1" />
              Clavier
            </Button>
          )}
        </div>
        
        {/* Quick Math Symbols */}
        <div className="flex gap-1 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\sqrt{}')}
            className="h-8 px-2 font-mono"
            title="Racine carrée"
          >
            √
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\frac{}{}')}
            className="h-8 px-2 font-mono"
            title="Fraction"
          >
            ½
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('^{}')}
            className="h-8 px-2 font-mono"
            title="Exposant"
          >
            x²
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('_{}')}
            className="h-8 px-2 font-mono"
            title="Indice"
          >
            x₂
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\pi')}
            className="h-8 px-2 font-mono"
            title="Pi"
          >
            π
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\infty')}
            className="h-8 px-2 font-mono"
            title="Infini"
          >
            ∞
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\sum')}
            className="h-8 px-2 font-mono"
            title="Somme"
          >
            Σ
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertMathSymbol('\\int')}
            className="h-8 px-2 font-mono"
            title="Intégrale"
          >
            ∫
          </Button>
        </div>
      </div>

      {/* Input Area */}
      {mode === 'text' ? (
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={cn(
            "w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700",
            "rounded-xl px-4 py-3 text-base",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            "transition-all resize-none",
            className
          )}
        />
      ) : (
        <div 
          ref={containerRef}
          className="min-h-[120px]"
        />
      )}

      {/* Preview for Math Mode */}
      {mode === 'math' && localValue && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
            Aperçu de la formule :
          </p>
          <div className="bg-white dark:bg-gray-900 p-3 rounded-md border border-blue-100 dark:border-blue-900">
            <MathPreview latex={localValue} />
          </div>
          <details className="mt-2">
            <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-700">
              Voir le code LaTeX
            </summary>
            <code className="text-xs text-blue-600 dark:text-blue-400 font-mono break-all block mt-1">
              {localValue}
            </code>
          </details>
        </div>
      )}
    </div>
  )
}

// Single line math input for options
export function MathInputLine({ 
  value, 
  onChange, 
  placeholder = "Saisissez votre réponse...",
  className
}: Omit<MathInputProps, 'rows' | 'label' | 'required'>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mathfieldRef = useRef<MathfieldElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'text' | 'math'>('text')
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    if (mode === 'math' && containerRef.current && !mathfieldRef.current) {
      import('mathlive').then(() => {
        if (!containerRef.current) return
        
        const mf = document.createElement('math-field') as MathfieldElement
        mf.value = localValue
        mf.placeholder = placeholder
        mf.smartMode = true
        
        // Configure virtual keyboard - same as main MathInput
        mf.virtualKeyboardMode = 'onfocus'
        
        // Set custom keyboard layouts
        mf.setAttribute('virtual-keyboard-theme', 'material')
        mf.setAttribute('virtual-keyboards', 'numeric symbols alphabetic greek')
        mf.setAttribute('default-mode', 'math')
        mf.setAttribute('virtual-keyboard-container', 'body')
        
        // Apply exact requested styles
        mf.style.width = '100%'
        mf.style.fontSize = '1.25rem'
        mf.style.lineHeight = '3.75rem'
        mf.style.padding = '0.875rem 6rem 0.875rem 1rem'
        mf.style.borderRadius = '0.75rem'
        mf.style.minHeight = '56px'
        mf.style.height = '89px'
        mf.style.display = 'block'
        mf.style.boxShadow = 'none'
        mf.style.transition = 'all 0.2s ease'
        
        // Disable menu options
        mf.setAttribute('math-mode-space', '\\,')
        mf.setAttribute('inline-shortcut-timeout', '0')
        mf.setAttribute('smart-fence', 'false')
        mf.setAttribute('smart-superscript', 'false')
        mf.setAttribute('menu-items', '')  // Disable context menu
        
        // Dark mode check
        if (document.documentElement.classList.contains('dark')) {
          mf.style.background = 'rgb(17 24 39)'
          mf.style.border = '2px solid rgb(55 65 81)'
          mf.style.color = 'white'
        } else {
          mf.style.background = 'rgb(249 250 251)'
          mf.style.border = '2px solid rgb(209 213 219)'
        }
        
        mf.addEventListener('input', (evt: Event) => {
          const target = evt.target as MathfieldElement
          const mathValue = target.value
          setLocalValue(mathValue)
          onChange(mathValue)
        })
        
        mf.addEventListener('focus', () => {
          mf.style.borderColor = 'rgb(59 130 246)'
          mf.style.boxShadow = '0 0 0 3px rgb(59 130 246 / 0.1)'
        })
        
        mf.addEventListener('blur', () => {
          mf.style.borderColor = document.documentElement.classList.contains('dark') 
            ? 'rgb(55 65 81)' 
            : 'rgb(229 231 235)'
          mf.style.boxShadow = 'none'
        })
        
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(mf)
        mathfieldRef.current = mf
        
        // Focus after a delay
        setTimeout(() => {
          mf.focus()
        }, 100)
      })
    }
    
    return () => {
      if (mathfieldRef.current) {
        mathfieldRef.current.remove()
        mathfieldRef.current = null
      }
    }
  }, [mode])

  useEffect(() => {
    setLocalValue(value)
    if (mathfieldRef.current && mode === 'math') {
      mathfieldRef.current.value = value
    }
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const switchMode = (newMode: 'text' | 'math') => {
    setMode(newMode)
    if (newMode === 'text' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const toggleKeyboard = () => {
    if (mathfieldRef.current) {
      mathfieldRef.current.executeCommand(['toggleVirtualKeyboard'])
      mathfieldRef.current.focus()
    }
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      {mode === 'text' ? (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full border-2 rounded-xl pl-4 pr-14 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all hover:border-gray-400 dark:hover:border-gray-500"
          style={{ 
            fontSize: '1.25rem',
            height: '89px',
            lineHeight: '3.75rem',
            padding: '0.875rem 3.5rem 0.875rem 1rem',
            backgroundColor: document.documentElement.classList.contains('dark') ? 'rgb(17 24 39)' : 'rgb(249 250 251)',
            borderColor: document.documentElement.classList.contains('dark') ? 'rgb(55 65 81)' : 'rgb(209 213 219)'
          }}
        />
      ) : (
        <div ref={containerRef} className="w-full" />
      )}
      
      {mode === 'text' ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => switchMode('math')}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          title="Activer le mode Math"
        >
          <Calculator className="h-5 w-5 text-gray-500" />
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleKeyboard}
            className="absolute right-12 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Afficher/Masquer le clavier"
          >
            <Keyboard className="h-5 w-5 text-gray-500" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => switchMode('text')}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Mode Texte"
          >
            <Type className="h-5 w-5 text-gray-500" />
          </Button>
        </>
      )}
    </div>
  )
}