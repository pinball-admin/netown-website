// Seed script: generate quiz questions from World Cup history data
// Run with: npx tsx scripts/seed-quizzes.ts
// Creates DailyQuiz records with dates assigned from today onwards

import { PrismaClient } from '@prisma/client'
import { generateAllQuestions } from '../libs/quiz/generator'

const prisma = new PrismaClient()

async function main() {
  console.log('Generating quiz questions from World Cup history data...')

  const questions = generateAllQuestions()
  console.log(`Generated ${questions.length} questions total`)

  // Shuffle for better day-to-day variety
  const shuffled = questions.sort(() => Math.random() - 0.5)

  // Assign dates starting from today
  const today = new Date()
  let created = 0
  let skipped = 0

  for (let i = 0; i < shuffled.length; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const q = shuffled[i]

    // Check if a quiz for this date already exists
    const existing = await prisma.dailyQuiz.findUnique({
      where: { date: dateStr },
    })

    if (existing) {
      skipped++
      continue
    }

    // Check if this exact question was already stored
    const duplicateQuestion = await prisma.dailyQuiz.findFirst({
      where: { question: q.question },
    })

    if (duplicateQuestion) {
      skipped++
      continue
    }

    await prisma.dailyQuiz.create({
      data: {
        date: dateStr,
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation,
        funFact: q.funFact,
        year: q.year,
      },
    })

    created++
  }

  console.log(`\nDone! Created ${created} new quizzes, skipped ${skipped} existing.`)
  console.log(`First quiz date: ${new Date().toISOString().split('T')[0]}`)
  console.log(`Last quiz date covers approximately ${Math.floor(created / 30)} months of daily content`)

  // Show the first 3 created quizzes as preview
  if (created > 0) {
    const previews = await prisma.dailyQuiz.findMany({
      orderBy: { date: 'asc' },
      take: 3,
    })
    console.log('\nPreview:')
    previews.forEach(q => {
      console.log(`  [${q.date}] ${q.question} (Year: ${q.year})`)
    })
  }

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('Seed failed:', e)
  process.exit(1)
})
