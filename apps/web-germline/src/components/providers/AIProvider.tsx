'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { AIConfig, ConversationMessage } from '@/types/ai';
import { DEFAULT_AI_CONFIG, AI_STORAGE_KEYS, MAX_HISTORY_MESSAGES } from '@/types/ai';
import { createPageAgent, PageAgentWrapper } from '@/lib/pageAgent';

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
  /** 执行自然语言指令 */
  executeCommand: (command: string) => Promise<void>;
  /** 是否正在执行指令 */
  isExecuting: boolean;
  /** page-agent 实例 */
  agent: PageAgentWrapper | null;
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
  const agentRef = useRef<PageAgentWrapper | null>(null);

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

  // 当配置完整且启用时，创建 page-agent 实例
  useEffect(() => {
    if (isEnabled) {
      agentRef.current = createPageAgent(config);
    } else {
      agentRef.current = null;
    }
  }, [config, isEnabled]);

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

  // 执行自然语言指令
  const executeCommand = useCallback(async (command: string) => {
    if (!agentRef.current || isExecuting) {
      return;
    }

    // 添加用户消息
    const userMessage: ConversationMessage = {
      id: generateId(),
      role: 'user',
      content: command,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // 添加助手消息（执行中状态）
    const assistantMessage: ConversationMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'executing',
    };
    addMessage(assistantMessage);

    setIsExecuting(true);

    try {
      // 执行指令
      const result = await agentRef.current.execute(command);

      // 更新助手消息
      setHistory(prev => prev.map(msg => {
        if (msg.id === assistantMessage.id) {
          return {
            ...msg,
            content: result.success ? `已执行: ${command}` : `执行失败: ${result.error}`,
            status: result.success ? 'completed' : 'error',
            actionResult: result.result,
          };
        }
        return msg;
      }));
    } catch (error) {
      // 更新助手消息为错误状态
      setHistory(prev => prev.map(msg => {
        if (msg.id === assistantMessage.id) {
          return {
            ...msg,
            content: `执行出错: ${error instanceof Error ? error.message : '未知错误'}`,
            status: 'error',
          };
        }
        return msg;
      }));
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, addMessage]);

  const value: AIContextType = {
    config,
    setConfig,
    isConfigured,
    isEnabled,
    history,
    addMessage,
    clearHistory,
    executeCommand,
    isExecuting,
    agent: agentRef.current,
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