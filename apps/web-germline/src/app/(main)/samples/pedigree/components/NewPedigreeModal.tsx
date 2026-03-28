'use client';

import * as React from 'react';
import { Button, Input, TextArea, Tag } from '@schema/ui-kit';
import { X, Search, Check } from 'lucide-react';
import { getAvailableSamples } from '../mock-data';

interface Sample {
  id: string;
  internalId: string;
  gender: 'male' | 'female' | 'unknown';
}

interface NewPedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPedigreeFormData) => void;
}

export interface NewPedigreeFormData {
  internalId: string;          // 家系内部编号
  clinicalDiagnosis: string;   // 临床诊断
  batch: string;
  probandSampleId: string;     // 先证者样本UUID
  remark: string;
}

export function NewPedigreeModal({ isOpen, onClose, onSubmit }: NewPedigreeModalProps) {
  const [formData, setFormData] = React.useState<NewPedigreeFormData>({
    internalId: '',
    clinicalDiagnosis: '',
    batch: '',
    probandSampleId: '',
    remark: '',
  });

  const [samples, setSamples] = React.useState<Sample[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 加载可用样本
  React.useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAvailableSamples().then(data => {
        setSamples(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const filteredSamples = React.useMemo(() => {
    if (!searchQuery) return samples;
    const query = searchQuery.toLowerCase();
    return samples.filter(
      s => s.id.toLowerCase().includes(query) || s.internalId.toLowerCase().includes(query)
    );
  }, [samples, searchQuery]);

  const handleChange = (field: keyof NewPedigreeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectSample = (sampleId: string) => {
    setFormData(prev => ({
      ...prev,
      probandSampleId: prev.probandSampleId === sampleId ? '' : sampleId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.probandSampleId) return;
    onSubmit(formData);
    onClose();
    // 重置表单
    setFormData({
      internalId: '',
      clinicalDiagnosis: '',
      batch: '',
      probandSampleId: '',
      remark: '',
    });
    setSearchQuery('');
  };

  const selectedSample = samples.find(s => s.id === formData.probandSampleId);

  const genderLabels = {
    male: '男',
    female: '女',
    unknown: '未知',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-medium text-gray-900">新建家系</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 家系信息 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">家系信息</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">内部编号 *</label>
                <Input
                  value={formData.internalId}
                  onChange={(e) => handleChange('internalId', e.target.value)}
                  placeholder="如：FAM-001"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">批次</label>
                <Input
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="如：BATCH-2024-001"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">临床诊断</label>
                <Input
                  value={formData.clinicalDiagnosis}
                  onChange={(e) => handleChange('clinicalDiagnosis', e.target.value)}
                  placeholder="如：遗传性心肌病待查"
                />
              </div>
            </div>
          </div>

          {/* 先证者选择 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              先证者样本 *
              {selectedSample && (
                <span className="ml-2 text-xs text-green-600 font-normal">
                  已选择: {selectedSample.internalId}
                </span>
              )}
            </h3>
            <div className="mb-3">
              <Input
                placeholder="搜索样本编号、内部编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  加载样本列表...
                </div>
              ) : filteredSamples.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredSamples.map((sample) => {
                    const isSelected = formData.probandSampleId === sample.id;
                    return (
                      <div
                        key={sample.id}
                        onClick={() => handleSelectSample(sample.id)}
                        className={`px-4 py-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-2 border-l-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-gray-900">
                                  {sample.id.substring(0, 8)}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  ({sample.internalId})
                                </span>
                                <Tag variant={sample.gender === 'male' ? 'info' : sample.gender === 'female' ? 'warning' : 'neutral'}>
                                  {genderLabels[sample.gender]}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  未找到匹配的样本
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              提示：先证者样本必须已存在于样本管理中
            </p>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">备注</label>
            <TextArea
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="请输入家系相关备注信息"
              rows={3}
            />
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button
            variant="primary"
            onClick={(e: React.MouseEvent) => handleSubmit(e)}
            disabled={!formData.probandSampleId}
          >
            创建家系
          </Button>
        </div>
      </div>
    </div>
  );
}