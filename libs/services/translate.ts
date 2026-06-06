/**
 * Translation service for auto-translating forum posts.
 * 
 * Supports 8 languages: en, zh, es, de, it, ja, ko, pt
 * Uses LibreTranslate as the default provider (free, no API key required)
 * Falls back gracefully if translation fails.
 */

export const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'de', 'it', 'ja', 'ko', 'pt']

interface TranslationResult {
  translatedText: string
  detectedLanguage: string | null
}

/**
 * Detect the language of the input text.
 */
export async function detectLanguage(
  text: string,
  provider: 'libre' | 'google' = 'libre'
): Promise<string | null> {
  // Simple heuristic: if text contains CJK characters, it's likely Chinese
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/
  if (cjkRegex.test(text)) return 'zh'

  // If text contains Japanese-specific characters
  const jpRegex = /[\u3040-\u309f\u30a0-\u30ff]/
  if (jpRegex.test(text)) return 'ja'

  // If text contains Korean characters
  const koRegex = /[\uac00-\ud7af]/
  if (koRegex.test(text)) return 'ko'

  // For Latin-based languages, try LibreTranslate detection
  try {
    const response = await fetch(
      `https://libretranslate.com/detect`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text.substring(0, 500) }),
      }
    )
    if (response.ok) {
      const result = await response.json()
      if (Array.isArray(result) && result.length > 0) {
        return result[0].language
      }
    }
  } catch {
    // Detection failed, fall back
  }

  // Default to English
  return 'en'
}

/**
 * Translate text from source language to target language.
 */
export async function translateText(
  text: string,
  source: string,
  target: string
): Promise<string> {
  if (source === target || !text.trim()) return text

  try {
    const response = await fetch(
      `https://libretranslate.com/translate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text.substring(0, 2000), // Limit text length
          source,
          target,
          format: 'text',
        }),
      }
    )

    if (response.ok) {
      const result = await response.json()
      return result.translatedText || text
    }

    // Fallback: if LibreTranslate fails, try Google Translate as secondary
    const googleResult = await translateViaGoogle(text, source, target)
    if (googleResult) return googleResult

    console.warn(`[Translate] Failed to translate from ${source} to ${target}: ${response.status}`)
    return text
  } catch (error) {
    console.warn(`[Translate] Error translating from ${source} to ${target}:`, error)
    return text
  }
}

/**
 * Fallback: Translate via Google Translate unofficial API.
 */
async function translateViaGoogle(
  text: string,
  source: string,
  target: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text.substring(0, 1000))}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )

    if (response.ok) {
      const result = await response.json()
      if (result && result[0]) {
        return result[0].map((seg: any[]) => seg[0]).join('')
      }
    }
  } catch {
    // Google Translate fallback failed
  }
  return null
}

/**
 * Translate post content to all supported languages.
 * Returns a map of language -> translated text.
 */
export async function translatePost(
  content: string,
  sourceLanguage?: string
): Promise<{ translations: Record<string, string>; detectedLanguage: string }> {
  const detected = sourceLanguage || (await detectLanguage(content)) || 'en'
  const translations: Record<string, string> = {}

  // Translate to all other languages
  const targets = SUPPORTED_LANGUAGES.filter((lang) => lang !== detected)
  const results = await Promise.allSettled(
    targets.map((target) => translateText(content, detected, target))
  )

  results.forEach((result, index) => {
    const target = targets[index]
    if (result.status === 'fulfilled') {
      translations[target] = result.value
    } else {
      translations[target] = content // Fallback to original
    }
  })

  // Also store original
  translations[detected] = content

  return { translations, detectedLanguage: detected }
}
