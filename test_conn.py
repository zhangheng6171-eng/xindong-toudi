#!/usr/bin/env python3
"""修复心动投递项目的数据库 - 使用 SSL"""
import psycopg2
import os

# Supabase 连接参数
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50YXFueWVnaWl3dHpkeXFqaXd5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkxNjg3NSwiZXhwIjoyMDg5NDkyODc1fQ.z8LPpoJoa9_DEJvBmNvSF0Q1I4FA3FNnFRU0PgKcF2A"

os.environ['PGSSLMODE'] = 'require'

print("尝试连接 Supabase...")
conn = psycopg2.connect(
    host="ntaqnyegiiwtzdyqjiwy.supabase.co",
    port=5432,
    dbname="postgres",
    user="postgres",
    password=SERVICE_KEY,
    sslmode="require",
    connect_timeout=5
)
print("✓ 连接成功")
conn.close()
