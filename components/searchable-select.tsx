"use client"

import React, { useEffect, useState } from 'react'
import Select, { StylesConfig } from 'react-select'
import { useTheme } from 'next-themes'

interface Option {
  value: any
  label: string
  [key: string]: any
}

interface SearchableSelectProps {
  options: Option[]
  value?: Option | null
  onChange?: (option: Option | null) => void
  placeholder?: string
  isDisabled?: boolean
  isClearable?: boolean
  isSearchable?: boolean
  instanceId?: string
  className?: string
  formatOptionLabel?: (option: Option) => React.ReactNode
  noOptionsMessage?: (obj: { inputValue: string }) => React.ReactNode
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "🔍 Tapez pour rechercher...",
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  instanceId,
  className = '',
  formatOptionLabel,
  noOptionsMessage
}) => {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = theme === 'dark'
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const customStyles: StylesConfig<Option, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '42px',
      backgroundColor: isDark ? 'rgb(17 24 39)' : 'white',
      borderColor: state.isFocused 
        ? 'rgb(139 92 246)' 
        : isDark 
        ? 'rgb(55 65 81)' 
        : 'rgb(209 213 219)',
      borderRadius: '0.5rem',
      borderWidth: state.isFocused ? '2px' : '1px',
      boxShadow: state.isFocused 
        ? '0 0 0 3px rgb(139 92 246 / 0.1)' 
        : 'none',
      transition: 'all 0.15s ease',
      '&:hover': {
        borderColor: state.isFocused ? 'rgb(139 92 246)' : isDark ? 'rgb(75 85 99)' : 'rgb(156 163 175)',
      },
      cursor: state.isDisabled ? 'not-allowed' : 'default',
      opacity: state.isDisabled ? 0.5 : 1,
      fontSize: '0.875rem',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(17 24 39)' : 'white',
      border: `1px solid ${isDark ? 'rgb(55 65 81)' : 'rgb(209 213 219)'}`,
      borderRadius: '0.5rem',
      boxShadow: isDark 
        ? '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 10px 10px -5px rgb(0 0 0 / 0.2)'
        : '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
      marginTop: '4px',
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px',
      maxHeight: '240px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'rgb(139 92 246)'
        : state.isFocused
        ? isDark
        ? 'rgb(139 92 246 / 0.15)'
        : 'rgb(245 243 255)'
        : 'transparent',
      color: state.isSelected
        ? 'white'
        : isDark
        ? 'rgb(229 231 235)'
        : 'rgb(17 24 39)',
      cursor: 'pointer',
      padding: '10px 12px',
      borderRadius: '0.375rem',
      margin: '2px 4px',
      fontSize: '0.875rem',
      fontWeight: state.isSelected ? '500' : '400',
      transition: 'all 0.15s',
      '&:active': {
        backgroundColor: 'rgb(139 92 246)',
        color: 'white',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(229 231 235)' : 'rgb(17 24 39)',
      fontSize: '0.875rem',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)',
      fontSize: '0.875rem',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(229 231 235)' : 'rgb(17 24 39)',
      fontSize: '0.875rem',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: isDark ? 'rgb(139 92 246 / 0.2)' : 'rgb(243 232 255)',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(243 244 246)' : 'rgb(139 92 246)',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(243 244 246)' : 'rgb(139 92 246)',
      '&:hover': {
        backgroundColor: 'rgb(239 68 68)',
        color: 'white',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)',
      padding: '4px',
      '&:hover': {
        color: 'rgb(239 68 68)',
      },
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)',
      padding: '8px',
      transition: 'transform 0.2s',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      '&:hover': {
        color: isDark ? 'rgb(209 213 219)' : 'rgb(107 114 128)',
      },
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)',
      padding: '20px',
      fontSize: '0.875rem',
    }),
    loadingMessage: (provided) => ({
      ...provided,
      color: isDark ? 'rgb(107 114 128)' : 'rgb(156 163 175)',
      padding: '20px',
      fontSize: '0.875rem',
    }),
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`h-[42px] w-full rounded-lg border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'} ${className}`} />
    )
  }
  
  return (
    <div className={`w-full ${className}`}>
      <Select
        instanceId={instanceId || `select-${Date.now()}`}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={noOptionsMessage || ((obj) => 
          obj.inputValue ? `Aucun résultat pour "${obj.inputValue}"` : "Aucune option disponible"
        )}
        loadingMessage={() => "Chargement..."}
        formatOptionLabel={formatOptionLabel}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition="fixed"
        menuPlacement="auto"
      />
    </div>
  )
}

export default SearchableSelect