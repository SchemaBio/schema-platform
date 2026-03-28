'use client';

import * as React from 'react';
import type { QCResult, QCStatus, QCMetricKey } from '../types';
import { getQCResult } from '../mock-data';

interface QCResultTabProps {
  taskId: string;
}

// QC指标配置
interface QCMetricConfig {
  key: keyof QCResult;
  label: string;
  unit: string;
  format: (value: number | string) => string;
  thresholds?: {
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
    format: (v) => `${(Number(v) / 1000000).toFixed(1)}M`,
    thresholds: { errorMin: 50000000, warningMin: 80000000 },
  },
  {
    key: 'mappingRate',
    label: '比对率',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.9, warningMin: 0.95 },
  },
  {
    key: 'averageDepth',
    label: '平均深度',
    unit: 'X',
    format: (v) => `${Number(v).toFixed(1)}X`,
    thresholds: { errorMin: 50, warningMin: 100 },
  },
  {
    key: 'dedupDepth',
    label: '去重深度',
    unit: 'X',
    format: (v) => `${Number(v).toFixed(1)}X`,
    thresholds: { errorMin: 40, warningMin: 80 },
  },
  {
    key: 'targetCoverage',
    label: '目标覆盖率',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(2)}%`,
    thresholds: { errorMin: 0.95, warningMin: 0.98 },
  },
  {
    key: 'duplicateRate',
    label: '重复率',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMax: 0.3, warningMax: 0.2 },
  },
  {
    key: 'q30Rate',
    label: 'Q30比例',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.8, warningMin: 0.85 },
  },
  {
    key: 'insertSize',
    label: '插入片段',
    unit: 'bp',
    format: (v) => `${v}bp`,
    thresholds: { errorMin: 100, errorMax: 400, warningMin: 150, warningMax: 300 },
  },
  {
    key: 'gcRatio',
    label: 'GC比例',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.35, errorMax: 0.65, warningMin: 0.40, warningMax: 0.60 },
  },
  {
    key: 'uniformity',
    label: '均一性',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.80, warningMin: 0.90 },
  },
  {
    key: 'captureEfficiency',
    label: '捕获效率',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.50, warningMin: 0.65 },
  },
  {
    key: 'predictedGender',
    label: '性别预测',
    unit: '',
    format: (v) => v === 'Male' ? '男' : v === 'Female' ? '女' : '未知',
  },
  {
    key: 'contaminationRate',
    label: '污染比例',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(2)}%`,
    thresholds: { errorMax: 0.03, warningMax: 0.01 },
  },
  {
    key: 'mtCoverage',
    label: '线粒体覆盖度',
    unit: '%',
    format: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    thresholds: { errorMin: 0.90, warningMin: 0.95 },
  },
  {
    key: 'mtDepth',
    label: '线粒体深度',
    unit: 'X',
    format: (v) => `${Number(v).toFixed(0)}X`,
    thresholds: { errorMin: 500, warningMin: 1000 },
  },
];

// 计算指标状态
export function getMetricStatus(value: number | string, thresholds?: QCMetricConfig['thresholds']): QCStatus {
  if (!thresholds || typeof value === 'string') return 'success';

  const numValue = Number(value);
  const { warningMin, warningMax, errorMin, errorMax } = thresholds;

  // 检查错误阈值
  if (errorMin !== undefined && numValue < errorMin) return 'danger';
  if (errorMax !== undefined && numValue > errorMax) return 'danger';

  // 检查警告阈值
  if (warningMin !== undefined && numValue < warningMin) return 'warning';
  if (warningMax !== undefined && numValue > warningMax) return 'warning';

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
      <h3 className="text-sm font-medium text-fg-default mb-3">质控指标</h3>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {QC_METRICS.map((metric) => {
          const value = qcResult[metric.key];
          const status = getMetricStatus(value, metric.thresholds);
          const colors = statusColors[status];

          return (
            <div
              key={metric.key}
              className={`px-3 py-2 rounded-md border-l-3 ${colors.bg} ${colors.border}`}
            >
              <div className="text-xs text-fg-muted mb-0.5">{metric.label}</div>
              <div className={`text-base font-semibold ${colors.text}`}>
                {metric.format(value)}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图例说明 */}
      <div className="mt-4 flex items-center gap-4 text-xs text-fg-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-success-emphasis" />
          <span>达标</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-warning-emphasis" />
          <span>警告</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-danger-emphasis" />
          <span>不达标</span>
        </div>
      </div>
    </div>
  );
}
