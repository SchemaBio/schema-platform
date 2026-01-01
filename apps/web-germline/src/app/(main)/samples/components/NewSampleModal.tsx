'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea, Tag } from '@schema/ui-kit';
import { X, Search } from 'lucide-react';
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
  ethnicity: string;
  idCard: string;
  phone: string;
  sampleType: SampleType;
  pedigreeId: string;
  hospital: string;
  department: string;
  doctor: string;
  mainDiagnosis: string;
  symptoms: string;
  onsetAge: string;
  diseaseHistory: string;
  hpoTerms: { id: string; name: string }[];
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

export function NewSampleModal({ isOpen, onClose, onSubmit }: NewSampleModalProps) {
  const [formData, setFormData] = React.useState<NewSampleFormData>({
    name: '',
    gender: 'unknown',
    birthDate: '',
    ethnicity: '',
    idCard: '',
    phone: '',
    sampleType: '全血',
    pedigreeId: '',
    hospital: '',
    department: '',
    doctor: '',
    mainDiagnosis: '',
    symptoms: '',
    onsetAge: '',
    diseaseHistory: '',
    hpoTerms: [],
  });

  const [hpoSearchQuery, setHpoSearchQuery] = React.useState('');
  const [showHpoDropdown, setShowHpoDropdown] = React.useState(false);

  const filteredHpoTerms = React.useMemo(() => {
    if (!hpoSearchQuery) return COMMON_HPO_TERMS.slice(0, 5);
    const query = hpoSearchQuery.toLowerCase();
    return COMMON_HPO_TERMS.filter(
      t => t.id.toLowerCase().includes(query) || t.name.includes(query)
    );
  }, [hpoSearchQuery]);

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
      ethnicity: '',
      idCard: '',
      phone: '',
      sampleType: '全血',
      pedigreeId: '',
      hospital: '',
      department: '',
      doctor: '',
      mainDiagnosis: '',
      symptoms: '',
      onsetAge: '',
      diseaseHistory: '',
      hpoTerms: [],
    });
    setHpoSearchQuery('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* 模态框 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
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
            <div className="grid grid-cols-3 gap-4">
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
                <label className="block text-xs text-fg-muted mb-1">民族</label>
                <Input
                  value={formData.ethnicity}
                  onChange={(e) => handleChange('ethnicity', e.target.value)}
                  placeholder="如：汉族"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">身份证号</label>
                <Input
                  value={formData.idCard}
                  onChange={(e) => handleChange('idCard', e.target.value)}
                  placeholder="请输入身份证号"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">联系电话</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="请输入联系电话"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-fg-muted mb-1">主要诊断</label>
                  <Input
                    value={formData.mainDiagnosis}
                    onChange={(e) => handleChange('mainDiagnosis', e.target.value)}
                    placeholder="请输入主要诊断"
                  />
                </div>
                <div>
                  <label className="block text-xs text-fg-muted mb-1">发病年龄</label>
                  <Input
                    value={formData.onsetAge}
                    onChange={(e) => handleChange('onsetAge', e.target.value)}
                    placeholder="如：25岁"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">临床症状</label>
                <TextArea
                  value={formData.symptoms}
                  onChange={(e) => handleChange('symptoms', e.target.value)}
                  placeholder="请输入临床症状，多个症状用逗号分隔"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">病史描述</label>
                <TextArea
                  value={formData.diseaseHistory}
                  onChange={(e) => handleChange('diseaseHistory', e.target.value)}
                  placeholder="请输入病史描述"
                  rows={3}
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
