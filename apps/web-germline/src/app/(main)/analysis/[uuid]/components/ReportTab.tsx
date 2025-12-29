'use client';

import * as React from 'react';
import { Button, Select, Tag, FormItem } from '@schema/ui-kit';
import { FileText, Play, Clock, CheckCircle, XCircle, Loader2, Download, ExternalLink } from 'lucide-react';

// 报告模板类型（从流程中心获取）
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
}

// 报告生成记录
interface ReportRecord {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  errorMessage?: string;
}

// Mock 启用的报告模板
const mockActiveTemplates: ReportTemplate[] = [
  {
    id: 'TPL001',
    name: 'wes-germline-report',
    description: '全外显子遗传病检测报告模板',
    apiEndpoint: 'https://api.example.com/reports/wes/generate',
  },
  {
    id: 'TPL002',
    name: 'cardio-panel-report',
    description: '心血管疾病基因检测专用报告',
    apiEndpoint: 'https://api.example.com/reports/panel/cardio',
  },
  {
    id: 'TPL003',
    name: 'cnv-detection-report',
    description: '拷贝数变异检测报告',
    apiEndpoint: 'https://api.example.com/reports/cnv/generate',
  },
];

// Mock 报告生成记录
const mockReportRecords: ReportRecord[] = [
  {
    id: 'RPT001',
    templateId: 'TPL001',
    templateName: 'wes-germline-report',
    status: 'completed',
    createdAt: '2024-12-28 14:30:00',
    completedAt: '2024-12-28 14:32:15',
    downloadUrl: '/reports/RPT001.pdf',
  },
  {
    id: 'RPT002',
    templateId: 'TPL002',
    templateName: 'cardio-panel-report',
    status: 'failed',
    createdAt: '2024-12-28 15:00:00',
    errorMessage: 'API 连接超时',
  },
];

interface ReportTabProps {
  taskId: string;
}

const statusConfig: Record<ReportRecord['status'], { label: string; variant: 'warning' | 'info' | 'success' | 'danger'; icon: React.ReactNode }> = {
  pending: { label: '等待中', variant: 'warning', icon: <Clock className="w-4 h-4" /> },
  generating: { label: '生成中', variant: 'info', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  completed: { label: '已完成', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  failed: { label: '失败', variant: 'danger', icon: <XCircle className="w-4 h-4" /> },
};

export function ReportTab({ taskId }: ReportTabProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('');
  const [records, setRecords] = React.useState<ReportRecord[]>(mockReportRecords);
  const [generating, setGenerating] = React.useState(false);

  const templateOptions = mockActiveTemplates.map((t) => ({
    value: t.id,
    label: `${t.name} - ${t.description}`,
  }));

  const selectedTemplateInfo = mockActiveTemplates.find((t) => t.id === selectedTemplate);

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedTemplateInfo) return;

    setGenerating(true);

    // 创建新记录
    const newRecord: ReportRecord = {
      id: `RPT${String(records.length + 1).padStart(3, '0')}`,
      templateId: selectedTemplate,
      templateName: selectedTemplateInfo.name,
      status: 'generating',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setRecords((prev) => [newRecord, ...prev]);

    // 模拟生成过程
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 模拟完成
    setRecords((prev) =>
      prev.map((r) =>
        r.id === newRecord.id
          ? {
              ...r,
              status: Math.random() > 0.2 ? 'completed' : 'failed',
              completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              downloadUrl: Math.random() > 0.2 ? `/reports/${newRecord.id}.pdf` : undefined,
              errorMessage: Math.random() <= 0.2 ? '报告生成失败，请重试' : undefined,
            }
          : r
      )
    );

    setGenerating(false);
    setSelectedTemplate('');
  };

  const handleRetry = async (record: ReportRecord) => {
    // 更新状态为生成中
    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, status: 'generating' as const, errorMessage: undefined }
          : r
      )
    );

    // 模拟重试
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setRecords((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? {
              ...r,
              status: 'completed' as const,
              completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              downloadUrl: `/reports/${record.id}.pdf`,
            }
          : r
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 生成报告区域 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h3 className="text-sm font-medium text-fg-default mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          生成新报告
        </h3>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <FormItem label="选择报告模板">
              <Select
                value={selectedTemplate}
                onChange={(value) => {
                  if (typeof value === 'string') {
                    setSelectedTemplate(value);
                  }
                }}
                options={templateOptions}
                placeholder="请选择报告模板..."
              />
            </FormItem>
          </div>
          <Button
            variant="primary"
            leftIcon={generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            onClick={handleGenerate}
            disabled={!selectedTemplate || generating}
          >
            {generating ? '生成中...' : '生成报告'}
          </Button>
        </div>
        {selectedTemplateInfo && (
          <p className="text-xs text-fg-muted mt-2">
            API: <span className="font-mono">{selectedTemplateInfo.apiEndpoint}</span>
          </p>
        )}
      </div>

      {/* 报告记录列表 */}
      <div>
        <h3 className="text-sm font-medium text-fg-default mb-3">报告记录</h3>
        {records.length === 0 ? (
          <div className="text-center py-8 text-fg-muted">
            暂无报告记录
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((record) => {
              const status = statusConfig[record.status];
              return (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-canvas-default border border-border-default rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-${status.variant}-fg`}>
                      {status.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-fg-default font-mono">
                          {record.templateName}
                        </span>
                        <Tag variant={status.variant}>{status.label}</Tag>
                      </div>
                      <div className="text-xs text-fg-muted mt-0.5">
                        创建于 {record.createdAt}
                        {record.completedAt && ` · 完成于 ${record.completedAt}`}
                      </div>
                      {record.errorMessage && (
                        <div className="text-xs text-danger-fg mt-1">
                          {record.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {record.status === 'completed' && record.downloadUrl && (
                      <>
                        <Button
                          variant="secondary"
                          size="small"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={() => window.open(record.downloadUrl, '_blank')}
                        >
                          下载
                        </Button>
                        <Button
                          variant="ghost"
                          size="small"
                          iconOnly
                          aria-label="在新窗口打开"
                          leftIcon={<ExternalLink className="w-4 h-4" />}
                          onClick={() => window.open(record.downloadUrl, '_blank')}
                        />
                      </>
                    )}
                    {record.status === 'failed' && (
                      <Button
                        variant="secondary"
                        size="small"
                        leftIcon={<Play className="w-4 h-4" />}
                        onClick={() => handleRetry(record)}
                      >
                        重试
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
