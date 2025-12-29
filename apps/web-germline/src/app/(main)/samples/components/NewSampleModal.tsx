'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X } from 'lucide-react';
import type { Gender, SampleType } from '../types';

interface NewSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSampleFormData) => void;
}

export interface NewSampleFormData {
  name: string;
  gender: Gender;
  birthDate: string;
  sampleType: SampleType;
  pedigreeId: string;
  hospital: string;
  department: string;
  doctor: string;
  mainDiagnosis: string;
  symptoms: string;
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

export function NewSampleModal({ isOpen, onClose, onSubmit }: NewSampleModalProps) {
  const [formData, setFormData] = React.useState<NewSampleFormData>({
    name: '',
    gender: 'unknown',
    birthDate: '',
    sampleType: '全血',
    pedigreeId: '',
    hospital: '',
    department: '',
    doctor: '',
    mainDiagnosis: '',
    symptoms: '',
  });

  const handleChange = (field: keyof NewSampleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // 重置表单
    setFormData({
      name: '',
      gender: 'unknown',
      birthDate: '',
      sampleType: '全血',
      pedigreeId: '',
      hospital: '',
      department: '',
      doctor: '',
      mainDiagnosis: '',
      symptoms: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* 模态框 */}
      <div className="relative bg-canvas-default rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="text-lg font-medium text-fg-default">新建样本</h2>
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
                <label className="block text-xs text-fg-muted mb-1">姓名 *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="请输入姓名"
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
                <label className="block text-xs text-fg-muted mb-1">出生日期</label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
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
              <div>
                <label className="block text-xs text-fg-muted mb-1">家系编号</label>
                <Input
                  value={formData.pedigreeId}
                  onChange={(e) => handleChange('pedigreeId', e.target.value)}
                  placeholder="可选，留空则自动生成"
                />
              </div>
            </div>
          </div>

          {/* 送检信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">送检信息</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">送检医院</label>
                <Input
                  value={formData.hospital}
                  onChange={(e) => handleChange('hospital', e.target.value)}
                  placeholder="请输入医院名称"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">送检科室</label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  placeholder="请输入科室"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">送检医生</label>
                <Input
                  value={formData.doctor}
                  onChange={(e) => handleChange('doctor', e.target.value)}
                  placeholder="请输入医生姓名"
                />
              </div>
            </div>
          </div>

          {/* 临床信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">临床信息</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">主要诊断</label>
                <Input
                  value={formData.mainDiagnosis}
                  onChange={(e) => handleChange('mainDiagnosis', e.target.value)}
                  placeholder="请输入主要诊断"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">临床症状</label>
                <TextArea
                  value={formData.symptoms}
                  onChange={(e) => handleChange('symptoms', e.target.value)}
                  placeholder="请输入临床症状，多个症状用逗号分隔"
                  rows={3}
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
            创建样本
          </Button>
        </div>
      </div>
    </div>
  );
}
