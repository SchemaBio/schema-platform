'use client';

import * as React from 'react';
import type { QCResult, QCStatus, QCMetricKey } from '../types';
import { getQCResult } from '../mock-data';

interface QCResultTabProps {
  taskId: string;
}

// QC指标配置
interface QCMetricConfig {
  key: QCMetricKey;
  label: string;
  unit: string;
  format: (value: number) => string;
  thresholds: {
    warningMin?: number;
    warningMax?: number;
    errorMin?: number;
    errorMax?: number;
  };
}

const QC_METRICS: QCMetricConfig[] = [
  {
    key: 'totalReads',
    label: '总读数',
    unit: '',
    format: (v) => `${(v / 1000000).toFixed(1)}M`,
    thresholds: { errorMin: 50000000, warningMin: 80000000 },
  },
  {
    key: 'mappingRate',
    label: '比对率',
    unit: '%',
    format: (v) => `${(v * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.9, warningMin: 0.95 },
  },
  {
    key: 'averageDepth',
    label: '平均覆盖深度',
    unit: 'X',
    format: (v) => `${v.toFixed(1)}X`,
    thresholds: { errorMin: 50, warningMin: 100 },
  },
  {
    key: 'targetCoverage',
    label: '目标区域覆盖率',
    unit: '%',
    format: (v) => `${(v * 100).toFixed(2)}%`,
    thresholds: { errorMin: 0.95, warningMin: 0.98 },
  },
  {
    key: 'duplicateRate',
    label: '重复率',
    unit: '%',
    format: (v) => `${(v * 100).toFixed(1)}%`,
    thresholds: { errorMax: 0.3, warningMax: 0.2 },
  },
  {
    key: 'q30Rate',
    label: 'Q30比例',
    unit: '%',
    format: (v) => `${(v * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.8, warningMin: 0.85 },
  },
  {
    key: 'insertSize',
    label: '插入片段大小',
    unit: 'bp',
    format: (v) => `${v}bp`,
    thresholds: { errorMin: 100, errorMax: 400, warningMin: 150, warningMax: 300 },
  },
];

// 计算指标状态
export function getMetricStatus(value: number, thresholds: QCMetricConfig['thresholds']): QCStatus {
  const { warningMin, warningMax, errorMin, errorMax } = thresholds;

  // 检查错误阈值
  if (errorMin !== undefined && value < errorMin) return 'danger';
  if (errorMax !== undefined && value > errorMax) return 'danger';

  // 检查警告阈值
  if (warningMin !== undefined && value < warningMin) return 'warning';
  if (warningMax !== undefined && value > warningMax) return 'warning';

  return 'success';
}

// 状态颜色映射
const statusColors: Record<QCStatus, { bg: string; text: string; border: string }> = {
  success: { bg: 'bg-success-subtle', text: 'text-success-fg', border: 'border-success-emphasis' },
  warning: { bg: 'bg-warning-subtle', text: 'text-warning-fg', border: 'border-warning-emphasis' },
  danger: { bg: 'bg-danger-subtle', text: 'text-danger-fg', border: 'border-danger-emphasis' },
};

export function QCResultTab({ taskId }: QCResultTabProps) {
  const [qcResult, setQCResult] = React.useState<QCResult | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getQCResult(taskId);
      setQCResult(data);
      setLoading(false);
    }
    loadData();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  if (!qcResult) {
    return (
      <div className="text-center py-12 text-fg-muted">
        暂无质控数据
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-medium text-fg-default mb-4">质控指标</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {QC_METRICS.map((metric) => {
          const value = qcResult[metric.key];
          const status = getMetricStatus(value, metric.thresholds);
          const colors = statusColors[status];

          return (
            <div
              key={metric.key}
              className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border}`}
            >
              <div className="text-sm text-fg-muted mb-1">{metric.label}</div>
              <div className={`text-xl font-semibold ${colors.text}`}>
                {metric.format(value)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例说明 */}
      <div className="mt-6 flex items-center gap-6 text-sm text-fg-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success-emphasis" />
          <span>达标</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning-emphasis" />
          <span>警告</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-danger-emphasis" />
          <span>不达标</span>
        </div>
      </div>
    </div>
  );
}
