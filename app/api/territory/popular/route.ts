import { NextResponse } from 'next/server'
import { getPopularTerritories } from '@/libs/territory'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const territories = await getPopularTerritories(5)
    return NextResponse.json({ success: true, territories })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
