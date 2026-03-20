'use client'

import React from 'react'

interface ShareCardProps {
  myNickname: string
  otherNickname: string
  matchScore: number
  className?: string
}

/**
 * 分享卡片组件（用于生成分享图片）
 * 这个组件会被隐藏，仅用于 html2canvas 截图
 */
export function ShareCard({ myNickname, otherNickname, matchScore, className = '' }: ShareCardProps) {
  // 根据分数决定颜色和文案
  const getScoreColor = () => {
    if (matchScore >= 90) return { from: '#10b981', to: '#059669', text: '绝佳匹配' }
    if (matchScore >= 80) return { from: '#f43f5e', to: '#ec4899', text: '高度匹配' }
    if (matchScore >= 70) return { from: '#f59e0b', to: '#d97706', text: '良好匹配' }
    return { from: '#6366f1', to: '#8b5cf6', text: '有缘匹配' }
  }

  const scoreInfo = getScoreColor()

  return (
    <div
      id="share-card-container"
      className={className}
      style={{
        width: '375px',
        padding: '32px 24px',
        background: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 50%, #fce7f3 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 装饰性背景 */}
      <div
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-60px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      {/* 品牌Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
            padding: '8px 20px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
          }}
        >
          <span style={{ fontSize: '20px' }}>💕</span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '2px',
            }}
          >
            心动投递
          </span>
        </div>
      </div>

      {/* 用户信息 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
            }}
          >
            {myNickname?.charAt(0) || '?'}
          </div>
          <span
            style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: 600,
              maxWidth: '80px',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {myNickname || '我'}
          </span>
        </div>

        {/* 爱心连接 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '32px',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #f43f5e)',
            }}
          />
          <span style={{ fontSize: '24px' }}>💝</span>
          <div
            style={{
              width: '32px',
              height: '2px',
              background: 'linear-gradient(90deg, #f43f5e, transparent)',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(236,72,153,0.3)',
            }}
          >
            {otherNickname?.charAt(0) || '?'}
          </div>
          <span
            style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: 600,
              maxWidth: '80px',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {otherNickname || 'TA'}
          </span>
        </div>
      </div>

      {/* 匹配分数 */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            color: '#6b7280',
            marginBottom: '8px',
          }}
        >
          AI匹配分析结果
        </div>
        <div
          style={{
            fontSize: '64px',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${scoreInfo.from} 0%, ${scoreInfo.to} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1,
            marginBottom: '8px',
          }}
        >
          {matchScore}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: `linear-gradient(135deg, ${scoreInfo.from}20 0%, ${scoreInfo.to}20 100%)`,
            padding: '6px 16px',
            borderRadius: '12px',
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${scoreInfo.from} 0%, ${scoreInfo.to} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {scoreInfo.text}
          </span>
        </div>
      </div>

      {/* 特点标签 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        {['价值观一致', '人格互补', '生活方式匹配'].map((tag) => (
          <div
            key={tag}
            style={{
              background: 'linear-gradient(135deg, #f43f5e10 0%, #ec489910 100%)',
              padding: '6px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#f43f5e',
              fontWeight: 500,
              border: '1px solid #f43f5e30',
            }}
          >
            {tag}
          </div>
        ))}
      </div>

      {/* 分割线 */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #f43f5e30, transparent)',
          marginBottom: '16px',
        }}
      />

      {/* 底部品牌信息 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          临沂鲁曜同创
        </span>
        <span style={{ color: '#e5e7eb' }}>|</span>
        <span
          style={{
            fontSize: '12px',
            color: '#9ca3af',
          }}
        >
          AI智能匹配平台
        </span>
      </div>

      {/* 水印 */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '12px',
          fontSize: '10px',
          color: '#d1d5db',
          opacity: 0.8,
        }}
      >
        心动投递 · 让缘分更科学
      </div>
    </div>
  )
}
