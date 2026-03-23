// @ts-nocheck
'use client'

import { motion } from 'framer-motion'
import { MatchingResultV2 as MatchingResult } from '@/lib/matching-algorithm-v2'

interface MatchResultDisplayProps {
  result: MatchingResult | any
  matchedUser?: {
    nickname: string
    age: number
    city: string
    avatar?: string
  }
}

export default function MatchResultDisplay({ result, matchedUser }: MatchResultDisplayProps) {
  const { scores, analysis, explanation } = result

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 总分卡片 - 带动画 */}
      <motion.div 
        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 动态背景 */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.4) 0%, transparent 50%)',
            backgroundSize: '200% 200%'
          }}
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="text-lg opacity-90">综合匹配度</div>
            <motion.div 
              className="text-6xl font-bold mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {Math.round(scores.totalScore)}
              </motion.span>
              <span className="text-2xl">分</span>
            </motion.div>
          </div>
          {matchedUser && (
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-xl font-bold">{matchedUser.nickname}</div>
              <div className="text-sm opacity-80">{matchedUser.age}岁 · {matchedUser.city}</div>
            </motion.div>
          )}
        </div>
        
        {/* 分数条 */}
        <motion.div 
          className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${scores.totalScore}%` }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          />
        </motion.div>
      </motion.div>

      {/* 分层匹配分数 */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 匹配分析</h3>
        
        <div className="space-y-4">
          {/* 分数项组件 */}
          {[
            { label: '价值观匹配', score: analysis.coreDimensions.values.score, color: 'bg-rose-400' },
            { label: '性格匹配', score: analysis.coreDimensions.personality.score, color: 'bg-pink-400' },
            { label: '生活方式', score: analysis.compatibilityDimensions.lifestyle.score, color: 'bg-purple-400' },
            { label: '兴趣爱好', score: analysis.compatibilityDimensions.interests.score, color: 'bg-indigo-400' },
            { label: '家庭观念', score: analysis.compatibilityDimensions.family.score, color: 'bg-orange-400' },
          ].map((item, index) => (
            <motion.div 
              key={item.label}
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="w-32 text-gray-600">{item.label}</div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${item.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="w-12 text-right font-medium">{Math.round(item.score)}</div>
            </motion.div>
          ))}

          {/* 互补性加分 */}
          {analysis.complementarity.totalBonus > 0 && (
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="w-32 text-gray-600">互补性加分</div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.complementarity.totalBonus}%` }}
                    transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="w-12 text-right font-medium text-amber-500">+{Math.round(analysis.complementarity.totalBonus)}</div>
            </motion.div>
          )}

          {/* 长期潜力 */}
          <motion.div 
            className="flex items-center pt-2 border-t"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1 }}
          >
            <div className="w-32 text-gray-600">长期关系潜力</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.longTermPrediction.stabilityScore}%` }}
                  transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.longTermPrediction.stabilityScore)}</div>
          </motion.div>
        </div>
      </motion.div>

      {/* 互补性分析 */}
      {analysis.complementarity.traits.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">✨ 性格互补</h3>
          <div className="space-y-3">
            {analysis.complementarity.traits.map((trait, index) => (
              <div key={index} className="flex items-start p-3 bg-amber-50 rounded-xl">
                <span className="text-2xl mr-3">
                  {trait.complementarityType === 'balance' ? '⚖️' : 
                   trait.complementarityType === 'growth' ? '🌱' : '🤝'}
                </span>
                <div>
                  <div className="font-medium text-gray-800">{trait.trait}</div>
                  <div className="text-sm text-gray-600 mt-1">{trait.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 优势与挑战 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 优势 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-green-600 mb-4">💪 匹配优势</h3>
          <ul className="space-y-2">
            {explanation.strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 挑战 */}
        {explanation.challenges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-orange-600 mb-4">⚠️ 潜在挑战</h3>
            <ul className="space-y-2">
              {explanation.challenges.map((challenge, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">!</span>
                  <span className="text-gray-700">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 建议 */}
      {explanation.advice.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-indigo-700 mb-4">💡 关系建议</h3>
          <ul className="space-y-2">
            {explanation.advice.map((advice, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-500 mr-2">→</span>
                <span className="text-gray-700">{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 长期预测详情 */}
      {analysis.longTermPrediction.riskFactors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">🔮 关系稳定性分析</h3>
          
          {/* 风险因子 */}
          <div className="space-y-3 mb-6">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">风险因素</div>
            {analysis.longTermPrediction.riskFactors.map((risk, index) => (
              <div key={index} className={`p-4 rounded-xl ${
                risk.severity === 'high' ? 'bg-red-50 border border-red-200' :
                risk.severity === 'medium' ? 'bg-orange-50 border border-orange-200' :
                'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{risk.factor}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    risk.severity === 'high' ? 'bg-red-100 text-red-600' :
                    risk.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {risk.severity === 'high' ? '高风险' : risk.severity === 'medium' ? '中风险' : '低风险'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                <p className="text-sm text-indigo-600">💡 {risk.mitigation}</p>
              </div>
            ))}
          </div>
          
          {/* 优势因子 */}
          {analysis.longTermPrediction.strengthFactors.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">稳定因素</div>
              {analysis.longTermPrediction.strengthFactors.map((strength, index) => (
                <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{strength.factor}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">
                      {strength.impact === 'very_strong' ? '非常强' : 
                       strength.impact === 'strong' ? '强' : '中等'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{strength.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 置信度 */}
      <div className="text-center text-sm text-gray-400">
        匹配分析置信度: {result.metadata.reliability.toFixed(0)}% · 版本 {result.metadata.version}
      </div>
    </div>
  )
}
