/**
 * Page Agent Wrapper
 * LLM calls are proxied through the backend (no API key on frontend).
 */
import type { AIConfig } from '@/types/ai';

let PageAgentClass: typeof import('page-agent').PageAgent | null = null;

async function loadPageAgent(): Promise<typeof import('page-agent').PageAgent> {
  if (PageAgentClass) return PageAgentClass;
  const module = await import('page-agent');
  PageAgentClass = module.PageAgent;
  return PageAgentClass;
}

function getProxyBaseURL(): string {
  if (typeof window === 'undefined') return '/api/v1/ai/proxy';
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
  if (apiBase.startsWith('http')) {
    return `${apiBase}/v1/ai/proxy`;
  }
  return `${window.location.origin}${apiBase}/v1/ai/proxy`;
}

export class PageAgentWrapper {
  private agent: import('page-agent').PageAgent | null = null;
  private config: AIConfig;
  private initialized = false;

  constructor(config: AIConfig) {
    this.config = config;
  }

  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const PageAgent = await loadPageAgent();
      const baseURL = this.config.openaiApiEndpoint || getProxyBaseURL();

      this.agent = new PageAgent({
        model: this.config.openaiModel || 'gpt-4',
        baseURL,
        apiKey: 'schema-proxy',
        language: 'zh-CN',
      });
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PageAgent:', error);
      throw error;
    }
  }

  async execute(command: string): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      await this.init();

      if (!this.agent) {
        return { success: false, error: 'PageAgent 未初始化' };
      }

      const result = await this.agent.execute(command);
      return {
        success: true,
        result: typeof result === 'string' ? result : JSON.stringify(result),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('PageAgent execution error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  reset(): void {
    this.agent = null;
    this.initialized = false;
  }
}

export function createPageAgent(config: AIConfig): PageAgentWrapper {
  return new PageAgentWrapper(config);
}
