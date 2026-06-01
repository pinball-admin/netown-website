import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function middleware(request: NextRequest) {
  const countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 'US'

  const isCN = countryCode.toUpperCase() === 'CN'

  const response = NextResponse.next()
  
  response.headers.set('x-geolocation', countryCode)
  response.headers.set('x-is-cn', String(isCN))

  return response
}
