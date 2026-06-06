// Quiz generator - creates questions from worldCupHistory data
// Pure functions with no database access

import { worldCupHistory, WorldCupTournament } from '@/libs/data/worldcup-history'

export interface QuizQuestion {
  question: string
  options: string[]
  correctOption: number  // 0-3
  explanation: string
  funFact: string | null
  year: number
}

function pickRandom<T>(arr: T[], exclude: T[] = []): T {
  const filtered = arr.filter(item => !exclude.includes(item))
  return filtered[Math.floor(Math.random() * filtered.length)]
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function buildOptions(correct: string, distractors: string[]): { options: string[]; correctIndex: number } {
  const pool = distractors.filter(d => d !== correct).slice(0, 3)
  while (pool.length < 3) {
    pool.push('Unknown')
  }
  const all = shuffleArray([correct, ...pool.slice(0, 3)])
  return { options: all, correctIndex: all.indexOf(correct) }
}

// Collect unique values across all tournaments for distractor generation
const allChampions = Object.values(worldCupHistory).map(t => t.champion)
const allRunnersUp = Object.values(worldCupHistory).map(t => t.runnerUp)
const allThirdPlaces = Object.values(worldCupHistory).map(t => t.thirdPlace)
const allTopScorers = Object.values(worldCupHistory).map(t => t.topScorer)
const allHosts = Object.values(worldCupHistory).map(t => t.host.join(' & '))
const allFinalScores = Object.values(worldCupHistory).map(t => t.finalScore)
const allGoalCounts = Object.values(worldCupHistory).map(t => String(t.totalGoals))
const allTeamCounts = Object.values(worldCupHistory).map(t => String(t.totalTeams))

function generateChampionQuestion(t: WorldCupTournament): QuizQuestion | null {
  const distractors = allChampions.filter(c => c !== t.champion)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(t.champion, distractors)
  return {
    question: `Which team won the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.champion} defeated ${t.runnerUp} ${t.finalScore} in the final to win the ${t.year} World Cup.`,
    funFact: t.funFacts.length > 0 ? t.funFacts[Math.floor(Math.random() * t.funFacts.length)] : null,
    year: t.year,
  }
}

function generateRunnerUpQuestion(t: WorldCupTournament): QuizQuestion | null {
  const distractors = allRunnersUp.filter(r => r !== t.runnerUp)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(t.runnerUp, distractors)
  return {
    question: `Which team finished as runner-up in the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.champion} defeated ${t.runnerUp} in the ${t.year} final.`,
    funFact: null,
    year: t.year,
  }
}

function generateThirdPlaceQuestion(t: WorldCupTournament): QuizQuestion | null {
  const distractors = allThirdPlaces.filter(r => r !== t.thirdPlace)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(t.thirdPlace, distractors)
  return {
    question: `Which team finished in 3rd place at the ${t.year} World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.thirdPlace} defeated ${t.fourthPlace} in the third-place match of the ${t.year} World Cup.`,
    funFact: null,
    year: t.year,
  }
}

function generateTopScorerQuestion(t: WorldCupTournament): QuizQuestion | null {
  const distractors = allTopScorers.filter(s => s !== t.topScorer)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(t.topScorer, distractors)
  return {
    question: `Who was the top scorer of the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.topScorer} scored ${t.topScorerGoals} goals in the ${t.year} World Cup.`,
    funFact: null,
    year: t.year,
  }
}

function generateHostQuestion(t: WorldCupTournament): QuizQuestion | null {
  const hostStr = t.host.join(' & ')
  const distractors = allHosts.filter(h => h !== hostStr)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(hostStr, distractors)
  return {
    question: `Which country hosted the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `The ${t.year} World Cup was hosted by ${hostStr}.`,
    funFact: t.funFacts.length > 0 ? t.funFacts[Math.floor(Math.random() * t.funFacts.length)] : null,
    year: t.year,
  }
}

function generateFinalScoreQuestion(t: WorldCupTournament): QuizQuestion | null {
  const distractors = allFinalScores.filter(s => s !== t.finalScore)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(t.finalScore, distractors)
  return {
    question: `What was the final score of the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.champion} defeated ${t.runnerUp} ${t.finalScore} in the ${t.year} final at ${t.finalVenue}.`,
    funFact: null,
    year: t.year,
  }
}

function generateTotalGoalsQuestion(t: WorldCupTournament): QuizQuestion | null {
  const goalStr = String(t.totalGoals)
  const distractors = allGoalCounts.filter(g => g !== goalStr)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(goalStr, distractors)
  return {
    question: `How many total goals were scored at the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `A total of ${t.totalGoals.toLocaleString()} goals were scored across ${t.matchesPlayed} matches at the ${t.year} World Cup.`,
    funFact: null,
    year: t.year,
  }
}

function generateTeamCountQuestion(t: WorldCupTournament): QuizQuestion | null {
  const countStr = String(t.totalTeams)
  const distractors = allTeamCounts.filter(c => c !== countStr)
  if (distractors.length < 3) return null
  const { options, correctIndex } = buildOptions(countStr, distractors)
  return {
    question: `How many teams participated in the ${t.year} FIFA World Cup?`,
    options,
    correctOption: correctIndex,
    explanation: `${t.totalTeams} teams participated in the ${t.year} World Cup.`,
    funFact: null,
    year: t.year,
  }
}

/**
 * Generate all quiz questions from worldCupHistory data
 * Returns a flat array of questions (approximately 8 per tournament)
 */
export function generateAllQuestions(): QuizQuestion[] {
  const tournaments = Object.values(worldCupHistory)
  const questions: QuizQuestion[] = []

  for (const t of tournaments) {
    const generators = [
      generateChampionQuestion,
      generateRunnerUpQuestion,
      generateThirdPlaceQuestion,
      generateTopScorerQuestion,
      generateHostQuestion,
      generateFinalScoreQuestion,
      generateTotalGoalsQuestion,
      generateTeamCountQuestion,
    ]

    for (const gen of generators) {
      const q = gen(t)
      if (q) questions.push(q)
    }
  }

  // Remove duplicates
  const seen = new Set<string>()
  return questions.filter(q => {
    const key = q.question
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
