'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

export default function TermsPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>{t('nav.backToTown')}</span>
        </Link>

        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-400 mb-8">Last updated: June 2026</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Netown (&ldquo;the Platform&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. Your continued use of the Platform constitutes acceptance of any updates to these terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Services</h2>
            <p className="mb-4">Netown provides an AI-powered prediction platform for World Cup 2026, including:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-generated match predictions using machine learning algorithms</li>
              <li>Expert analysis and betting recommendations</li>
              <li>Social prediction features and community engagement</li>
              <li>Real-time match updates and results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="mb-4">To access certain features, you must create an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Conduct</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Platform or servers</li>
              <li>Use automated tools to scrape or extract data</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Post false, misleading, or deceptive content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Predictions and Betting</h2>
            <p className="mb-4">Our AI predictions are for entertainment purposes only. You acknowledge that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Predictions do not guarantee actual match outcomes</li>
              <li>Betting carries financial risk - bet responsibly</li>
              <li>We are not a licensed betting or gambling service</li>
              <li>You are solely responsible for any betting decisions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p>All content on the Platform, including but not limited to text, graphics, logos, AI models, and software, is the property of Netown or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our permission.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Third-Party Services</h2>
            <p>The Platform may integrate third-party services, including advertising networks and analytics providers. These third parties have their own terms and privacy policies. We are not responsible for the practices of any third-party services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p>THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NETOWN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Indemnification</h2>
            <p>You agree to indemnify and hold harmless Netown, its affiliates, and their respective officers, directors, and employees from any claims, damages, or expenses arising from your violation of these Terms or your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <p>We reserve the right to suspend or terminate your account and access to the Platform at any time for any reason, including violation of these Terms. Upon termination, your right to use the Platform will cease immediately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved in the courts of the jurisdiction where Netown is established.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2 text-[#00FF66]">legal@netown.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex gap-6 text-sm">
          <Link href="/privacy-policy" className="text-[#00FF66] hover:underline">Privacy Policy</Link>
          <Link href="/disclaimer" className="text-[#00FF66] hover:underline">Disclaimer</Link>
        </div>
      </div>
    </div>
  )
}