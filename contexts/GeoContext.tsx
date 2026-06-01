'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Region = 'CN' | 'GLOBAL'

export interface GeoContextType {
  region: Region
  isCN: boolean
  countryCode: string
}

const GeoContext = createContext<GeoContextType | undefined>(undefined)

export function GeoProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>('GLOBAL')
  const [isCN, setIsCN] = useState(false)
  const [countryCode, setCountryCode] = useState('US')

  useEffect(() => {
    const fetchGeoInfo = async () => {
      try {
        const response = await fetch('/api/geo/info')
        const data = await response.json()
        if (data.success) {
          setCountryCode(data.countryCode)
          setIsCN(data.isCN)
          setRegion(data.isCN ? 'CN' : 'GLOBAL')
        }
      } catch (error) {
        console.error('Failed to fetch geo info:', error)
      }
    }

    fetchGeoInfo()
  }, [])

  return (
    <GeoContext.Provider value={{ region, isCN, countryCode }}>
      {children}
    </GeoContext.Provider>
  )
}

export function useGeo() {
  const context = useContext(GeoContext)
  if (context === undefined) {
    throw new Error('useGeo must be used within a GeoProvider')
  }
  return context
}
