/**
 * 心动投递 - 会话列表 API
 * GET /api/chat/conversations
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // TODO: 从请求中获取用户认证信息
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取用户的所有会话
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        match_id,
        user1_id,
        user2_id,
        status,
        last_message_id,
        last_message_at,
        last_message_preview,
        user1_unread_count,
        user2_unread_count,
        icebreaker_used,
        created_at,
        updated_at,
        match:weekly_matches!inner(
          id,
          matched_user_id,
          total_score,
          match_reasons,
          users!weekly_matches_matched_user_id_fkey(
            id,
            nickname,
            avatar_url,
            gender
          )
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .neq('status', 'blocked')
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('获取会话列表失败:', error);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '获取会话列表失败' } },
        { status: 500 }
      );
    }

    // 处理会话数据，添加对方用户信息
    const processedConversations = conversations.map((conv: Record<string, unknown>) => {
      const isUser1 = conv.user1_id === userId;
      const otherUserId = isUser1 ? conv.user2_id : conv.user1_id;
      const unreadCount = isUser1 ? conv.user1_unread_count : conv.user2_unread_count;

      // 获取对方用户信息
      let otherUser = null;
      if (conv.match) {
        const matchData = conv.match as Record<string, unknown>;
        if (matchData.users) {
          otherUser = matchData.users;
        }
      }

      return {
        id: conv.id,
        matchId: conv.match_id,
        otherUser,
        lastMessage: conv.last_message_preview,
        lastMessageAt: conv.last_message_at,
        unreadCount,
        matchScore: (conv.match as Record<string, unknown>)?.total_score,
        matchReasons: (conv.match as Record<string, unknown>)?.match_reasons,
        icebreakerUsed: conv.icebreaker_used,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        conversations: processedConversations,
      },
    });

  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
