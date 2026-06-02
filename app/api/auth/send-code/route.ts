import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sendEmail, generateVerificationEmail } from '@/libs/email/resend'
import prisma from '@/libs/prisma/client'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Invalid email' },
        { status: 400 }
      )
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedCode = await bcrypt.hash(code, 10)

    // Store verification token in database
    await prisma.verificationToken.create({
      data: {
        email,
        token: hashedCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      },
    })

    console.log(`[AUTH] Generated verification code for ${email}: ${code}`)

    const emailResult = await sendEmail({
      to: email,
      subject: 'Your Netown Verification Code',
      html: generateVerificationEmail(code),
    })

    if (!emailResult.success) {
      console.error('[AUTH] Failed to send email:', emailResult.error)
      return NextResponse.json(
        { success: false, message: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    console.error('[AUTH] Failed to send verification code:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}