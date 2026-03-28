'use client';

import * as React from 'react';
import { Button, Input, TextArea, Tag } from '@schema/ui-kit';
import { X, Search, Check, Plus, Trash2 } from 'lucide-react';
import { getAvailableSamples } from '../mock-data';
import type { PedigreeListItem } from '../types';

interface Sample {
  id: string;
  internalId: string;
  gender: 'male' | 'female' | 'unknown';
}

interface EditPedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: EditPedigreeFormData) => void;
  pedigree: PedigreeListItem | null;
}

export interface EditPedigreeFormData {
  internalId: string;
  clinicalDiagnosis: string;
  batch: string;
  sampleIds: string[];
  probandSampleId: string;
  remark: string;
}

export function EditPedigreeModal({ isOpen, onClose, onSubmit, pedigree }: EditPedigreeModalProps) {
  const [formData, setFormData] = React.useState<EditPedigreeFormData>({
    internalId: '',
    clinicalDiagnosis: '',
    batch: '',
    sampleIds: [],
    probandSampleId: '',
    remark: '',
  });

  const [samples, setSamples] = React.useState<Sample[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // 当 pedigree 变化时更新表单数据
  React.useEffect(() => {
    if (pedigree) {
      setFormData({
        internalId: pedigree.internalId,
        clinicalDiagnosis: pedigree.clinicalDiagnosis || '',
        batch: pedigree.batch || '',
        sampleIds: [...pedigree.sampleIds],
        probandSampleId: pedigree.probandSampleId || '',
        remark: pedigree.remark || '',
      });
    }
  }, [pedigree]);

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

  const handleChange = (field: keyof EditPedigreeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleSample = (sampleId: string) => {
    setFormData(prev => {
      const isSelected = prev.sampleIds.includes(sampleId);
      let newSampleIds: string[];
      let newProbandSampleId = prev.probandSampleId;

      if (isSelected) {
        // 移除样本
        newSampleIds = prev.sampleIds.filter(id => id !== sampleId);
        // 如果移除的是先证者，清空先证者
        if (prev.probandSampleId === sampleId) {
          newProbandSampleId = newSampleIds.length > 0 ? newSampleIds[0] : '';
        }
      } else {
        // 添加样本
        newSampleIds = [...prev.sampleIds, sampleId];
        // 如果是第一个样本，自动设为先证者
        if (prev.sampleIds.length === 0) {
          newProbandSampleId = sampleId;
        }
      }

      return {
        ...prev,
        sampleIds: newSampleIds,
        probandSampleId: newProbandSampleId,
      };
    });
  };

  const handleSetProband = (sampleId: string) => {
    setFormData(prev => ({ ...prev, probandSampleId: sampleId }));
  };

  const handleRemoveSample = (sampleId: string) => {
    setFormData(prev => {
      const newSampleIds = prev.sampleIds.filter(id => id !== sampleId);
      let newProbandSampleId = prev.probandSampleId;
      if (prev.probandSampleId === sampleId) {
        newProbandSampleId = newSampleIds.length > 0 ? newSampleIds[0] : '';
      }
      return {
        ...prev,
        sampleIds: newSampleIds,
        probandSampleId: newProbandSampleId,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedigree || formData.sampleIds.length === 0 || !formData.probandSampleId) return;
    onSubmit(pedigree.id, formData);
    onClose();
    setSearchQuery('');
  };

  const getSampleInfo = (sampleId: string) => {
    return samples.find(s => s.id === sampleId);
  };

  const genderLabels = {
    male: '男',
    female: '女',
    unknown: '未知',
  };

  if (!isOpen || !pedigree) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-medium text-gray-900">编辑家系</h2>
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

          {/* 已选样本列表 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              家系样本 ({formData.sampleIds.length} 个)
            </h3>
            {formData.sampleIds.length > 0 ? (
              <div className="space-y-2 mb-3">
                {formData.sampleIds.map((sampleId) => {
                  const sample = getSampleInfo(sampleId);
                  const isProband = formData.probandSampleId === sampleId;
                  return (
                    <div
                      key={sampleId}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                        isProband ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isProband ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                        }`} />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-900">
                            {sampleId.substring(0, 8)}
                          </span>
                          {sample && (
                            <span className="text-gray-500 text-sm">({sample.internalId})</span>
                          )}
                          {isProband && (
                            <Tag variant="info">先证者</Tag>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isProband && (
                          <button
                            type="button"
                            onClick={() => handleSetProband(sampleId)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            设为先证者
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveSample(sampleId)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-3 p-4 bg-gray-50 rounded-lg text-center">
                暂无样本，请从下方添加
              </div>
            )}

            {/* 添加样本 */}
            <div className="mb-3">
              <Input
                placeholder="搜索样本编号、内部编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  加载样本列表...
                </div>
              ) : filteredSamples.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredSamples.map((sample) => {
                    const isSelected = formData.sampleIds.includes(sample.id);
                    return (
                      <div
                        key={sample.id}
                        onClick={() => handleToggleSample(sample.id)}
                        className={`px-4 py-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm text-gray-900">
                                {sample.id.substring(0, 8)}
                              </span>
                              <span className="text-gray-500 text-sm">({sample.internalId})</span>
                              <Tag variant={sample.gender === 'male' ? 'info' : sample.gender === 'female' ? 'warning' : 'neutral'}>
                                {genderLabels[sample.gender]}
                              </Tag>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  未找到匹配的样本
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              点击样本可添加/移除，第一个添加的样本自动设为先证者
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
            disabled={formData.sampleIds.length === 0 || !formData.probandSampleId}
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}