'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, Input, FormItem } from '@schema/ui-kit';
import { Save, Eye, EyeOff, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// 模拟当前用户数据 - 实际应从认证上下文获取
const mockCurrentUser = {
  role: 'admin' as const,
};

interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export default function AISettingsPage() {
  const isAdmin = mockCurrentUser.role === 'admin';

  // 非管理员无权访问
  if (!isAdmin) {
    return (
      <PageContent>
        <div className="rounded-lg border border-border bg-canvas-subtle p-8 text-center">
          <p className="text-fg-muted">您没有权限访问此页面</p>
        </div>
      </PageContent>
    );
  }
  const [config, setConfig] = React.useState<AIConfig>({
    endpoint: '',
    apiKey: '',
    model: '',
  });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<'success' | 'error' | null>(null);

  const handleSave = async () => {
    if (!config.endpoint || !config.apiKey || !config.model) {
      alert('请填写所有必填项');
      return;
    }
    setSaving(true);
    // 模拟保存
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('AI设置已保存');
  };

  const handleTest = async () => {
    if (!config.endpoint || !config.apiKey || !config.model) {
      alert('请先填写所有必填项');
      return;
    }
    setTesting(true);
    setTestResult(null);
    
    // 模拟测试连接
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // 模拟随机成功/失败（实际应调用后端API测试）
    const success = Math.random() > 0.3;
    setTestResult(success ? 'success' : 'error');
    setTesting(false);
  };

  const handleInputChange = (field: keyof AIConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">AI 设置</h2>
      
      <div className="max-w-2xl space-y-6">
        {/* 说明 */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <p className="text-sm text-fg-muted">
            配置AI服务用于变异解读、报告生成等智能功能。使用 OpenAI 兼容格式的 API 端点。
          </p>
        </div>

        {/* API 端点 */}
        <FormItem label="API 端点" required>
          <Input
            value={config.endpoint}
            onChange={(e) => handleInputChange('endpoint', e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
          <p className="text-xs text-fg-muted mt-1">
            支持 OpenAI 或兼容 OpenAI 格式的 API 端点
          </p>
        </FormItem>

        {/* API Key */}
        <FormItem label="API Key" required>
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="sk-..."
            rightElement={
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="p-1 hover:bg-canvas-subtle rounded"
                aria-label={showApiKey ? '隐藏' : '显示'}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
          />
          <p className="text-xs text-fg-muted mt-1">
            API Key 将加密存储，请妥善保管
          </p>
        </FormItem>

        {/* 模型 */}
        <FormItem label="模型" required>
          <Input
            value={config.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            placeholder="gpt-4"
          />
          <p className="text-xs text-fg-muted mt-1">
            填写要使用的模型名称，如 gpt-4、gpt-4-turbo、gpt-3.5-turbo 等
          </p>
        </FormItem>

        {/* 测试结果 */}
        {testResult && (
          <div
            className={`
              flex items-center gap-2 p-3 rounded-lg border
              ${testResult === 'success' 
                ? 'bg-success-subtle border-success-emphasis text-success-fg' 
                : 'bg-danger-subtle border-danger-emphasis text-danger-fg'
              }
            `}
          >
            {testResult === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">连接测试成功！AI 服务配置正确。</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span className="text-sm">连接测试失败，请检查端点和 API Key 是否正确。</span>
              </>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            leftIcon={testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            onClick={handleTest}
            disabled={testing || !config.endpoint || !config.apiKey || !config.model}
          >
            {testing ? '测试中...' : '测试连接'}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            loading={saving}
          >
            保存设置
          </Button>
        </div>
      </div>
    </PageContent>
  );
}
