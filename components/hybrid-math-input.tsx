"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Type, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for MathLive
interface MathfieldElement extends HTMLElement {
  value: string
  placeholder?: string
  smartMode?: boolean
  virtualKeyboardMode?: string
  readOnly?: boolean
  executeCommand: (command: any[]) => void
  focus: () => void
  blur: () => void
  style: CSSStyleDeclaration
}

interface HybridMathInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  required?: boolean
  label?: string
}

interface ContentBlock {
  id: string
  type: 'text' | 'math'
  content: string
}

export function HybridMathInput({ 
  value, 
  onChange, 
  placeholder = "Saisissez votre texte et vos formules mathématiques...",
  className,
  rows = 4,
  required = false,
  label
}: HybridMathInputProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => {
    // Parse the initial value to extract text and math blocks
    if (!value) return [{ id: '1', type: 'text', content: '' }]
    
    // Simple parsing: math blocks are wrapped in $$...$$ or $...$
    const parts = value.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g)
    return parts.filter(part => part).map((part, index) => ({
      id: String(index + 1),
      type: part.startsWith('$') ? 'math' : 'text',
      content: part.replace(/^\$+|\$+$/g, '')
    }))
  })
  
  const [activeBlockId, setActiveBlockId] = useState<string>('1')
  const containerRef = useRef<HTMLDivElement>(null)

  // Update parent when blocks change
  useEffect(() => {
    const newValue = blocks.map(block => {
      if (block.type === 'math') {
        return `$$${block.content}$$`
      }
      return block.content
    }).join('')
    onChange(newValue)
  }, [blocks])

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ))
  }

  const addMathBlock = () => {
    const newId = String(Date.now())
    const activeIndex = blocks.findIndex(b => b.id === activeBlockId)
    const newBlock: ContentBlock = { id: newId, type: 'math', content: '' }
    
    const newBlocks = [...blocks]
    newBlocks.splice(activeIndex + 1, 0, newBlock)
    setBlocks(newBlocks)
    setActiveBlockId(newId)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return
    setBlocks(prev => prev.filter(block => block.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId)
    
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      // Add a new text block after current
      const newId = String(Date.now())
      const newBlock: ContentBlock = { id: newId, type: 'text', content: '' }
      const newBlocks = [...blocks]
      newBlocks.splice(blockIndex + 1, 0, newBlock)
      setBlocks(newBlocks)
      setActiveBlockId(newId)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-base font-medium text-gray-900 dark:text-gray-100">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
        {blocks.map((block, index) => (
          <div key={block.id} className="relative group">
            {block.type === 'text' ? (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                onFocus={() => setActiveBlockId(block.id)}
                onKeyDown={(e) => handleKeyDown(e, block.id)}
                placeholder={index === 0 ? placeholder : "Continuez votre texte..."}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                rows={2}
                style={{ fontSize: '1.125rem' }}
              />
            ) : (
              <MathBlock
                value={block.content}
                onChange={(content) => updateBlock(block.id, content)}
                onFocus={() => setActiveBlockId(block.id)}
                onDelete={() => deleteBlock(block.id)}
              />
            )}
          </div>
        ))}
        
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMathBlock}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Ajouter une formule
          </Button>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            Shift+Enter pour nouvelle ligne • Les formules sont entre $$...$$
          </div>
        </div>
      </div>
    </div>
  )
}

function MathBlock({ 
  value, 
  onChange, 
  onFocus,
  onDelete 
}: { 
  value: string
  onChange: (value: string) => void
  onFocus: () => void
  onDelete: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mathfieldRef = useRef<MathfieldElement | null>(null)

  useEffect(() => {
    if (containerRef.current && !mathfieldRef.current) {
      import('mathlive').then(() => {
        if (!containerRef.current) return
        
        const mf = document.createElement('math-field') as MathfieldElement
        mf.value = value
        mf.placeholder = "Entrez votre formule mathématique..."
        mf.smartMode = true
        mf.virtualKeyboardMode = 'onfocus'
        
        // Style
        mf.style.width = '100%'
        mf.style.fontSize = '1.25rem'
        mf.style.padding = '0.75rem'
        mf.style.borderRadius = '0.5rem'
        mf.style.border = '2px solid rgb(147 197 253)'
        mf.style.background = 'rgb(239 246 255)'
        mf.style.minHeight = '60px'
        
        if (document.documentElement.classList.contains('dark')) {
          mf.style.background = 'rgb(30 58 138)'
          mf.style.borderColor = 'rgb(59 130 246)'
          mf.style.color = 'white'
        }
        
        mf.setAttribute('virtual-keyboard-theme', 'material')
        mf.setAttribute('virtual-keyboards', 'numeric symbols alphabetic greek')
        mf.setAttribute('menu-items', '')
        
        mf.addEventListener('input', (evt: Event) => {
          const target = evt.target as MathfieldElement
          onChange(target.value)
        })
        
        mf.addEventListener('focus', () => {
          onFocus()
          mf.style.borderColor = 'rgb(59 130 246)'
        })
        
        mf.addEventListener('blur', () => {
          mf.style.borderColor = document.documentElement.classList.contains('dark') 
            ? 'rgb(59 130 246)' 
            : 'rgb(147 197 253)'
        })
        
        containerRef.current.appendChild(mf)
        mathfieldRef.current = mf
      })
    }
    
    return () => {
      if (mathfieldRef.current) {
        mathfieldRef.current.remove()
        mathfieldRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mathfieldRef.current && mathfieldRef.current.value !== value) {
      mathfieldRef.current.value = value
    }
  }, [value])

  return (
    <div className="relative">
      <div ref={containerRef} />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        title="Supprimer cette formule"
      >
        ×
      </Button>
    </div>
  )
}