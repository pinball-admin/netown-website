import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 
                      'US'

  const isCN = countryCode.toUpperCase() === 'CN'

  return NextResponse.json({
    success: true,
    countryCode: countryCode.toUpperCase(),
    isCN,
    region: isCN ? 'CN' : 'GLOBAL'
  })
}
