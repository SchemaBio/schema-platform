'use client';

import * as React from 'react';
import { Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAI } from '@/components/providers/AIProvider';
import type { ConversationMessage } from '@/types/ai';

/**
 * 聊天消息组件
 */
function MessageItem({ message }: { message: ConversationMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`
        flex ${isUser ? 'justify-end' : 'justify-start'}
        mb-2
      `}
    >
      <div
        className={`
          max-w-[80%]
          px-3 py-2
          rounded-lg
          ${isUser
            ? 'bg-accent-emphasis text-white'
            : 'bg-canvas-subtle text-fg-default'
          }
        `}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* 状态图标 */}
        {!isUser && message.status && (
          <div className="flex items-center gap-1 mt-1">
            {message.status === 'executing' && (
              <Loader2 className="w-3 h-3 animate-spin text-fg-muted" />
            )}
            {message.status === 'completed' && (
              <CheckCircle className="w-3 h-3 text-success-fg" />
            )}
            {message.status === 'error' && (
              <XCircle className="w-3 h-3 text-danger-fg" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * AI 助手聊天组件
 */
export function AssistantChat() {
  const { history, executeCommand, isExecuting } = useAI();
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isExecuting) return;

    const command = input.trim();
    setInput('');
    await executeCommand(command);
  };

  // 键盘事件：Enter 发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-fg-muted mb-4">
              您可以使用自然语言控制页面，例如：
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-fg-muted">• "点击样本列表"</p>
              <p className="text-fg-muted">• "新建一个样本"</p>
              <p className="text-fg-muted">• "跳转到管理中心"</p>
              <p className="text-fg-muted">• "填写表单"</p>
            </div>
          </div>
        ) : (
          <>
            {history.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 输入区域 */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isExecuting ? '执行中...' : '输入指令...'}
          disabled={isExecuting}
          className={`
            flex-1
            px-3 py-2
            text-sm
            bg-canvas-subtle
            border border-border
            rounded-md
            focus:outline-none focus:ring-2 focus:ring-accent-emphasis
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isExecuting}
          className={`
            flex items-center justify-center
            w-10 h-10
            rounded-md
            bg-accent-emphasis
            text-white
            hover:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          `}
          aria-label="发送"
        >
          {isExecuting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}