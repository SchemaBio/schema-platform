'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { Button, Input, Select, FormItem, Checkbox } from '@schema/ui-kit';
import { Play, Info } from 'lucide-react';

// 生成 UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface SampleOption {
  id: string;
  name: string;
  patientName: string;
  hasData: boolean;
  previousTasks: number;
}

const mockSamples: SampleOption[] = [
  { id: 'S2024120001', name: 'S2024120001', patientName: '张**', hasData: true, previousTasks: 2 },
  { id: 'S2024120002', name: 'S2024120002', patientName: '李**', hasData: true, previousTasks: 1 },
  { id: 'S2024120003', name: 'S2024120003', patientName: '王**', hasData: true, previousTasks: 1 },
  { id: 'S2024120004', name: 'S2024120004', patientName: '赵**', hasData: true, previousTasks: 1 },
  { id: 'S2024120005', name: 'S2024120005', patientName: '陈**', hasData: true, previousTasks: 0 },
  { id: 'S2024120006', name: 'S2024120006', patientName: '周**', hasData: false, previousTasks: 0 },
];

const mockPipelines = [
  { value: 'wes-germline-v1', label: 'WES-Germline-v1 (全外显子遗传病)', version: 'v1.2.0' },
  { value: 'panel-cardio', label: 'Panel-Cardio (心血管疾病)', version: 'v2.0.1' },
  { value: 'panel-neuro', label: 'Panel-Neuro (神经系统疾病)', version: 'v1.0.0' },
];

export default function NewAnalysisPage() {
  const [taskId] = React.useState(() => generateUUID());
  const [selectedSample, setSelectedSample] = React.useState('');
  const [selectedPipeline, setSelectedPipeline] = React.useState('wes-germline-v1');
  const [taskName, setTaskName] = React.useState('');
  const [enableCNV, setEnableCNV] = React.useState(true);
  const [enableSV, setEnableSV] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const selectedSampleInfo = mockSamples.find((s) => s.id === selectedSample);

  // 自动生成任务名称
  React.useEffect(() => {
    if (selectedSample && selectedPipeline) {
      const pipeline = mockPipelines.find((p) => p.value === selectedPipeline);
      const pipelineName = pipeline?.label.split(' ')[0] || '';
      setTaskName(`${selectedSample} ${pipelineName}分析`);
    }
  }, [selectedSample, selectedPipeline]);

  const handleSubmit = async () => {
    if (!selectedSample || !selectedPipeline) {
      alert('请选择样本和分析流程');
      return;
    }
    if (!selectedSampleInfo?.hasData) {
      alert('所选样本暂无测序数据，无法创建分析任务');
      return;
    }

    setSubmitting(true);
    // 模拟提交
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    alert(`任务创建成功！\n任务ID: ${taskId}`);
  };

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">新建分析任务</h2>

      <div className="max-w-2xl space-y-6">
        {/* 任务ID显示 */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-fg-muted" />
            <span className="text-sm font-medium text-fg-default">任务ID</span>
          </div>
          <code className="text-sm font-mono text-fg-muted bg-canvas-inset px-2 py-1 rounded">
            {taskId}
          </code>
          <p className="text-xs text-fg-muted mt-2">
            每个分析任务都有唯一的 UUID，同一样本可以多次投递分析任务
          </p>
        </div>

        {/* 选择样本 */}
        <FormItem label="选择样本" required>
          <Select
            options={mockSamples.map((s) => ({
              value: s.id,
              label: `${s.id} - ${s.patientName}${!s.hasData ? ' (无数据)' : ''}`,
              disabled: !s.hasData,
            }))}
            value={selectedSample}
            onChange={(v) => setSelectedSample(v as string)}
            placeholder="请选择样本"
            searchable
          />
          {selectedSampleInfo && (
            <div className="mt-2 text-xs text-fg-muted">
              {selectedSampleInfo.hasData ? (
                selectedSampleInfo.previousTasks > 0 ? (
                  <span className="text-warning-fg">
                    该样本已有 {selectedSampleInfo.previousTasks} 个分析任务
                  </span>
                ) : (
                  <span className="text-success-fg">该样本首次分析</span>
                )
              ) : (
                <span className="text-danger-fg">该样本暂无测序数据</span>
              )}
            </div>
          )}
        </FormItem>

        {/* 选择流程 */}
        <FormItem label="分析流程" required>
          <Select
            options={mockPipelines.map((p) => ({
              value: p.value,
              label: `${p.label} (${p.version})`,
            }))}
            value={selectedPipeline}
            onChange={(v) => setSelectedPipeline(v as string)}
          />
        </FormItem>

        {/* 任务名称 */}
        <FormItem label="任务名称">
          <Input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="自动生成或手动输入"
          />
        </FormItem>

        {/* 高级选项 */}
        <div>
          <h3 className="text-sm font-medium text-fg-default mb-3">高级选项</h3>
          <div className="space-y-2">
            <Checkbox
              checked={enableCNV}
              onCheckedChange={(checked) => setEnableCNV(checked === true)}
              label="启用 CNV 检测"
            />
            <Checkbox
              checked={enableSV}
              onCheckedChange={(checked) => setEnableSV(checked === true)}
              label="启用 SV 检测"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="primary"
            leftIcon={<Play className="w-4 h-4" />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!selectedSample || !selectedSampleInfo?.hasData}
          >
            {submitting ? '提交中...' : '提交任务'}
          </Button>
        </div>
      </div>
    </PageContent>
  );
}
