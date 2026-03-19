// 移除 'use client' 以支持静态渲染

import Link from 'next/link'

// 内联样式定义
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 30%, #fce7f3 70%, #fdf2f8 100%)',
    fontFamily: 'PingFang SC, Microsoft YaHei, -apple-system, sans-serif',
  } as React.CSSProperties,
  nav: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(251, 113, 133, 0.1)',
    padding: '12px 16px',
  } as React.CSSProperties,
  navInner: {
    maxWidth: '1024px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  btnPrimary: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    color: 'white',
    fontWeight: 600,
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
    transition: 'all 0.3s ease',
  },
  btnLarge: {
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '18px',
    borderRadius: '9999px',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 20px rgba(236, 72, 153, 0.4)',
    transition: 'all 0.3s ease',
    width: '100%',
    maxWidth: '300px',
  },
  section: {
    padding: '60px 16px',
    maxWidth: '1024px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(236, 72, 153, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  featureIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 500,
    background: '#ffe4e6',
    color: '#be123c',
    marginRight: '8px',
    marginBottom: '8px',
  },
}

// 特性卡片
function FeatureCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  const gradients: Record<string, string> = {
    rose: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
    orange: 'linear-gradient(135deg, #f97316 0%, #f43f5e 100%)',
    green: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
    purple: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    pink: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    violet: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)',
  }
  
  const icons: Record<string, JSX.Element> = {
    target: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    clock: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    message: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    heart: <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    eye: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  }

  return (
    <div style={styles.card}>
      <div style={{ ...styles.featureIcon, background: gradients[color] }}>
        {icons[icon]}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{title}</h3>
      <p style={{ color: '#6b7280', lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

// 步骤卡片
function StepCard({ num, title, desc, tags }: { num: string; title: string; desc: string; tags: string[] }) {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '18px',
          flexShrink: 0,
        }}>
          {num}
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{title}</h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>{desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {tags.map((tag, i) => (
              <span key={i} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// 用户评价
function TestimonialCard({ name, location, content, avatar }: { name: string; location: string; content: string; avatar: string }) {
  const avatarColors: Record<string, string> = {
    S: 'linear-gradient(135deg, #fb7185 0%, #ec4899 100%)',
    M: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    L: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
  }

  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          background: avatarColors[avatar],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px',
        }}>
          {avatar}
        </div>
        <div>
          <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{name}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{location}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
          {[1,2,3,4,5].map(i => (
            <svg key={i} width="16" height="16" viewBox="0 0 20 20" fill="#fbbf24">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
      </div>
      <p style={{ color: '#4b5563', lineHeight: 1.6 }}>"{content}"</p>
    </div>
  )
}

export default function HomePage() {
  return (
    <div style={styles.page}>
      {/* 背景装饰 */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(251, 113, 133, 0.2) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        left: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* 导航栏 */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <a href="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <span style={styles.logoText}>心动投递</span>
          </a>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/login" style={{ color: '#6b7280', fontWeight: 500, textDecoration: 'none' }}>
              登录
            </a>
            <a href="/register" style={styles.btnPrimary}>
              立即开始
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <section style={{ ...styles.section, textAlign: 'center', paddingTop: '48px' }}>
        {/* 状态标签 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 20px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '9999px',
          marginBottom: '24px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        }}>
          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }} />
          <span style={{ color: '#4b5563', fontSize: '14px' }}>
            已有 <strong style={{ color: '#f43f5e' }}>128,946</strong> 人找到爱情
          </span>
        </div>

        {/* 主标题 */}
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', lineHeight: 1.3 }}>
          找到那个让你
          <br />
          <span style={styles.gradientText}>心动的TA</span>
        </h1>

        {/* 副标题 */}
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
          不是随意的滑动，而是 <span style={styles.gradientText}>深度灵魂</span> 的契合。
          <br />
          用科学的方式，遇见真正对的人
        </p>

        {/* CTA 按钮 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
          <a href="/register" style={styles.btnLarge}>
            开始心动之旅
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="/how-it-works" style={{ color: '#6b7280', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            了解更多
          </a>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
          {[
            { value: '85%', label: '成功率', icon: '❤️' },
            { value: '66', label: '道问题', icon: '🎯' },
            { value: '每周', label: '一匹配', icon: '⏰' },
          ].map((stat, i) => (
            <div key={i} style={styles.card}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 特性区域 */}
      <section style={{ ...styles.section, background: 'rgba(255, 255, 255, 0.5)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
          为什么选择 <span style={styles.gradientText}>心动投递</span>
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
          我们相信，真正的缘分来自深度了解
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <FeatureCard icon="target" title="深度匹配" desc="66道精心设计的问题，从价值观到生活细节，AI全面分析你们契合度" color="rose" />
          <FeatureCard icon="clock" title="慢节奏社交" desc="每周只匹配一位，没有选择焦虑，珍惜每一次相遇的可能性" color="orange" />
          <FeatureCard icon="shield" title="真实认证" desc="严格身份验证系统，保护你的隐私，让你安心寻找真爱" color="green" />
          <FeatureCard icon="message" title="AI聊天助手" desc="智能推荐聊天话题，帮助你打破沉默，让对话自然流畅" color="purple" />
          <FeatureCard icon="heart" title="爱神模式" desc="成为月老，撮合身边的朋友，成人之美，收获祝福" color="pink" />
          <FeatureCard icon="eye" title="暗恋告白" desc="如果有人暗恋你，系统会自动通知，双向暗恋自动匹配" color="violet" />
        </div>
      </section>

      {/* 工作原理 */}
      <section style={styles.section}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
          简单四步，遇见缘分
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
          告别繁琐，拥抱简单的相遇方式
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <StepCard num="01" title="注册账号" desc="手机号快速注册，开启心动之旅" tags={['手机验证', '创建资料', '上传照片']} />
          <StepCard num="02" title="填写问卷" desc="66道深度问题，让AI真正了解你" tags={['人格测评', '风格分析', '价值观匹配']} />
          <StepCard num="03" title="等待匹配" desc="每周二晚，AI为你精准匹配" tags={['智能算法', '多维分析', '性格互补']} />
          <StepCard num="04" title="认识新朋友" desc="查看匹配理由，开启美好故事" tags={['匹配详解', '话题推荐', '破冰引导']} />
        </div>
      </section>

      {/* 用户评价 */}
      <section style={{ ...styles.section, background: 'rgba(255, 255, 255, 0.5)' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' }}>
          真实用户的 <span style={styles.gradientText}>心动故事</span>
        </h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
          已有数万人找到属于他们的幸福
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <TestimonialCard name="Sarah" location="北京" content="遇到了我的未婚夫！66道问题让我们发现彼此太契合了，现在已经在一起一年多了！" avatar="S" />
          <TestimonialCard name="Mike" location="上海" content="每周只看到一个匹配，反而让我更珍惜。现在和匹配的女生聊得非常好，准备见面了！" avatar="M" />
          <TestimonialCard name="Lily" location="深圳" content="作为社恐，这个APP让我轻松很多。不用不停滑动，AI筛选真的很棒！" avatar="L" />
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <a href="/stories" style={{ color: '#f43f5e', fontWeight: 600, textDecoration: 'none' }}>
            查看更多故事 →
          </a>
        </div>
      </section>

      {/* CTA 区域 */}
      <section style={styles.section}>
        <div style={{
          ...styles.card,
          background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
          textAlign: 'center',
          padding: '48px 24px',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white" style={{ margin: '0 auto 16px' }}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            开始你的心动之旅
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '24px' }}>
            下一个转角，遇见对的人
          </p>
          <a href="/register" style={{
            ...styles.btnLarge,
            background: 'white',
            color: '#f43f5e',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}>
            立即注册
          </a>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '24px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
            <span>✓ 免费注册</span>
            <span>✓ 隐私保护</span>
            <span>✓ 真诚相交</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ ...styles.logoIcon, width: 32, height: 32 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 'bold', color: '#1f2937' }}>心动投递</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
          <a href="/about" style={{ color: '#6b7280', textDecoration: 'none' }}>关于我们</a>
          <a href="/how-it-works" style={{ color: '#6b7280', textDecoration: 'none' }}>匹配原理</a>
          <a href="/stories" style={{ color: '#6b7280', textDecoration: 'none' }}>用户故事</a>
          <a href="/login" style={{ color: '#6b7280', textDecoration: 'none' }}>登录</a>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>© 2024 心动投递 · 让心动有回响</p>
      </footer>
    </div>
  )
}
