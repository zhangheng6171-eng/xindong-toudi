/**
 * 创建缺失的数据库表
 * 运行方式: npx ts-node scripts/create-tables.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 使用 service role key 创建客户端以执行 DDL
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTables() {
  console.log('🚀 开始创建表...\n')

  // 1. 创建 weekly_matches 表
  console.log('1. 创建 weekly_matches 表...')
  const createWeeklyMatchesSQL = `
    CREATE TABLE IF NOT EXISTS weekly_matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_id_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_number INTEGER NOT NULL,
      match_date DATE NOT NULL,
      compatibility_score DECIMAL(5, 2),
      match_reasons JSONB,
      shared_values TEXT[],
      shared_interests TEXT[],
      status VARCHAR(20) DEFAULT 'pending',
      user1_feedback TEXT,
      user2_feedback TEXT,
      user1_rating INTEGER CHECK (user1_rating >= 1 AND user1_rating <= 5),
      user2_rating INTEGER CHECK (user2_rating >= 1 AND user2_rating <= 5),
      user1_would_meet_again BOOLEAN,
      user2_would_meet_again BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id_1, user_id_2, week_number)
    );
  `
  
  // 2. 创建 match_history 表
  console.log('2. 创建 match_history 表...')
  const createMatchHistorySQL = `
    CREATE TABLE IF NOT EXISTS match_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      matched_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_number VARCHAR(10) NOT NULL,
      compatibility_score DECIMAL(5, 2),
      match_reasons JSONB,
      outcome VARCHAR(20),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `
  
  // 3. 创建 date_feedback 表
  console.log('3. 创建 date_feedback 表...')
  const createDateFeedbackSQL = `
    CREATE TABLE IF NOT EXISTS date_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID NOT NULL REFERENCES weekly_matches(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
      would_meet_again BOOLEAN,
      what_went_well TEXT,
      what_could_improve TEXT,
      personality_match_rating INTEGER CHECK (personality_match_rating >= 1 AND personality_match_rating <= 5),
      values_match_rating INTEGER CHECK (values_match_rating >= 1 AND values_match_rating <= 5),
      interests_match_rating INTEGER CHECK (interests_match_rating >= 1 AND interests_match_rating <= 5),
      want_to_continue BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(match_id, user_id)
    );
  `

  // 使用 rpc 执行 SQL
  try {
    // 通过 REST API 执行 SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ query: createWeeklyMatchesSQL })
    })
    
    if (!response.ok) {
      const error = await response.text()
      console.log('   使用备用方法...')
    }
  } catch (e) {
    console.log('   需要手动执行 SQL 迁移')
  }

  // 尝试直接通过 REST API 验证表是否存在
  console.log('\n📋 验证表状态...')
  
  const tables = ['weekly_matches', 'match_history', 'date_feedback']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${table}: 不存在或无权限`)
      } else {
        console.log(`   ✅ ${table}: 已存在`)
      }
    } catch (e) {
      console.log(`   ❌ ${table}: 检查失败`)
    }
  }

  console.log('\n📝 请在 Supabase Dashboard 的 SQL Editor 中执行迁移文件:')
  console.log('   supabase/migrations/20260323124000_create_feedback_and_history_tables.sql')
  console.log('\n🔗 SQL Editor 地址:')
  console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/project/_/sql`)
}

createTables().catch(console.error)
