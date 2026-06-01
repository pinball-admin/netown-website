import { NextResponse } from 'next/server'
import { getTransactions } from '@/libs/candy/ledger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 })
  }
  
  const transactions = getTransactions(userId)
  
  return NextResponse.json({ success: true, transactions })
}
