// Quiz core logic - database operations

import { prisma } from '@/libs/prisma/client'
import { processDailyQuizReward } from '@/libs/candy/ledger'

export interface TodayQuizResponse {
  quiz: {
    id: string
    question: string
    options: string[]
    year: number
  } | null
  alreadyAnswered: boolean
  userResult: { correct: boolean; earned: number } | null
}

export interface QuizAnswerResponse {
  correct: boolean
  earned: number
  explanation: string
  funFact: string | null
  correctAnswer: string
}

/**
 * Get today's quiz for a user
 */
export async function getTodayQuiz(userId?: string): Promise<TodayQuizResponse> {
  const today = new Date().toISOString().split('T')[0]

  const quiz = await prisma.dailyQuiz.findUnique({
    where: { date: today },
  })

  if (!quiz) {
    return { quiz: null, alreadyAnswered: false, userResult: null }
  }

  // Check if user already answered
  if (userId) {
    const attempt = await prisma.dailyQuizAttempt.findUnique({
      where: { userId_quizId: { userId, quizId: quiz.id } },
    })

    if (attempt) {
      return {
        quiz: null,
        alreadyAnswered: true,
        userResult: {
          correct: attempt.isCorrect,
          earned: attempt.isCorrect ? 15 : 0,
        },
      }
    }
  }

  return {
    quiz: {
      id: quiz.id,
      question: quiz.question,
      options: quiz.options as string[],
      year: quiz.year,
    },
    alreadyAnswered: false,
    userResult: null,
  }
}

/**
 * Check a quiz answer and award candy if correct
 */
export async function checkAnswer(
  userId: string,
  quizId: string,
  selectedOption: number
): Promise<QuizAnswerResponse> {
  const quiz = await prisma.dailyQuiz.findUnique({ where: { id: quizId } })
  if (!quiz) {
    throw new Error('Quiz not found')
  }

  // Check if already answered
  const existing = await prisma.dailyQuizAttempt.findUnique({
    where: { userId_quizId: { userId, quizId } },
  })
  if (existing) {
    return {
      correct: existing.isCorrect,
      earned: existing.isCorrect ? 15 : 0,
      explanation: quiz.explanation,
      funFact: quiz.funFact,
      correctAnswer: (quiz.options as string[])[quiz.correctOption],
    }
  }

  const isCorrect = selectedOption === quiz.correctOption

  // Record the attempt
  await prisma.dailyQuizAttempt.create({
    data: {
      userId,
      quizId,
      selectedOption,
      isCorrect,
    },
  })

  // Award candy if correct
  const earned = await processDailyQuizReward(userId, isCorrect, quizId)

  return {
    correct: isCorrect,
    earned,
    explanation: quiz.explanation,
    funFact: quiz.funFact,
    correctAnswer: (quiz.options as string[])[quiz.correctOption],
  }
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}
