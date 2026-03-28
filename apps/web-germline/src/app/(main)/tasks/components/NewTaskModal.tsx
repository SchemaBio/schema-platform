'use client';

import * as React from 'react';
import { Button, Input, Select } from '@schema/ui-kit';
import { X, Search } from 'lucide-react';

interface Sample {
  id: string;
  name: string;
  patientName: string;
}

interface Pipeline {
  id: string;
  name: string;
  version: string;
}

// Mock 样本数据
const mockSamples: Sample[] = [
  { id: 'S2024120001', name: 'S2024120001', patientName: '张**' },
  { id: 'S2024120002', name: 'S2024120002', patientName: '李**' },
  { id: 'S2024120003', name: 'S2024120003', patientName: '王**' },
  { id: 'S2024120004', name: 'S2024120004', patientName: '赵**' },
  { id: 'S2024120005', name: 'S2024120005', patientName: '孙**' },
];

// Mock 流程数据
const mockPipelines: Pipeline[] = [
  { id: 'wes-germline-v1', name: 'WES-Germline-v1', version: 'v1.2.0' },
  { id: 'wes-family-v1', name: 'WES-Family-v1', version: 'v1.1.0' },
  { id: 'panel-cardio', name: 'Panel-Cardio', version: 'v2.0.1' },
  { id: 'panel-neuro', name: 'Panel-Neuro', version: 'v1.0.0' },
];

export interface NewTaskFormData {
  sampleId: string;
  sampleName: string;
  patientName: string;
  pipelineId: string;
  pipelineName: string;
  pipelineVersion: string;
  taskName: string;
}

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTaskFormData) => void;
}

export function NewTaskModal({ isOpen, onClose, onSubmit }: NewTaskModalProps) {
  const [sampleSearch, setSampleSearch] = React.useState('');
  const [selectedSample, setSelectedSample] = React.useState<Sample | null>(null);
  const [selectedPipeline, setSelectedPipeline] = React.useState<string>('');
  const [taskName, setTaskName] = React.useState('');

  // 筛选样本
  const filteredSamples = React.useMemo(() => {
    if (!sampleSearch) return mockSamples;
    const query = sampleSearch.toLowerCase();
    return mockSamples.filter(
      s => s.id.toLowerCase().includes(query) || s.patientName.includes(query)
    );
  }, [sampleSearch]);

  // 自动生成任务名称
  React.useEffect(() => {
    if (selectedSample && selectedPipeline) {
      const pipeline = mockPipelines.find(p => p.id === selectedPipeline);
      if (pipeline) {
        setTaskName(`${selectedSample.id} ${pipeline.name}分析`);
      }
    }
  }, [selectedSample, selectedPipeline]);

  const handleSubmit = () => {
    if (!selectedSample || !selectedPipeline || !taskName) return;

    const pipeline = mockPipelines.find(p => p.id === selectedPipeline);
    if (!pipeline) return;

    onSubmit({
      sampleId: selectedSample.id,
      sampleName: selectedSample.name,
      patientName: selectedSample.patientName,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      pipelineVersion: pipeline.version,
      taskName,
    });
    handleClose();
  };

  const handleClose = () => {
    setSampleSearch('');
    setSelectedSample(null);
    setSelectedPipeline('');
    setTaskName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">新建分析任务</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 选择样本 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择样本 *</label>
            <div className="relative mb-2">
              <Input
                placeholder="搜索样本编号或患者..."
                value={sampleSearch}
                onChange={(e) => setSampleSearch(e.target.value)}
                leftElement={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
              {filteredSamples.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => setSelectedSample(sample)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    selectedSample?.id === sample.id
                      ? 'bg-accent-subtle text-accent-fg'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="text-sm font-medium">{sample.id}</div>
                  <div className="text-xs text-gray-500">{sample.patientName}</div>
                </div>
              ))}
              {filteredSamples.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  未找到匹配的样本
                </div>
              )}
            </div>
            {selectedSample && (
              <div className="mt-2 text-sm text-accent-fg">
                已选择: {selectedSample.id} ({selectedSample.patientName})
              </div>
            )}
          </div>

          {/* 选择流程 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分析流程 *</label>
            <Select
              value={selectedPipeline}
              onChange={(v) => setSelectedPipeline(Array.isArray(v) ? v[0] : v)}
              options={mockPipelines.map(p => ({
                value: p.id,
                label: `${p.name} (${p.version})`,
              }))}
              placeholder="请选择分析流程"
            />
          </div>

          {/* 任务名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">任务名称 *</label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="请输入任务名称"
            />
            <p className="text-xs text-gray-500 mt-1">任务名称会根据样本和流程自动生成，也可手动修改</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={handleClose}>取消</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedSample || !selectedPipeline || !taskName}
          >
            创建任务
          </Button>
        </div>
      </div>
    </div>
  );
}
