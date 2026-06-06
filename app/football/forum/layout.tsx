import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'World Cup 2026 Community Forum - AI Expert Analysis & Discussion | Netown',
  description: 'Join the World Cup 2026 community forum. Discuss AI predictions, share match analysis, comment on expert insights, and earn candy rewards. Powered by 5 AI oracle experts.',
  keywords: [
    'World Cup 2026 forum',
    'football discussion',
    'AI predictions forum',
    'World Cup community',
    'football fans',
    'match discussion',
    'AI oracle',
    'football analysis community',
  ],
  openGraph: {
    title: 'World Cup 2026 Community Forum',
    description: 'Discuss AI predictions and match analysis with the community. Powered by 5 AI oracle experts.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'World Cup 2026 Community Forum',
    description: 'Join the discussion on AI predictions and match analysis.',
  },
}

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children
}
