import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPPORTED_LOCALES = ['en', 'es', 'de', 'it', 'ja', 'ko', 'pt', 'zh']

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|robots.txt|sitemap.xml|admin).*)'],
}

function detectLocale(request: NextRequest): string {
  // 1. Cookie (user's saved preference)
  const cookieLocale = request.cookies.get('netown_language')?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale
  }

  // 2. Geo detection
  const countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 'US'
  if (countryCode.toUpperCase() === 'CN') return 'zh'

  // 3. Accept-Language header
  const acceptLang = request.headers.get('accept-language') || ''
  if (acceptLang.toLowerCase().startsWith('zh')) return 'zh'

  return 'en'
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const pathParts = pathname.split('/').filter(Boolean)
  const firstSegment = pathParts[0] || ''

  // Geo headers (preserved from original logic)
  const countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 'US'
  const isCN = countryCode.toUpperCase() === 'CN'

  // Case 1: URL already has a locale prefix — rewrite to the real page
  if (SUPPORTED_LOCALES.includes(firstSegment)) {
    const locale = firstSegment
    const originalPath = '/' + pathParts.slice(1).join('/') || '/'

    const response = NextResponse.rewrite(new URL(originalPath + search, request.url))
    
    response.headers.set('x-locale', locale)
    response.headers.set('x-original-path', originalPath)
    response.headers.set('x-geolocation', countryCode)
    response.headers.set('x-is-cn', String(isCN))

    return response
  }

  // Case 2: Root or un-prefixed path — redirect to detected locale
  const locale = detectLocale(request)
  const newUrl = new URL(`/${locale}${pathname === '/' ? '' : pathname}${search}`, request.url)

  const response = NextResponse.redirect(newUrl, 307)

  response.headers.set('x-geolocation', countryCode)
  response.headers.set('x-is-cn', String(isCN))

  return response
}
