'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
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
          w-32 h-32
          transition-all duration-200
          hover:drop-shadow-lg
          focus:outline-none
          ${isExecuting ? 'animate-spin' : ''}
        `}
        aria-label="AI 助手"
        title={isConfigured ? 'AI 助手' : '请先配置 AI 服务'}
      >
        {isExecuting ? (
          <Loader2 className="w-20 h-20 text-blue-600" />
        ) : (
          <img
            src="/mascot.png"
            alt="AI 助手"
            className="w-32 h-32 object-contain"
          />
        )}
      </button>

      {/* 对话框 */}
      {isOpen && (
        <AssistantDialog onClose={handleClose} isMobile={isMobile} />
      )}
    </>
  );
}