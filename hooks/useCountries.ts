import { useState, useEffect } from 'react'
import { dataAPI, Country } from '@/lib/data-api'

interface UseCountriesResult {
  countries: Country[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCountries(): UseCountriesResult {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCountries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await dataAPI.getCountries()
      
      if (response.data && Array.isArray(response.data)) {
        setCountries(response.data)
        if (process.env.NODE_ENV === 'development') {
          console.log('Pays chargés:', response.data.length)
        }
      } else if (response.status === 200) {
        // Parfois l'API peut retourner un format différent
        const data = response.data as any
        const countryList = data?.results || data?.countries || data || []
        if (Array.isArray(countryList)) {
          setCountries(countryList)
        } else {
          console.warn('Format de réponse inattendu pour les pays:', response)
          setCountries([])
          setError('Format de données incorrect')
        }
      } else {
        setError('Erreur lors du chargement des pays')
        setCountries([])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des pays:', error)
      setError('Erreur de connexion')
      setCountries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCountries()
  }, [])

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries
  }
}