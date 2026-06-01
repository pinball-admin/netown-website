'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

export default function DisclaimerPage() {
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

        <h1 className="text-4xl font-bold text-white mb-2">Disclaimer</h1>
        <p className="text-slate-400 mb-8">Last updated: June 2026</p>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. General Information Only</h2>
            <p className="mb-4">The content on Netown, including AI predictions, match analysis, betting recommendations, and expert opinions, is provided for general informational and entertainment purposes only. Nothing on this platform constitutes professional advice.</p>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
              <p className="text-amber-400 font-medium">Important:</p>
              <p className="text-amber-300/80 text-sm mt-1">Our AI predictions should NEVER be considered as guaranteed outcomes. Football matches are inherently unpredictable, and any prediction, no matter how sophisticated, carries uncertainty.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. No Betting or Gambling Service</h2>
            <p className="mb-4">Netown is NOT a licensed betting, gambling, or sports wagering service. We do not:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Accept bets or wagers of any kind</li>
              <li>Process gambling transactions</li>
              <li>Facilitate connection to betting sites</li>
              <li>Promote or encourage gambling activities</li>
            </ul>
            <p className="mt-4">Betting on sports carries significant financial risk and can lead to gambling addiction. If you choose to bet, do so responsibly and within legal limits in your jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. AI Prediction Limitations</h2>
            <p className="mb-4">Our AI predictions are generated using machine learning algorithms analyzing historical data, team statistics, and various match factors. However, you acknowledge that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI predictions cannot account for all variables affecting match outcomes</li>
              <li>Unforeseen events (injuries, weather, referee decisions) impact results</li>
              <li>Historical data patterns may not repeat in future matches</li>
              <li>Model accuracy varies based on data quality and match complexity</li>
              <li>Machine learning models may have inherent biases</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. No Financial Advice</h2>
            <p>Any predictions, tips, or recommendations provided on this platform do not constitute financial, investment, or gambling advice. Past performance of predictions does not guarantee future results. You are solely responsible for any financial decisions you make.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Third-Party Content</h2>
            <p className="mb-4">Our platform may contain links to third-party websites and advertisements. These third parties have their own terms, privacy policies, and practices. We do not endorse, verify, or take responsibility for:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Content on external websites</li>
              <li>Products or services advertised by third parties</li>
              <li>Accuracy of third-party predictions or tips</li>
              <li>Legitimacy of betting operators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. World Cup 2026 Affiliation</h2>
            <p>Netown is a fan-made prediction platform and is NOT officially affiliated with, endorsed by, or connected to FIFA, the 2026 FIFA World Cup™, or any related entities. All World Cup-related trademarks and logos belong to their respective owners.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Data Accuracy</h2>
            <p>While we strive to provide accurate match schedules, team information, and player data, we cannot guarantee that all information is current, complete, or error-free. Always verify critical information from official sources before making any decisions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. User Responsibility</h2>
            <p className="mb-4">By using Netown, you acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You use the platform at your own risk</li>
              <li>You are responsible for verifying information independently</li>
              <li>You will not hold us liable for any losses arising from predictions</li>
              <li>You are of legal age to access this content in your jurisdiction</li>
              <li>You understand and accept the risks of sports-related predictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Netown and its operators shall not be held liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses resulting from:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Use of or reliance on our predictions</li>
              <li>Decisions made based on platform content</li>
              <li>Errors, inaccuracies, or omissions in content</li>
              <li>Service interruptions or technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Gamble Responsibly</h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4">
              <p className="text-red-400 font-medium mb-2">If you feel you have a gambling problem:</p>
              <p className="text-red-300/80 text-sm">Please seek help from professional organizations such as:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-red-300/80 text-sm">
                <li>National Problem Gambling Helpline</li>
                <li>Gamblers Anonymous</li>
                <li>BeGambleAware (UK)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Changes to This Disclaimer</h2>
            <p>We reserve the right to modify this Disclaimer at any time. Changes will be effective immediately upon posting. Your continued use of the platform after any changes constitutes acceptance of the updated Disclaimer.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Contact</h2>
            <p>If you have any questions about this Disclaimer, please contact us at:</p>
            <p className="mt-2 text-[#00FF66]">legal@netown.com</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex gap-6 text-sm">
          <Link href="/privacy-policy" className="text-[#00FF66] hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="text-[#00FF66] hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  )
}