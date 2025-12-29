'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';

interface BiomarkersTabProps {
  taskId: string;
}

// Mock数据
const mockBiomarkers = {
  msi: {
    status: 'MSS' as 'MSI-H' | 'MSI-L' | 'MSS',
    score: 2.3,
    unstableSites: 2,
    totalSites: 110,
  },
  hrd: {
    score: 42,
    loh: 15,
    tai: 18,
    lst: 9,
    status: 'HRD-positive' as 'HRD-positive' | 'HRD-negative',
  },
  tmb: {
    value: 8.5,
    unit: 'mut/Mb',
    level: 'TMB-Intermediate' as 'TMB-High' | 'TMB-Intermediate' | 'TMB-Low',
  },
  pdl1: {
    tps: 45,
    cps: 52,
  },
};

export function BiomarkersTab({ taskId }: BiomarkersTabProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(mockBiomarkers);

  React.useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setData(mockBiomarkers);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  const getMSIVariant = (status: string): 'danger' | 'warning' | 'success' => {
    switch (status) {
      case 'MSI-H': return 'danger';
      case 'MSI-L': return 'warning';
      default: return 'success';
    }
  };

  const getTMBVariant = (level: string): 'danger' | 'warning' | 'success' => {
    switch (level) {
      case 'TMB-High': return 'danger';
      case 'TMB-Intermediate': return 'warning';
      default: return 'success';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* MSI */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-fg-default">微卫星不稳定性 (MSI)</h3>
          <Tag variant={getMSIVariant(data.msi.status)}>{data.msi.status}</Tag>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-fg-muted">MSI Score</dt>
            <dd className="text-fg-default font-mono">{data.msi.score.toFixed(1)}%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-muted">不稳定位点</dt>
            <dd className="text-fg-default">{data.msi.unstableSites} / {data.msi.totalSites}</dd>
          </div>
        </dl>
      </div>

      {/* HRD */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-fg-default">同源重组缺陷 (HRD)</h3>
          <Tag variant={data.hrd.status === 'HRD-positive' ? 'danger' : 'success'}>{data.hrd.status}</Tag>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-fg-muted">HRD Score</dt>
            <dd className="text-fg-default font-mono">{data.hrd.score}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-muted">LOH</dt>
            <dd className="text-fg-default">{data.hrd.loh}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-muted">TAI</dt>
            <dd className="text-fg-default">{data.hrd.tai}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-muted">LST</dt>
            <dd className="text-fg-default">{data.hrd.lst}</dd>
          </div>
        </dl>
      </div>

      {/* TMB */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-fg-default">肿瘤突变负荷 (TMB)</h3>
          <Tag variant={getTMBVariant(data.tmb.level)}>{data.tmb.level}</Tag>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-fg-muted">TMB值</dt>
            <dd className="text-fg-default font-mono">{data.tmb.value} {data.tmb.unit}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-fg-muted">
          TMB-High: ≥10 mut/Mb | TMB-Intermediate: 6-10 mut/Mb | TMB-Low: &lt;6 mut/Mb
        </p>
      </div>

      {/* PD-L1 */}
      <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-fg-default">PD-L1 表达</h3>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-fg-muted">TPS (肿瘤比例评分)</dt>
            <dd className="text-fg-default font-mono">{data.pdl1.tps}%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-fg-muted">CPS (联合阳性评分)</dt>
            <dd className="text-fg-default font-mono">{data.pdl1.cps}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
