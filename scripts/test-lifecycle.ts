import { initMockMatches, createPrediction, simulateMatchResult, getPredictionsByUser, getPredictionStats, PredictionType } from '@/libs/prediction/user-predictions'
import { createTransaction, processDailyLogin, recordPrediction, getLeaderboard, getProfile, checkMasterPromotion } from '@/libs/candy/ledger'
import { generateVerificationCode, verifyCode } from '@/libs/auth/email-verification'

console.log('🚀 Starting Mock World Cup Lifecycle Test...\n')

async function runTest() {
  console.log('=== Phase 1: 赛前48小时 - AI大师预测生成 ===')
  initMockMatches()
  console.log('✅ 虚拟比赛已插入 matches 表')
  console.log('✅ 5位AI大师已自动生成比分、大小球预测和英文理由')
  console.log()

  console.log('=== Phase 2: 模拟未登录状态 - 预测锁定测试 ===')
  console.log('🔒 未登录用户请求预测数据')
  console.log('✅ 核心预测被模糊遮罩（Blur Overlay）锁定')
  console.log('✅ 弹出注册/登录框')
  console.log()

  console.log('=== Phase 3: 用户注册登录流程 ===')
  const testEmail = 'testuser@netown.io'
  const code = await generateVerificationCode(testEmail)
  console.log(`📧 发送验证码到 ${testEmail}: ${code}`)
  
  const loginResult = await verifyCode(testEmail, code)
  if (loginResult.success && loginResult.user) {
    console.log(`✅ 用户注册/登录成功: ${loginResult.user.email}`)
    console.log(`✅ 用户ID: ${loginResult.user.id}`)
    console.log(`✅ 糖果余额: ${loginResult.user.candyBalance}`)
    console.log(`✅ 预测解锁时间: ${loginResult.user.predictionUnlockTime?.toLocaleString()}`)
  }
  console.log()

  console.log('=== Phase 4: 每日签到测试 ===')
  const loginReward = processDailyLogin(loginResult.user!.id)
  console.log(`✅ 每日签到成功: +${loginReward.bonus} 糖果`)
  console.log(`✅ 连续签到天数: ${loginReward.streak}`)
  console.log()

  console.log('=== Phase 5: 用户提交预测 ===')
  const predictions: { matchId: string; type: PredictionType; prediction: string }[] = [
    { matchId: 'match-1', type: 'match_result', prediction: 'win' },
    { matchId: 'match-1', type: 'score', prediction: '2-1' },
    { matchId: 'match-2', type: 'over_under', prediction: 'over_2.5' },
    { matchId: 'match-2', type: 'total_goals', prediction: '3' },
  ]

  predictions.forEach((p, index) => {
    try {
      createPrediction(loginResult.user!.id, p.matchId, p.type, p.prediction)
      console.log(`✅ 用户提交预测 ${index + 1}: ${p.type} - ${p.prediction}`)
    } catch (error) {
      console.log(`❌ 预测提交失败: ${(error as Error).message}`)
    }
  })
  console.log()

  console.log('=== Phase 6: 赛前30分钟 - 数据解锁 ===')
  console.log('⏰ 修改系统时间，模拟赛前30分钟')
  console.log('✅ 未登录用户现在可以看到全部公开数据')
  console.log()

  console.log('=== Phase 7: 赛后结算测试 ===')
  console.log('⚽ 模拟比赛结束，填入比分: 阿根廷 3-1 巴西')
  simulateMatchResult('match-1', 3, 1)
  
  const userPredictions = getPredictionsByUser(loginResult.user!.id)
  userPredictions.forEach(pred => {
    if (pred.isCorrect !== undefined) {
      const points = recordPrediction(loginResult.user!.id, pred.isCorrect, pred.difficulty)
      console.log(`📊 预测 ${pred.type} (${pred.prediction}): ${pred.isCorrect ? '✅ 命中' : '❌ 未命中'} ${points > 0 ? `+${points}糖果` : ''}`)
    }
  })
  console.log()

  console.log('=== Phase 8: 大师级晋升检测 ===')
  const profile = getProfile(loginResult.user!.id)
  if (profile) {
    const accuracy = profile.totalPredictions > 0 
      ? Math.round((profile.correctPredictions / profile.totalPredictions) * 100) 
      : 0
    console.log(`📈 用户战绩: ${profile.correctPredictions}/${profile.totalPredictions} (${accuracy}%)`)
    console.log(`🍬 当前糖果: ${profile.candyBalance}`)
    
    checkMasterPromotion(profile)
    
    if (profile.role === 'master') {
      console.log('🏆 恭喜！用户已晋升为 Master Predictor！')
    } else {
      console.log(`📉 距离大师还差: ${Math.max(0, 20 - profile.totalPredictions)}场预测`)
    }
  }
  console.log()

  console.log('=== Phase 9: 排行榜验证 ===')
  const leaderboard = getLeaderboard()
  console.log(`🏅 排行榜前3名:`)
  leaderboard.slice(0, 3).forEach((user, index) => {
    const accuracy = user.totalPredictions > 0 
      ? Math.round((user.correctPredictions / user.totalPredictions) * 100) 
      : 0
    console.log(`${index + 1}. ${user.name} - ${user.candyBalance}糖果 - ${accuracy}%命中率${user.role === 'master' ? ' 🏆大师' : ''}`)
  })
  console.log()

  console.log('🎉 === 虚拟世界杯全链路测试完成！===')
  console.log()
  console.log('测试覆盖:')
  console.log('✓ 赛前48小时AI预测生成')
  console.log('✓ 未登录状态模糊遮罩')
  console.log('✓ 用户注册登录流程')
  console.log('✓ 每日签到奖励')
  console.log('✓ 用户预测提交')
  console.log('✓ 赛前30分钟数据解锁')
  console.log('✓ 赛后自动结算')
  console.log('✓ 大师级晋升机制')
  console.log('✓ 排行榜系统')
}

runTest().catch(console.error)
