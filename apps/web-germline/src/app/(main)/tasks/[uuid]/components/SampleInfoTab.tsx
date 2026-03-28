'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import type { SampleInfo } from '../types';
import { getSampleInfo } from '../mock-data';

interface SampleInfoTabProps {
  taskId: string;
}

export function SampleInfoTab({ taskId }: SampleInfoTabProps) {
  const [sampleInfo, setSampleInfo] = React.useState<SampleInfo | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await getSampleInfo(taskId);
      setSampleInfo(data);
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

  if (!sampleInfo) {
    return (
      <div className="text-center py-12 text-fg-muted">
        暂无样本信息
      </div>
    );
  }

  const genderLabel = {
    Male: '男',
    Female: '女',
    Unknown: '未知',
  };

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex py-2 border-b border-border-default last:border-b-0">
      <div className="w-32 text-fg-muted text-sm flex-shrink-0">{label}</div>
      <div className="text-fg-default text-sm flex-1">{value || '-'}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h4 className="text-sm font-medium text-fg-default mb-3">基本信息</h4>
        <div className="grid grid-cols-2 gap-x-8">
          <InfoRow label="样本编号" value={sampleInfo.sampleId} />
          <InfoRow label="样本名称" value={sampleInfo.sampleName} />
          <InfoRow label="性别" value={genderLabel[sampleInfo.gender]} />
          <InfoRow label="年龄" value={sampleInfo.age ? `${sampleInfo.age}岁` : undefined} />
          <InfoRow label="样本类型" value={sampleInfo.sampleType} />
          <InfoRow label="采集日期" value={sampleInfo.collectionDate} />
          <InfoRow label="接收日期" value={sampleInfo.receivedDate} />
          <InfoRow label="报告日期" value={sampleInfo.reportDate} />
        </div>
      </div>

      {/* 临床信息 */}
      <div className="bg-canvas-subtle rounded-lg p-4">
        <h4 className="text-sm font-medium text-fg-default mb-3">临床信息</h4>
        <div className="space-y-0">
          <InfoRow label="临床诊断" value={sampleInfo.clinicalDiagnosis} />
          <InfoRow 
            label="表型" 
            value={
              sampleInfo.phenotypes && sampleInfo.phenotypes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {sampleInfo.phenotypes.map((p, i) => (
                    <Tag key={i} variant="info" className="text-xs">{p}</Tag>
                  ))}
                </div>
              ) : undefined
            } 
          />
          <InfoRow label="家族史" value={sampleInfo.familyHistory} />
        </div>
      </div>
    </div>
  );
}
