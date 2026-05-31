'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Region = 'CN' | 'OVERSEAS'

interface ComplianceContextType {
  region: Region
  isWeb3Enabled: boolean
  isPureDataMode: boolean
  checkRegion: () => Promise<void>
  supportedLanguages: string[]
}

const defaultContext: ComplianceContextType = {
  region: 'OVERSEAS',
  isWeb3Enabled: true,
  isPureDataMode: false,
  checkRegion: async () => {},
  supportedLanguages: ['en', 'es', 'de', 'it', 'ja', 'ko', 'pt'],
}

const ComplianceContext = createContext<ComplianceContextType>(defaultContext)

export function ComplianceProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState<Region>('OVERSEAS')
  const [isChecked, setIsChecked] = useState(false)

  const checkRegion = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      const response = await fetch('https://ipapi.co/json/', { signal: controller.signal })
      clearTimeout(timeoutId)
        if (response.ok) {
          const data = await response.json()
          const countryCode = data?.country_code || data?.countryCode

          if (countryCode === 'CN' || countryCode === 'China') {
            setRegion('CN')
          } else {
            setRegion('OVERSEAS')
          }
        }
      } catch {
      const browserLang = navigator.language.toLowerCase()
      if (browserLang.startsWith('zh')) {
        setRegion('CN')
      } else {
        setRegion('OVERSEAS')
      }
    } finally {
      setIsChecked(true)
    }
  }

  useEffect(() => {
    checkRegion()
  }, [])

  const isWeb3Enabled = region === 'OVERSEAS'
  const isPureDataMode = region === 'CN'

  return (
    <ComplianceContext.Provider
      value={{
        region,
        isWeb3Enabled,
        isPureDataMode,
        checkRegion,
        supportedLanguages: defaultContext.supportedLanguages,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  )
}

export function useCompliance() {
  return useContext(ComplianceContext)
}

export { ComplianceContext }
