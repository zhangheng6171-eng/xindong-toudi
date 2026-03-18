/**
 * 心动投递 - 消息 API
 * GET /api/chat/messages - 获取消息列表
 * POST /api/chat/messages - 发送消息
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 获取消息列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const offset = (page - 1) * pageSize;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PARAMS', message: '缺少会话ID' } },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 验证用户是否有权限访问该会话
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user1_id, user2_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'CONVERSATION_NOT_FOUND', message: '会话不存在' } },
        { status: 404 }
      );
    }

    const isParticipant = 
      (conversation as Record<string, unknown>).user1_id === userId ||
      (conversation as Record<string, unknown>).user2_id === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问该会话' } },
        { status: 403 }
      );
    }

    // 获取消息
    const { data: messages, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .neq('status', 'recalled')
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('获取消息失败:', error);
      return NextResponse.json(
        { success: false, error: { code: 'DATABASE_ERROR', message: '获取消息失败' } },
        { status: 500 }
      );
    }

    const hasMore = count ? offset + pageSize < count : false;

    return NextResponse.json({
      success: true,
      data: {
        messages: (messages || []).reverse(),
        hasMore,
        page,
        pageSize,
        total: count,
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

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      conversationId,
      messageType = 'text',
      content,
      mediaUrl,
      mediaType,
      mediaSize,
      mediaDuration,
      replyToId,
    } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PARAMS', message: '缺少必要参数' } },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 验证用户是否有权限发送消息
    const { data: conversation } = await supabase
      .from('conversations')
      .select('user1_id, user2_id, status')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: { code: 'CONVERSATION_NOT_FOUND', message: '会话不存在' } },
        { status: 404 }
      );
    }

    const conv = conversation as Record<string, unknown>;
    const isParticipant = conv.user1_id === userId || conv.user2_id === userId;

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权发送消息' } },
        { status: 403 }
      );
    }

    if (conv.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: { code: 'CONVERSATION_BLOCKED', message: '会话已被屏蔽' } },
        { status: 403 }
      );
    }

    // TODO: 敏感词过滤
    const filteredContent = content;

    // 插入消息
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        message_type: messageType,
        content: filteredContent,
        media_url: mediaUrl,
        media_type: mediaType,
        media_size: mediaSize,
        media_duration: mediaDuration,
        status: 'sent',
        reply_to_id: replyToId,
      })
      .select()
      .single();

    if (error) {
      console.error('发送消息失败:', error);
      return NextResponse.json(
        { success: false, error: { code: 'SEND_FAILED', message: '发送消息失败' } },
        { status: 500 }
      );
    }

    // 更新会话最后消息
    const truncatedPreview = filteredContent.length > 200
      ? filteredContent.substring(0, 200) + '...'
      : filteredContent;

    await supabase
      .from('conversations')
      .update({
        last_message_id: message.id,
        last_message_at: new Date().toISOString(),
        last_message_preview: truncatedPreview,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    // TODO: 发送推送通知给对方

    return NextResponse.json({
      success: true,
      data: { message },
    });

  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    );
  }
}
