/**
 * 心动投递 - 会话详情 API
 * GET /api/chat/conversations/[id] - 获取会话详情
 * POST /api/chat/conversations/[id]/read - 标记已读
 * POST /api/chat/conversations/[id]/block - 屏蔽会话
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 获取会话详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 获取会话详情
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:weekly_matches!inner(
          id,
          matched_user_id,
          total_score,
          values_score,
          interests_score,
          personality_score,
          match_reasons
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'CONVERSATION_NOT_FOUND', message: '会话不存在' } },
        { status: 404 }
      );
    }

    // 验证权限
    const conv = conversation as Record<string, unknown>;
    const isParticipant = conv.user1_id === userId || conv.user2_id === userId;
    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问该会话' } },
        { status: 403 }
      );
    }

    // 获取对方用户信息
    const isUser1 = conv.user1_id === userId;
    const otherUserId = isUser1 ? conv.user2_id : conv.user1_id;

    const { data: otherUser } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, gender, city')
      .eq('id', otherUserId)
      .single();

    // 获取对方在线状态
    const { data: onlineStatus } = await supabase
      .from('user_online_status')
      .select('is_online, last_seen_at')
      .eq('user_id', otherUserId)
      .single();

    // 获取破冰建议
    const matchReasons = ((conv.match as Record<string, unknown>)?.match_reasons as string[]) || [];

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          id: conv.id,
          matchId: conv.match_id,
          status: conv.status,
          lastMessageAt: conv.last_message_at,
          lastMessagePreview: conv.last_message_preview,
          unreadCount: isUser1 ? conv.user1_unread_count : conv.user2_unread_count,
          icebreakerUsed: conv.icebreaker_used,
          createdAt: conv.created_at,
        },
        otherUser: otherUser ? {
          ...otherUser,
          isOnline: onlineStatus?.is_online || false,
          lastSeenAt: onlineStatus?.last_seen_at,
        } : null,
        matchInfo: {
          totalScore: (conv.match as Record<string, unknown>)?.total_score,
          valuesScore: (conv.match as Record<string, unknown>)?.values_score,
          interestsScore: (conv.match as Record<string, unknown>)?.interests_score,
          personalityScore: (conv.match as Record<string, unknown>)?.personality_score,
          matchReasons,
        },
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

// 标记已读
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const body = await request.json();
    const { action } = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 标记已读
    if (action === 'read') {
      // 获取会话信息
      const { data: conversation } = await supabase
        .from('conversations')
        .select('user1_id, user2_id')
        .eq('id', conversationId)
        .single();

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: { code: 'CONVERSATION_NOT_FOUND', message: '会话不存在' } },
          { status: 404 }
        );
      }

      const conv = conversation as Record<string, unknown>;
      const isUser1 = conv.user1_id === userId;

      // 获取所有未读消息
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .neq('status', 'read');

      if (unreadMessages && unreadMessages.length > 0) {
        // 更新消息状态
        await supabase
          .from('messages')
          .update({ status: 'read', updated_at: new Date().toISOString() })
          .in('id', unreadMessages.map((m: Record<string, unknown>) => m.id));

        // 记录已读状态
        const readStatuses = unreadMessages.map((m: Record<string, unknown>) => ({
          message_id: m.id,
          user_id: userId,
        }));

        await supabase.from('message_read_status').upsert(readStatuses, { onConflict: 'message_id,user_id' });
      }

      // 重置未读计数
      const updateField = isUser1 ? 'user1_unread_count' : 'user2_unread_count';
      await supabase
        .from('conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);

      return NextResponse.json({
        success: true,
        data: { message: '已标记为已读' },
      });
    }

    // 屏蔽会话
    if (action === 'block') {
      await supabase
        .from('conversations')
        .update({ status: 'blocked' })
        .eq('id', conversationId);

      return NextResponse.json({
        success: true,
        data: { message: '会话已屏蔽' },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: '无效的操作' } },
      { status: 400 }
    );

  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
