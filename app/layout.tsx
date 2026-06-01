import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/contexts/I18nContext'
import { ComplianceProvider } from '@/contexts/ComplianceContext'
import { PredictionProvider } from '@/contexts/PredictionContext'
import { UserProvider } from '@/contexts/UserContext'
import Footer from '@/components/Footer'
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer'

export const metadata: Metadata = {
  title: 'Netown - Football Arena',
  description: 'AI Prediction Engine for World Cup 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossOrigin="anonymous" />
      </head>
      <body>
        <I18nProvider>
          <ComplianceProvider>
            <PredictionProvider>
              <UserProvider>
                {children}
                <ComplianceDisclaimer />
                <Footer />
              </UserProvider>
            </PredictionProvider>
          </ComplianceProvider>
        </I18nProvider>
      </body>
    </html>
  )
}