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
import HreflangTags from '@/components/HreflangTags'
import { ToastProvider } from '@/contexts/ToastContext'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Netown Arena - World Cup 2026 AI Predictions',
  description: 'AI-powered predictions, match analysis, and expert insights for the 2026 FIFA World Cup. Multi-model AI oracle with Dixon-Coles, ELO, xG analysis, and Gradient Boosting.',
  openGraph: {
    title: 'Netown Arena - AI Football Predictions',
    description: 'World Cup 2026 AI predictions. Multi-model ensemble, real-time match analysis, and community predictions.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://netown.cn',
    siteName: 'Netown Arena',
    images: [
      {
        url: '/api/og?type=match&home=World+Cup&away=2026&hWin=50&draw=25&aWin=25&score=?-?&confidence=99',
        width: 1200,
        height: 630,
        alt: 'Netown Arena - AI Football Predictions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Netown Arena - AI Football Predictions',
    description: 'World Cup 2026 AI predictions with ensemble models and expert analysis.',
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
        {/* Google Analytics - GA4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}`} />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'}');
          `,
        }} />
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
            <HreflangTags />
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