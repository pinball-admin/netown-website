import { NextResponse } from 'next/server'
import { getTerritory } from '@/libs/territory'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamCode: string }> }
) {
  try {
    const { teamCode } = await params
    const territory = await getTerritory(teamCode)
    if (!territory) {
      return NextResponse.json(
        { success: false, message: 'Territory not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, territory })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}
