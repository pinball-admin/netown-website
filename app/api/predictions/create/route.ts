import { NextResponse } from 'next/server'
import { createPrediction } from '@/libs/prediction/user-predictions'

export async function POST(request: Request) {
  const { userId, matchId, type, prediction } = await request.json()
  
  if (!userId || !matchId || !type || !prediction) {
    return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
  }
  
  try {
    const result = createPrediction(userId, matchId, type as any, prediction)
    return NextResponse.json({ success: true, prediction: result })
  } catch (error) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 400 })
  }
}
