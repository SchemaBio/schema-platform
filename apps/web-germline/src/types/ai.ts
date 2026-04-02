/**
 * AI Configuration Types
 * 用于全局 AI 设置和智能助手功能
 */

/**
 * AI 服务配置
 */
export interface AIConfig {
  /** OpenAI API 端点 */
  openaiApiEndpoint: string;
  /** OpenAI API Key */
  openaiApiKey: string;
  /** 使用的模型名称 */
  openaiModel: string;
  /** AI 助手是否启用 */
  aiAssistantEnabled: boolean;
}

/**
 * 对话消息类型
 */
export interface ConversationMessage {
  /** 消息唯一 ID */
  id: string;
  /** 消息角色：用户或助手 */
  role: 'user' | 'assistant';
  /** 消息内容 */
  content: string;
  /** 消息时间戳 */
  timestamp: number;
  /** 执行状态 */
  status?: 'pending' | 'executing' | 'completed' | 'error';
  /** 执行结果描述 */
  actionResult?: string;
}

/**
 * 默认 AI 配置
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  openaiApiEndpoint: 'https://api.openai.com/v1',
  openaiApiKey: '',
  openaiModel: 'gpt-4',
  aiAssistantEnabled: true,
};

/**
 * localStorage 存储键名
 */
export const AI_STORAGE_KEYS = {
  CONFIG: 'schema_ai_config',
  HISTORY: 'schema_ai_history',
};

/**
 * 最大历史消息数量限制
 * 防止 localStorage 存储溢出
 */
export const MAX_HISTORY_MESSAGES = 50;