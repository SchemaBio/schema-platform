'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X, Search } from 'lucide-react';
import type { Gender, SampleType, Sample } from '../types';

interface EditSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: EditSampleFormData) => void;
  sample: Sample | null;
}

export interface EditSampleFormData {
  internalId: string;
  gender: Gender;
  sampleType: SampleType;
  batch: string;
  clinicalDiagnosis: string;
  hpoTerms: { id: string; name: string }[];
  r1Path: string;
  r2Path: string;
  remark: string;
}

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

const sampleTypeOptions = [
  { value: '全血', label: '全血' },
  { value: '唾液', label: '唾液' },
  { value: 'DNA', label: 'DNA' },
  { value: '组织', label: '组织' },
  { value: '其他', label: '其他' },
];

// 常用HPO术语列表
const COMMON_HPO_TERMS = [
  { id: 'HP:0001250', name: '癫痫发作' },
  { id: 'HP:0001249', name: '智力障碍' },
  { id: 'HP:0001252', name: '肌张力减退' },
  { id: 'HP:0001263', name: '发育迟缓' },
  { id: 'HP:0000252', name: '小头畸形' },
  { id: 'HP:0001635', name: '充血性心力衰竭' },
  { id: 'HP:0001962', name: '心悸' },
  { id: 'HP:0002094', name: '呼吸困难' },
  { id: 'HP:0000365', name: '听力损失' },
  { id: 'HP:0000518', name: '白内障' },
];

export function EditSampleModal({ isOpen, onClose, onSubmit, sample }: EditSampleModalProps) {
  const [formData, setFormData] = React.useState<EditSampleFormData>({
    internalId: '',
    gender: 'unknown',
    sampleType: '全血',
    batch: '',
    clinicalDiagnosis: '',
    hpoTerms: [],
    r1Path: '',
    r2Path: '',
    remark: '',
  });

  const [hpoSearchQuery, setHpoSearchQuery] = React.useState('');
  const [showHpoDropdown, setShowHpoDropdown] = React.useState(false);

  // 当 sample 变化时更新表单数据
  React.useEffect(() => {
    if (sample) {
      setFormData({
        internalId: sample.internalId,
        gender: sample.gender,
        sampleType: sample.sampleType,
        batch: sample.batch,
        clinicalDiagnosis: sample.clinicalDiagnosis,
        hpoTerms: sample.hpoTerms || [],
        r1Path: sample.matchedPair?.r1Path || '',
        r2Path: sample.matchedPair?.r2Path || '',
        remark: sample.remark,
      });
    }
  }, [sample]);

  const filteredHpoTerms = React.useMemo(() => {
    if (!hpoSearchQuery) return COMMON_HPO_TERMS.slice(0, 5);
    const query = hpoSearchQuery.toLowerCase();
    return COMMON_HPO_TERMS.filter(
      t => t.id.toLowerCase().includes(query) || t.name.includes(query)
    );
  }, [hpoSearchQuery]);

  const handleChange = (field: keyof EditSampleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addHpoTerm = (term: { id: string; name: string }) => {
    if (!formData.hpoTerms.find(t => t.id === term.id)) {
      setFormData(prev => ({ ...prev, hpoTerms: [...prev.hpoTerms, term] }));
    }
    setHpoSearchQuery('');
    setShowHpoDropdown(false);
  };

  const removeHpoTerm = (termId: string) => {
    setFormData(prev => ({
      ...prev,
      hpoTerms: prev.hpoTerms.filter(t => t.id !== termId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sample) {
      onSubmit(sample.id, formData);
      onClose();
    }
  };

  if (!isOpen || !sample) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="text-lg font-medium text-fg-default">编辑样本</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 基本信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">基本信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">样本编号</label>
                <Input
                  value={sample.id}
                  disabled
                  className="bg-gray-50 text-fg-muted"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">内部编号 *</label>
                <Input
                  value={formData.internalId}
                  onChange={(e) => handleChange('internalId', e.target.value)}
                  placeholder="如：INT-001"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">批次</label>
                <Input
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="如：BATCH-2024-001"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">性别</label>
                <Select
                  value={formData.gender}
                  onChange={(value) => handleChange('gender', Array.isArray(value) ? value[0] : value)}
                  options={genderOptions}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">样本类型 *</label>
                <Select
                  value={formData.sampleType}
                  onChange={(value) => handleChange('sampleType', Array.isArray(value) ? value[0] : value)}
                  options={sampleTypeOptions}
                />
              </div>
            </div>
          </div>

          {/* 临床信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">临床信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">临床诊断</label>
                <TextArea
                  value={formData.clinicalDiagnosis}
                  onChange={(e) => handleChange('clinicalDiagnosis', e.target.value)}
                  placeholder="请输入临床诊断"
                  rows={2}
                />
              </div>
              {/* HPO术语 */}
              <div>
                <label className="block text-xs text-fg-muted mb-1">HPO表型术语</label>
                {formData.hpoTerms.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.hpoTerms.map((term) => (
                      <div
                        key={term.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200"
                      >
                        <span className="font-mono text-xs text-blue-500">{term.id}</span>
                        <span>{term.name}</span>
                        <button
                          type="button"
                          onClick={() => removeHpoTerm(term.id)}
                          className="ml-1 text-blue-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Input
                    placeholder="搜索HPO术语（如：HP:0001250 或 癫痫）"
                    value={hpoSearchQuery}
                    onChange={(e) => {
                      setHpoSearchQuery(e.target.value);
                      setShowHpoDropdown(true);
                    }}
                    onFocus={() => setShowHpoDropdown(true)}
                    leftElement={<Search className="w-4 h-4" />}
                  />
                  {showHpoDropdown && filteredHpoTerms.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-auto">
                      {filteredHpoTerms.map((term) => (
                        <button
                          key={term.id}
                          type="button"
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          onClick={() => addHpoTerm(term)}
                        >
                          <span className="font-mono text-xs text-blue-500">{term.id}</span>
                          <span className="text-sm">{term.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* 匹配数据 */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs text-fg-muted mb-2">匹配数据（双端测序文件路径）</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">R1 路径</label>
                    <Input
                      value={formData.r1Path}
                      onChange={(e) => handleChange('r1Path', e.target.value)}
                      placeholder="如：/data/seq/xxx_R1.fastq.gz"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-fg-muted mb-1">R2 路径</label>
                    <Input
                      value={formData.r2Path}
                      onChange={(e) => handleChange('r2Path', e.target.value)}
                      placeholder="如：/data/seq/xxx_R2.fastq.gz"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">备注</label>
                <TextArea
                  value={formData.remark}
                  onChange={(e) => handleChange('remark', e.target.value)}
                  placeholder="请输入备注信息"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-default bg-canvas-subtle">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={(e: React.MouseEvent) => handleSubmit(e)}>
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}