'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AIConfig, ConversationMessage } from '@/types/ai';
import { DEFAULT_AI_CONFIG, AI_STORAGE_KEYS, MAX_HISTORY_MESSAGES } from '@/types/ai';

interface AIContextType {
  /** AI 配置 */
  config: AIConfig;
  /** 更新配置 */
  setConfig: (config: Partial<AIConfig>) => void;
  /** 配置是否完整（endpoint + apiKey + model 都已填写） */
  isConfigured: boolean;
  /** AI 助手是否启用 */
  isEnabled: boolean;
  /** 对话历史 */
  history: ConversationMessage[];
  /** 添加消息到历史 */
  addMessage: (message: ConversationMessage) => void;
  /** 清空对话历史 */
  clearHistory: () => void;
  /** 是否正在执行指令 */
  isExecuting: boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfigState] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  // 计算派生状态
  const isConfigured = Boolean(
    config.openaiApiEndpoint &&
    config.openaiApiKey &&
    config.openaiModel
  );
  const isEnabled = config.aiAssistantEnabled && isConfigured;

  // 从 localStorage 加载配置和历史
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedConfig = localStorage.getItem(AI_STORAGE_KEYS.CONFIG);
        const storedHistory = localStorage.getItem(AI_STORAGE_KEYS.HISTORY);

        if (storedConfig) {
          const parsedConfig = JSON.parse(storedConfig);
          setConfigState({ ...DEFAULT_AI_CONFIG, ...parsedConfig });
        }

        if (storedHistory) {
          const parsedHistory = JSON.parse(storedHistory);
          // 限制历史数量
          setHistory(parsedHistory.slice(-MAX_HISTORY_MESSAGES));
        }
      } catch (error) {
        console.error('Failed to load stored AI data:', error);
      }
    };

    loadStoredData();
  }, []);

  // 配置变化时保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AI_STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  }, [config]);

  // 历史变化时保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(AI_STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save AI history:', error);
    }
  }, [history]);

  // 更新配置（部分更新）
  const setConfig = useCallback((partialConfig: Partial<AIConfig>) => {
    setConfigState(prev => ({ ...prev, ...partialConfig }));
  }, []);

  // 添加消息到历史
  const addMessage = useCallback((message: ConversationMessage) => {
    setHistory(prev => {
      const newHistory = [...prev, message];
      // 限制历史数量
      return newHistory.slice(-MAX_HISTORY_MESSAGES);
    });
  }, []);

  // 清空历史
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(AI_STORAGE_KEYS.HISTORY);
  }, []);

  const value: AIContextType = {
    config,
    setConfig,
    isConfigured,
    isEnabled,
    history,
    addMessage,
    clearHistory,
    isExecuting,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

/**
 * 使用 AI 上下文的 hook
 */
export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}