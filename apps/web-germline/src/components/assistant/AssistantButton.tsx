'use client';

import * as React from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { useAI } from '@/components/providers/AIProvider';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AssistantDialog } from './AssistantDialog';

/**
 * AI 助手浮动按钮
 * 位于页面右下角，点击展开对话框
 */
export function AssistantButton() {
  const { isConfigured, isExecuting } = useAI();
  const [isOpen, setIsOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // 处理点击
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  // 处理对话框关闭
  const handleClose = () => {
    setIsOpen(false);
  };

  // 位置样式：桌面端 bottom-4 right-4，移动端避开底部导航栏
  const positionStyle = isMobile
    ? 'fixed bottom-20 right-4 z-40'
    : 'fixed bottom-4 right-4 z-40';

  return (
    <>
      {/* 浮动按钮 */}
      <button
        onClick={handleClick}
        className={`
          ${positionStyle}
          flex items-center justify-center
          w-12 h-12 rounded-full
          shadow-lg
          border-2 border-white
          transition-all duration-200
          hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${isConfigured
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-500 hover:bg-gray-600'
          }
        `}
        aria-label="AI 助手"
        title={isConfigured ? 'AI 助手' : '请先配置 AI 服务'}
      >
        {isExecuting ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </button>

      {/* 对话框 */}
      {isOpen && (
        <AssistantDialog onClose={handleClose} isMobile={isMobile} />
      )}
    </>
  );
}