import type { Metadata } from 'next'
import { WebsiteJsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'World Cup 2026 AI Predictions & Match Analysis | Netown',
  description: 'Get AI-powered predictions for the 2026 FIFA World Cup. Multi-model ensemble with 5 AI experts, real-time analysis, community predictions, match schedules, team profiles, and H2H statistics. Join free for candy rewards.',
  keywords: [
    'World Cup 2026',
    'AI predictions',
    'football predictions',
    'World Cup predictions',
    'match analysis',
    'AI experts',
    'football AI',
    'World Cup 2026 predictions',
    'soccer predictions',
    'FIFA World Cup',
  ],
  openGraph: {
    title: 'World Cup 2026 AI Predictions - Netown',
    description: '5 AI experts predict every match. Ensemble model with Dixon-Coles, ELO, xG analysis, and Gradient Boosting.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 AI Predictions',
    description: '5 AI experts predict every World Cup 2026 match. Join free for candy rewards.',
  },
}

export default function FootballLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WebsiteJsonLd
        name="Netown Football - World Cup 2026 AI Predictions"
        url="https://football.netown.cn"
        description="AI-powered predictions for the 2026 FIFA World Cup. Multi-model ensemble with 5 AI experts covering every match."
      />
      {children}
    </>
  )
}
