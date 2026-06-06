import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'World Cup 2026 Schedule - Full Match Fixtures & AI Predictions | Netown',
  description: 'Complete World Cup 2026 match schedule. View all 104 matches with dates, venues, group stage, knockout rounds, and AI-powered predictions for each game. Group stage runs June 11-June 26 in 16 host stadiums.',
  keywords: [
    'World Cup 2026 schedule',
    'match fixtures',
    'World Cup 2026 fixtures',
    'group stage',
    'knockout rounds',
    'World Cup 2026 venues',
    'match dates',
    'football schedule',
    'World Cup 2026 groups',
  ],
  openGraph: {
    title: 'World Cup 2026 Full Schedule & Fixtures',
    description: 'Complete match schedule for the 2026 FIFA World Cup. All 104 matches with AI predictions.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 Full Schedule',
    description: 'Complete fixture list with dates, venues, and AI predictions throughout the tournament.',
  },
}

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children
}
