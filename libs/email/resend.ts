import { Resend } from 'resend'

interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  console.log('[EMAIL] sendEmail called with to:', to)
  console.log('[EMAIL] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
  console.log('[EMAIL] RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length)
  
  if (!process.env.RESEND_API_KEY) {
    console.error('[ERROR] RESEND_API_KEY is not configured!')
    return { success: false, error: 'Email service not configured' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // Development mode: skip actual email sending, just log the code
    if (process.env.NODE_ENV === 'development') {
      console.log('[EMAIL] DEV MODE: Skipping email send')
      console.log('[EMAIL] To:', to)
      console.log('[EMAIL] Subject:', subject)
      // Extract verification code from HTML if present
      const codeMatch = html.match(/<div class="code">(\d+)<\/div>/)
      if (codeMatch) {
        console.log('[EMAIL] Verification Code:', codeMatch[1])
      }
      return { success: true, devMode: true }
    }
      
    console.log('[EMAIL] Attempting to send email from fallback sender')
    console.log('[EMAIL] Subject:', subject)
      
    // In production, try verified domain first, fall back to sandbox
    let result = await trySend(resend, 'Netown <auth@netown.cn>', to, subject, html)
      
    // If production domain not verified, try sandbox
    if (!result.success && result.error?.includes('not verified')) {
      console.log('[EMAIL] Production domain not verified, falling back to Resend sandbox')
      result = await trySend(resend, 'Netown <onboarding@resend.dev>', to, subject, html)
    }
    
    if (!result.success) {
      console.error('[EMAIL] All senders failed:', result.error)
    } else {
      console.log('[EMAIL] Sent successfully to:', to)
    }
    
    return result
  } catch (error: any) {
    console.error('[EMAIL] Failed to send:', error)
    console.error('[EMAIL] Error message:', error.message)
    console.error('[EMAIL] Error stack:', error.stack)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

async function trySend(
  resend: Resend,
  from: string,
  to: string,
  subject: string,
  html: string
) {
  try {
    const response = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    // Resend SDK v4+ returns error objects inside the response
    // @ts-ignore - response structure varies by SDK version
    if (response && response.error) {
      // @ts-ignore
      const errMsg = response.error.message || JSON.stringify(response.error)
      console.error('[EMAIL] Resend API returned error:', errMsg)
      return { success: false, error: errMsg }
    }

    // @ts-ignore
    if (response && response.data && response.data.id) {
      console.log('[EMAIL] Resend email ID:', response.data.id)
    }

    console.log('[EMAIL] Response:', JSON.stringify(response, null, 2).slice(0, 500))
    return { success: true }
  } catch (error: any) {
    console.error('[EMAIL] trySend failed:', error.message)
    return { success: false, error: error.message || 'Unknown error' }
  }
}

export function generateVerificationEmail(code: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Netown Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #030712;
      margin: 0;
      padding: 0;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #030712;
    }
    .card {
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      border: 1px solid #00FF6630;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0, 255, 102, 0.1);
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #00FF66;
      margin-bottom: 24px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #ffffff;
    }
    .description {
      font-size: 16px;
      color: #a0a0a0;
      margin-bottom: 32px;
      line-height: 1.6;
    }
    .code-box {
      background: linear-gradient(135deg, #00FF6610 0%, #00FF6605 100%);
      border: 2px solid #00FF66;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      color: #00FF66;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .note {
      font-size: 14px;
      color: #707070;
      margin-top: 24px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #2a2a2a;
      font-size: 12px;
      color: #505050;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">🥛 Netown</div>
      <div class="title">Verify Your Email</div>
      <div class="description">
        Welcome to Netown! Use the verification code below to complete your registration:
      </div>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <div class="note">
        This code will expire in 5 minutes. If you didn't request this, please ignore this email.
      </div>
      <div class="footer">
        © 2026 Netown. All rights reserved.<br>
        2026 FIFA World Cup™ AI Predictions
      </div>
    </div>
  </div>
</body>
</html>
  `
}