import { NextResponse } from 'next/server'
import { getPredictionsByUser, getPredictionStats } from '@/libs/prediction/user-predictions'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
  }
  
  const predictions = getPredictionsByUser(userId)
  const stats = getPredictionStats(userId)
  
  return NextResponse.json({ success: true, predictions, stats })
}
