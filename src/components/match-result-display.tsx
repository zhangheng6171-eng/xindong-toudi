// @ts-nocheck
'use client'

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
      {/* 总分卡片 */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg opacity-90">综合匹配度</div>
            <div className="text-6xl font-bold mt-2">
              {Math.round(scores.totalScore)}
              <span className="text-2xl">分</span>
            </div>
          </div>
          {matchedUser && (
            <div className="text-right">
              <div className="text-xl font-bold">{matchedUser.nickname}</div>
              <div className="text-sm opacity-80">{matchedUser.age}岁 · {matchedUser.city}</div>
            </div>
          )}
        </div>
        
        {/* 分数条 */}
        <div className="mt-4 bg-white/20 rounded-full h-3">
          <div 
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${scores.totalScore}%` }}
          />
        </div>
      </div>

      {/* 分层匹配分数 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 匹配分析</h3>
        
        <div className="space-y-4">
          {/* 核心匹配 */}
          <div className="flex items-center">
            <div className="w-32 text-gray-600">价值观匹配</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${analysis.coreDimensions.values.score}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.coreDimensions.values.score)}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">性格匹配</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-pink-400 rounded-full"
                  style={{ width: `${analysis.coreDimensions.personality.score}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.coreDimensions.personality.score)}</div>
          </div>

          {/* 兼容性匹配 */}
          <div className="flex items-center">
            <div className="w-32 text-gray-600">生活方式</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-purple-400 rounded-full"
                  style={{ width: `${analysis.compatibilityDimensions.lifestyle.score}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.compatibilityDimensions.lifestyle.score)}</div>
          </div>
          
          <div className="flex items-center">
            <div className="w-32 text-gray-600">兴趣爱好</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${analysis.compatibilityDimensions.interests.score}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.compatibilityDimensions.interests.score)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-32 text-gray-600">家庭观念</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-orange-400 rounded-full"
                  style={{ width: `${analysis.compatibilityDimensions.family.score}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.compatibilityDimensions.family.score)}</div>
          </div>

          {/* 互补性加分 */}
          {analysis.complementarity.totalBonus > 0 && (
            <div className="flex items-center">
              <div className="w-32 text-gray-600">互补性加分</div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"
                    style={{ width: `${analysis.complementarity.totalBonus}%` }}
                  />
                </div>
              </div>
              <div className="w-12 text-right font-medium text-amber-500">+{Math.round(analysis.complementarity.totalBonus)}</div>
            </div>
          )}

          {/* 长期潜力 */}
          <div className="flex items-center pt-2 border-t">
            <div className="w-32 text-gray-600">长期关系潜力</div>
            <div className="flex-1 mx-4">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                  style={{ width: `${analysis.longTermPrediction.stabilityScore}%` }}
                />
              </div>
            </div>
            <div className="w-12 text-right font-medium">{Math.round(analysis.longTermPrediction.stabilityScore)}</div>
          </div>
        </div>
      </div>

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
