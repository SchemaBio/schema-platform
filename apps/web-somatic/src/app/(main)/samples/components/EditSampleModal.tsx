'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X, Calendar } from 'lucide-react';
import type { Gender, SampleType, NucleicAcidType, Sample } from '../types';
import {
  SAMPLE_TYPE_OPTIONS,
  TUMOR_TYPE_OPTIONS,
  NUCLEIC_ACID_TYPE_OPTIONS,
} from '../types';

interface EditSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: EditSampleFormData) => void;
  sample: Sample | null;
}

export interface EditSampleFormData {
  // 内部编号
  internalId: string;
  // 批次
  batch: string;
  // 性别
  gender: Gender;
  // 年龄
  age: string;
  // 出生年月
  birthDate: string;
  // 样本类型
  sampleType: SampleType;
  // 核酸类型
  nucleicAcidType: NucleicAcidType;
  // 肿瘤类型
  tumorType: string;
  // 对照样本编号
  pairedSampleId: string;
  // 备注
  remark: string;
}

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

export function EditSampleModal({ isOpen, onClose, onSubmit, sample }: EditSampleModalProps) {
  const [formData, setFormData] = React.useState<EditSampleFormData>({
    internalId: '',
    batch: '',
    gender: 'unknown',
    age: '',
    birthDate: '',
    sampleType: 'FFPE',
    nucleicAcidType: 'DNA',
    tumorType: '',
    pairedSampleId: '',
    remark: '',
  });

  const dateInputRef = React.useRef<HTMLInputElement>(null);

  // 当sample变化时更新表单数据
  React.useEffect(() => {
    if (sample) {
      setFormData({
        internalId: sample.internalId,
        batch: sample.batch,
        gender: sample.gender,
        age: sample.age?.toString() || '',
        birthDate: sample.birthDate,
        sampleType: sample.sampleType,
        nucleicAcidType: sample.nucleicAcidType,
        tumorType: sample.tumorType,
        pairedSampleId: sample.pairedSampleId || '',
        remark: sample.remark,
      });
    }
  }, [sample]);

  const handleChange = (field: keyof EditSampleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">编辑样本</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 样本编号（只读） */}
          <div className="mb-4 p-3 bg-canvas-subtle rounded-lg">
            <span className="text-xs text-fg-muted">样本编号</span>
            <div className="font-mono text-sm text-fg-default mt-1">{sample.id}</div>
          </div>

          {/* 基本信息区域 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">基本信息</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">内部编号 *</label>
                <Input
                  value={formData.internalId}
                  onChange={(e) => handleChange('internalId', e.target.value)}
                  placeholder="如：XH-2024-001"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">批次 *</label>
                <Input
                  value={formData.batch}
                  onChange={(e) => handleChange('batch', e.target.value)}
                  placeholder="如：BATCH-2024-001"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">性别 *</label>
                <Select
                  value={formData.gender}
                  onChange={(value) => handleChange('gender', Array.isArray(value) ? value[0] : value)}
                  options={genderOptions}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">年龄</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="岁"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">出生年月</label>
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    placeholder="1966-05"
                  />
                  <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
                  >
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </button>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 样本信息区域 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">样本信息</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">样本类型 *</label>
                <Select
                  value={formData.sampleType}
                  onChange={(value) => handleChange('sampleType', Array.isArray(value) ? value[0] : value)}
                  options={SAMPLE_TYPE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">核酸类型 *</label>
                <Select
                  value={formData.nucleicAcidType}
                  onChange={(value) => handleChange('nucleicAcidType', Array.isArray(value) ? value[0] : value)}
                  options={NUCLEIC_ACID_TYPE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">肿瘤类型 *</label>
                <Select
                  value={formData.tumorType}
                  onChange={(value) => handleChange('tumorType', Array.isArray(value) ? value[0] : value)}
                  options={TUMOR_TYPE_OPTIONS}
                  placeholder="选择肿瘤类型"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">对照样本</label>
                <Input
                  value={formData.pairedSampleId}
                  onChange={(e) => handleChange('pairedSampleId', e.target.value)}
                  placeholder="输入对照样本UUID"
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* 备注区域 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">备注</h3>
            <TextArea
              value={formData.remark}
              onChange={(e) => handleChange('remark', e.target.value)}
              placeholder="请输入备注信息（可选）"
              rows={2}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={(e: React.MouseEvent) => handleSubmit(e)}>
            保存修改
          </Button>
        </div>
      </div>
    </div>
  );
}