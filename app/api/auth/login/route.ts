import { handleLogin } from '@/libs/auth/email-verification'

export async function POST(request: Request) {
  return handleLogin(request)
}
