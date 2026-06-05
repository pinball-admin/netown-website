import type { Metadata } from 'next'
import './globals.css'
import { I18nProvider } from '@/contexts/I18nContext'
import { ComplianceProvider } from '@/contexts/ComplianceContext'
import { PredictionProvider } from '@/contexts/PredictionContext'
import { GeoProvider } from '@/contexts/GeoContext'
import { AuthProvider } from '@/contexts/AuthContext'
import Footer from '@/components/Footer'
import ComplianceDisclaimer from '@/components/ComplianceDisclaimer'
import HtmlLangSync from '@/components/HtmlLangSync'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  title: 'Netown - Football Arena',
  description: 'AI Prediction Engine for World Cup 2026 - Multi-model AI oracle with Dixon-Coles, ELO, xG, and Gradient Boosting for football match predictions.',
  openGraph: {
    title: 'Netown - AI Football Predictions',
    description: 'World Cup 2026 AI predictions. 5 AI experts, ensemble models, real-time match analysis.',
    url: 'https://netown.ai',
    siteName: 'Netown',
    images: [
      {
        url: '/api/og?type=match&home=World+Cup&away=2026&hWin=50&draw=25&aWin=25&score=?-?&confidence=99',
        width: 1200,
        height: 630,
        alt: 'Netown AI Football Predictions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Netown - AI Football Predictions',
    description: 'World Cup 2026 AI predictions with ensemble models and 5 AI experts.',
    images: ['/api/og?type=match&home=World+Cup&away=2026&hWin=50&draw=25&aWin=25&score=?-?&confidence=99'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5668130183212955" crossOrigin="anonymous" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00FF66" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Netown" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <AuthProvider>
          <I18nProvider>
            <HtmlLangSync />
            <GeoProvider>
              <ComplianceProvider>
                <PredictionProvider>
                  <ToastProvider>
                    {children}
                    <ComplianceDisclaimer />
                    <Footer />
                  </ToastProvider>
                </PredictionProvider>
              </ComplianceProvider>
            </GeoProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}