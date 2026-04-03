/**
 * Page Agent Wrapper
 * 封装 page-agent 库，用于通过自然语言控制页面
 */

import type { AIConfig } from '@/types/ai';

// 动态导入 page-agent，避免 SSR 问题
let PageAgentClass: typeof import('page-agent').PageAgent | null = null;

/**
 * 动态加载 PageAgent 类
 */
async function loadPageAgent(): Promise<typeof import('page-agent').PageAgent> {
  if (PageAgentClass) {
    return PageAgentClass;
  }

  // 动态导入
  const module = await import('page-agent');
  PageAgentClass = module.PageAgent;
  return PageAgentClass;
}

/**
 * PageAgent 包装类
 * 提供统一的执行接口
 */
export class PageAgentWrapper {
  private agent: import('page-agent').PageAgent | null = null;
  private config: AIConfig;
  private initialized = false;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * 初始化 agent
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const PageAgent = await loadPageAgent();
      this.agent = new PageAgent({
        model: this.config.openaiModel,
        baseURL: this.config.openaiApiEndpoint,
        apiKey: this.config.openaiApiKey,
        language: 'zh-CN', // 中文
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PageAgent:', error);
      throw error;
    }
  }

  /**
   * 执行自然语言指令
   * @param command 自然语言指令
   * @returns 执行结果
   */
  async execute(command: string): Promise<{
    success: boolean;
    result?: string;
    error?: string;
  }> {
    try {
      await this.init();

      if (!this.agent) {
        return {
          success: false,
          error: 'PageAgent 未初始化',
        };
      }

      // 执行指令
      const result = await this.agent.execute(command);

      return {
        success: true,
        result: typeof result === 'string' ? result : JSON.stringify(result),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('PageAgent execution error:', errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 重置 agent（配置更新时使用）
   */
  reset(): void {
    this.agent = null;
    this.initialized = false;
  }
}

/**
 * 创建 PageAgentWrapper 实例
 */
export function createPageAgent(config: AIConfig): PageAgentWrapper {
  return new PageAgentWrapper(config);
}