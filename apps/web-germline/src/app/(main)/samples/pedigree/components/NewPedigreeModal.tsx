'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X } from 'lucide-react';
import type { Gender } from '../../types';

interface NewPedigreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewPedigreeFormData) => void;
}

export interface NewPedigreeFormData {
  name: string;
  disease: string;
  probandName: string;
  probandGender: Gender;
  probandBirthYear: string;
  note: string;
}

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

export function NewPedigreeModal({ isOpen, onClose, onSubmit }: NewPedigreeModalProps) {
  const [formData, setFormData] = React.useState<NewPedigreeFormData>({
    name: '',
    disease: '',
    probandName: '',
    probandGender: 'unknown',
    probandBirthYear: '',
    note: '',
  });

  const handleChange = (field: keyof NewPedigreeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // 重置表单
    setFormData({
      name: '',
      disease: '',
      probandName: '',
      probandGender: 'unknown',
      probandBirthYear: '',
      note: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">新建家系</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 家系信息 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">家系信息</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">家系名称 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="如：张氏家系"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">主要疾病</label>
                <Input
                  value={formData.disease}
                  onChange={(e) => handleChange('disease', e.target.value)}
                  placeholder="如：遗传性心肌病"
                />
              </div>
            </div>
          </div>

          {/* 先证者信息 */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">先证者信息</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">姓名 *</label>
                <Input
                  value={formData.probandName}
                  onChange={(e) => handleChange('probandName', e.target.value)}
                  placeholder="请输入姓名"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">性别 *</label>
                <Select
                  value={formData.probandGender}
                  onChange={(value) => handleChange('probandGender', Array.isArray(value) ? value[0] : value)}
                  options={genderOptions}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">出生年份</label>
                <Input
                  value={formData.probandBirthYear}
                  onChange={(e) => handleChange('probandBirthYear', e.target.value)}
                  placeholder="如：1990"
                />
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">备注</label>
            <TextArea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="请输入家系相关备注信息"
              rows={3}
            />
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={(e: React.MouseEvent) => handleSubmit(e)}>
            创建家系
          </Button>
        </div>
      </div>
    </div>
  );
}
