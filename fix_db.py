#!/usr/bin/env python3
"""修复心动投递项目的数据库"""
import psycopg2
import sys

# Supabase 连接参数
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A"

def main():
    try:
        print("正在连接 Supabase 数据库...")
        conn = psycopg2.connect(
            host="ntaqnyegiiwtzdyqjiwy.supabase.co",
            port=5432,
            dbname="postgres",
            user="postgres",
            password=SERVICE_KEY,
            connect_timeout=10
        )
        conn.set_session(autocommit=True)
        cur = conn.cursor()
        print("✓ 连接成功")
        
        # 1. 创建 questionnaire_answers 表
        print("\n1. 创建 questionnaire_answers 表...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS questionnaire_answers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                answers JSONB DEFAULT '{}',
                personality_profile JSONB DEFAULT '{}',
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        print("✓ questionnaire_answers 表创建成功")
        
        # 2. 添加用户向量字段
        print("\n2. 添加用户向量字段到 users 表...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS personality_vector JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS values_vector JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS interests_vector JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS questionnaire_completed_at TIMESTAMPTZ
        """)
        print("✓ 向量字段添加成功")
        
        # 3. 添加统计字段
        print("\n3. 添加统计字段到 users 表...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS matches_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS mutual_likes_count INTEGER DEFAULT 0
        """)
        print("✓ 统计字段添加成功")
        
        # 验证结果
        print("\n验证修改...")
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('personality_vector', 'values_vector', 'interests_vector', 'questionnaire_completed_at', 'likes_count', 'matches_count', 'mutual_likes_count')
        """)
        user_cols = cur.fetchall()
        print(f"  users 表新增字段: {len(user_cols)} 个")
        for col in user_cols:
            print(f"    - {col[0]} ({col[1]})")
        
        cur.execute("""
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'questionnaire_answers'
            ORDER BY ordinal_position
        """)
        qa_cols = cur.fetchall()
        print(f"\n  questionnaire_answers 表字段: {len(qa_cols)} 个")
        for col in qa_cols:
            print(f"    - {col[1]} ({col[2]})")
        
        cur.close()
        conn.close()
        
        print("\n" + "="*50)
        print("数据库修改全部完成!")
        print("="*50)
        
    except psycopg2.OperationalError as e:
        print(f"连接错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
