import { handleSendCode } from '@/libs/auth/email-verification'

export async function POST(request: Request) {
  return handleSendCode(request)
}
