'use client';

import * as React from 'react';
import type { TabType, TabConfig } from '../types';

interface ResultTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
  tabConfigs?: TabConfig[]; // 可选，传入则使用自定义配置
}

export function ResultTabs({ activeTab, onTabChange, children, tabConfigs }: ResultTabsProps) {
  const tabRefs = React.useRef<Map<TabType, HTMLButtonElement>>(new Map());

  // 使用传入的配置或默认配置
  const configs = tabConfigs || [];

  // 键盘导航处理
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    const tabCount = configs.length;
    let newIndex: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % tabCount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = tabCount - 1;
        break;
    }

    if (newIndex !== null) {
      const newTab = configs[newIndex];
      onTabChange(newTab.id);
      // 聚焦到新标签
      tabRefs.current.get(newTab.id)?.focus();
    }
  }, [configs, onTabChange]);

  // 如果没有配置，渲染空内容
  if (configs.length === 0) {
    return <div>{children}</div>;
  }

  return (
    <div>
      {/* 标签页导航 */}
      <div className="border-b border-border-default mb-4">
        <nav
          className="flex gap-1"
          role="tablist"
          aria-label="分析结果标签页"
        >
          {configs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-emphasis focus-visible:ring-offset-2
                  ${isActive
                    ? 'border-accent-emphasis text-accent-fg'
                    : 'border-transparent text-fg-muted hover:text-fg-default hover:border-border-default'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
