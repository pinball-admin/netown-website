import BracketChallenge from '@/components/football/BracketChallenge'

export const metadata = {
  title: 'Bracket Challenge - Netown World Cup 2026',
  description: 'Predict the World Cup 2026 knockout stage and compete with friends!',
}

export default function BracketPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BracketChallenge />
      </div>
    </main>
  )
}
