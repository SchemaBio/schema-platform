'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X, Upload, Image as ImageIcon, Trash2, Calendar, User, RefreshCw, Link2 } from 'lucide-react';
import type { Gender, SampleType, SampleSource, SamplingMethod, TestPurpose, ClinicalStage, NucleicAcidType, RelatedSample } from '../types';
import {
  SAMPLE_TYPE_OPTIONS,
  SAMPLE_SOURCE_OPTIONS,
  SAMPLING_METHOD_OPTIONS,
  TEST_PURPOSE_OPTIONS,
  CLINICAL_STAGE_OPTIONS,
  TUMOR_TYPE_OPTIONS,
  NUCLEIC_ACID_TYPE_OPTIONS,
} from '../types';

// 患者信息类型
interface PatientInfo {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string;
  phone?: string;
  samples?: RelatedSample[];
}

interface NewSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewSampleFormData) => void;
}

interface HEImage {
  id: string;
  file: File;
  preview: string;
  description: string;
}

/**
 * 生成随机患者编号
 * 格式：PT-YYYYMMDD-XXXXXX（6位随机字符）
 */
function generatePatientCode(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PT-${dateStr}-${random}`;
}

/**
 * 验证身份证号格式（中国）
 */
function validateIdCard(idCard: string): boolean {
  if (!idCard || idCard.length !== 18) return false;
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}(\d|X|x)$/;
  return regex.test(idCard);
}

export interface NewSampleFormData {
  // 内部编号
  internalId: string;

  // 患者信息
  name: string;
  gender: Gender;
  age: string;
  birthDate: string;
  idCard: string;          // 身份证号
  patientCode: string;     // 患者编号（身份证或自定义编号）
  phone: string;

  // 样本信息
  sampleType: SampleType;
  nucleicAcidType: NucleicAcidType;
  isPaired: boolean;
  pairedSampleId: string;

  // 肿瘤信息
  tumorType: string;
  pathologyType: string;
  clinicalStage: ClinicalStage;
  tumorPurity: string;

  // 样本来源
  sampleSource: SampleSource;
  samplingMethod: SamplingMethod;
  samplingLocation: string;

  // 治疗信息
  hasPriorTreatment: boolean;
  priorTreatmentDetail: string;
  isResistant: boolean;

  // 检测需求
  testPurpose: TestPurpose;
  focusGenes: string;
  clinicalQuestion: string;

  // 送检信息
  hospital: string;
  department: string;
  doctor: string;

  // HE 图片
  heImages: HEImage[];
}

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

export function NewSampleModal({ isOpen, onClose, onSubmit }: NewSampleModalProps) {
  // 已匹配的患者信息
  const [matchedPatient, setMatchedPatient] = React.useState<PatientInfo | null>(null);
  const [isSearchingPatient, setIsSearchingPatient] = React.useState(false);
  const [idCardError, setIdCardError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<NewSampleFormData>({
    internalId: '',
    name: '',
    gender: 'unknown',
    age: '',
    birthDate: '',
    idCard: '',
    patientCode: generatePatientCode(),  // 默认生成一个新编号
    phone: '',
    sampleType: 'FFPE',
    nucleicAcidType: 'DNA',
    isPaired: false,
    pairedSampleId: '',
    tumorType: '',
    pathologyType: '',
    clinicalStage: 'unknown',
    tumorPurity: '',
    sampleSource: 'primary',
    samplingMethod: 'biopsy',
    samplingLocation: '',
    hasPriorTreatment: false,
    priorTreatmentDetail: '',
    isResistant: false,
    testPurpose: 'initial',
    focusGenes: '',
    clinicalQuestion: '',
    hospital: '',
    department: '',
    doctor: '',
    heImages: [],
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof NewSampleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 根据身份证号查找已有患者
  const handleIdCardBlur = async () => {
    const idCard = formData.idCard.trim();
    if (!idCard) {
      setMatchedPatient(null);
      setIdCardError(null);
      return;
    }

    if (!validateIdCard(idCard)) {
      setIdCardError('身份证号格式不正确');
      setMatchedPatient(null);
      return;
    }

    setIdCardError(null);
    setIsSearchingPatient(true);

    try {
      // TODO: 调用实际的 API，这里先用 mock 数据演示
      // const patient = await patientService.getPatientByIdCard(idCard);

      // Mock: 模拟查找结果
      await new Promise(resolve => setTimeout(resolve, 500));

      // 模拟找到已有患者的情况（使用特定身份证号前缀触发）
      if (idCard.startsWith('110101')) {
        setMatchedPatient({
          id: 'mock-patient-1',
          name: '张三',
          gender: 'male',
          birthDate: '1980-05-15',
          phone: '13800138000',
          samples: [
            { id: 'sample-1', internalId: 'XH-2024-001', sampleType: 'FFPE', tumorType: '肺癌', createdAt: '2024-01-15', status: 'completed' },
            { id: 'sample-2', internalId: 'XH-2024-002', sampleType: '全血', tumorType: '肺癌', createdAt: '2024-02-20', status: 'pending' },
          ],
        });
        // 自动填充患者基本信息（不修改患者编号）
        setFormData(prev => ({
          ...prev,
          idCard,
          name: '张三',
          gender: 'male',
          birthDate: '1980-05-15',
          phone: '13800138000',
        }));
      } else {
        setMatchedPatient(null);
      }
    } catch (error) {
      console.error('查找患者失败:', error);
      setMatchedPatient(null);
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // 生成新的随机患者编号
  const handleGeneratePatientCode = () => {
    const newCode = generatePatientCode();
    setFormData(prev => ({ ...prev, patientCode: newCode }));
    setMatchedPatient(null);
  };

  // 当没有填写身份证时，手动输入患者编号后查找
  const handlePatientCodeBlur = async () => {
    const code = formData.patientCode.trim();
    if (!code || formData.idCard) return;  // 有身份证号时不查找

    setIsSearchingPatient(true);
    try {
      // TODO: 调用实际的 API
      // const patient = await patientService.getPatientByCode(code);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock: 如果输入 PT-20240101-ABC123，模拟找到患者
      if (code.startsWith('PT-')) {
        setMatchedPatient({
          id: 'mock-patient-2',
          name: '李四',
          gender: 'female',
          birthDate: '1975-10-20',
          phone: '13900139000',
          samples: [
            { id: 'sample-3', internalId: 'XH-2023-088', sampleType: 'cfDNA', tumorType: '乳腺癌', createdAt: '2023-12-01', status: 'completed' },
          ],
        });
        setFormData(prev => ({
          ...prev,
          name: '李四',
          gender: 'female',
          birthDate: '1975-10-20',
          phone: '13900139000',
        }));
      }
    } catch (error) {
      console.error('查找患者失败:', error);
    } finally {
      setIsSearchingPatient(false);
    }
  };

  // 清除患者匹配，重新创建新患者
  const handleClearPatientMatch = () => {
    setMatchedPatient(null);
    setIdCardError(null);
    handleGeneratePatientCode();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: HEImage[] = Array.from(files).map(file => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      description: '',
    }));

    setFormData(prev => ({
      ...prev,
      heImages: [...prev.heImages, ...newImages],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setFormData(prev => {
      const imageToRemove = prev.heImages.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return {
        ...prev,
        heImages: prev.heImages.filter(img => img.id !== imageId),
      };
    });
  };

  const handleImageDescriptionChange = (imageId: string, description: string) => {
    setFormData(prev => ({
      ...prev,
      heImages: prev.heImages.map(img =>
        img.id === imageId ? { ...img, description } : img
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    formData.heImages.forEach(img => URL.revokeObjectURL(img.preview));
    setMatchedPatient(null);
    setIdCardError(null);
    setFormData({
      internalId: '',
      name: '',
      gender: 'unknown',
      age: '',
      birthDate: '',
      idCard: '',
      patientCode: generatePatientCode(),
      phone: '',
      sampleType: 'FFPE',
      nucleicAcidType: 'DNA',
      isPaired: false,
      pairedSampleId: '',
      tumorType: '',
      pathologyType: '',
      clinicalStage: 'unknown',
      tumorPurity: '',
      sampleSource: 'primary',
      samplingMethod: 'biopsy',
      samplingLocation: '',
      hasPriorTreatment: false,
      priorTreatmentDetail: '',
      isResistant: false,
      testPurpose: 'initial',
      focusGenes: '',
      clinicalQuestion: '',
      hospital: '',
      department: '',
      doctor: '',
      heImages: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">新建肿瘤样本</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 内部编号 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">样本编号</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-fg-muted mb-1">内部编号 *</label>
                <Input
                  value={formData.internalId}
                  onChange={(e) => handleChange('internalId', e.target.value)}
                  placeholder="请输入内部编号，如：XH-2024-001"
                  required
                />
              </div>
            </div>
          </div>

          {/* 患者信息 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-fg-default">患者信息</h3>
              {matchedPatient && (
                <div className="flex items-center gap-2 text-xs text-success-fg bg-success-subtle px-2 py-1 rounded">
                  <User className="w-3 h-3" />
                  已匹配到该患者的历史样本
                </div>
              )}
            </div>

            {/* 患者唯一标识 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">患者编号 *</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.patientCode}
                    onChange={(e) => handleChange('patientCode', e.target.value)}
                    onBlur={handlePatientCodeBlur}
                    placeholder="输入编号或点击右侧生成"
                    required
                    className="flex-1 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePatientCode}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="随机生成编号"
                  >
                    <RefreshCw className="w-4 h-4 text-fg-muted" />
                  </button>
                </div>
                <p className="text-xs text-fg-muted mt-1">用于关联同一患者的历史送检样本</p>
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">身份证号（可选）</label>
                <div className="flex gap-2">
                  <Input
                    value={formData.idCard}
                    onChange={(e) => handleChange('idCard', e.target.value)}
                    onBlur={handleIdCardBlur}
                    placeholder="18位身份证号"
                    error={idCardError || undefined}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.idCard) {
                        handleChange('patientCode', formData.idCard);
                      }
                    }}
                    disabled={!formData.idCard}
                    className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs whitespace-nowrap"
                    title="将身份证号复制到患者编号"
                  >
                    复用身份证
                  </button>
                </div>
                {isSearchingPatient && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <p className="text-xs text-fg-muted mt-1">填写后可点击「复用身份证」复制到患者编号</p>
              </div>
            </div>

            {/* 已匹配患者的历史样本展示 */}
            {matchedPatient && matchedPatient.samples && matchedPatient.samples.length > 0 && (
              <div className="mb-4 p-3 bg-accent-subtle rounded-lg border border-accent-default">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 className="w-4 h-4 text-accent-fg" />
                  <span className="text-sm font-medium text-accent-fg">该患者的历史样本</span>
                </div>
                <div className="space-y-2">
                  {matchedPatient.samples.map(sample => (
                    <div key={sample.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-fg-default">{sample.internalId}</span>
                        <span className="text-xs text-fg-muted">{sample.tumorType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          sample.status === 'completed' ? 'bg-success-subtle text-success-fg' :
                          sample.status === 'pending' ? 'bg-warning-subtle text-warning-fg' :
                          'bg-info-subtle text-info-fg'
                        }`}>
                          {sample.status === 'completed' ? '已完成' :
                           sample.status === 'pending' ? '待处理' : '分析中'}
                        </span>
                        <span className="text-xs text-fg-muted">{sample.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleClearPatientMatch}
                  className="mt-2 text-xs text-fg-muted hover:text-fg-default underline"
                >
                  解除关联，创建新患者
                </button>
              </div>
            )}

            {/* 基本信息 */}
            <div className="grid grid-cols-4 gap-4">
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
                <label className="block text-xs text-fg-muted mb-1">年龄</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="岁"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">联系电话</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="手机号"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">出生日期</label>
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    placeholder="1990-01-15"
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

          {/* 肿瘤信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">肿瘤信息</h3>
            <div className="grid grid-cols-4 gap-4">
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
                <label className="block text-xs text-fg-muted mb-1">病理分型</label>
                <Input
                  value={formData.pathologyType}
                  onChange={(e) => handleChange('pathologyType', e.target.value)}
                  placeholder="如：腺癌、鳞癌"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">临床分期</label>
                <Select
                  value={formData.clinicalStage}
                  onChange={(value) => handleChange('clinicalStage', Array.isArray(value) ? value[0] : value)}
                  options={CLINICAL_STAGE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">肿瘤细胞含量</label>
                <Input
                  type="number"
                  value={formData.tumorPurity}
                  onChange={(e) => handleChange('tumorPurity', e.target.value)}
                  placeholder="%"
                />
              </div>
            </div>
          </div>

          {/* 样本信息 */}
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
                <label className="block text-xs text-fg-muted mb-1">样本来源</label>
                <Select
                  value={formData.sampleSource}
                  onChange={(value) => handleChange('sampleSource', Array.isArray(value) ? value[0] : value)}
                  options={SAMPLE_SOURCE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">取样方式</label>
                <Select
                  value={formData.samplingMethod}
                  onChange={(value) => handleChange('samplingMethod', Array.isArray(value) ? value[0] : value)}
                  options={SAMPLING_METHOD_OPTIONS}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">取样部位</label>
                <Input
                  value={formData.samplingLocation}
                  onChange={(e) => handleChange('samplingLocation', e.target.value)}
                  placeholder="如：右肺上叶"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPaired"
                  checked={formData.isPaired}
                  onChange={(e) => handleChange('isPaired', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="isPaired" className="text-xs text-fg-muted">配对样本</label>
              </div>
              {formData.isPaired && (
                <div className="col-span-2">
                  <label className="block text-xs text-fg-muted mb-1">对照样本编号</label>
                  <Input
                    value={formData.pairedSampleId}
                    onChange={(e) => handleChange('pairedSampleId', e.target.value)}
                    placeholder="输入正常对照样本编号"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 治疗信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">治疗信息</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasPriorTreatment"
                    checked={formData.hasPriorTreatment}
                    onChange={(e) => handleChange('hasPriorTreatment', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="hasPriorTreatment" className="text-xs text-fg-muted">有既往治疗</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isResistant"
                    checked={formData.isResistant}
                    onChange={(e) => handleChange('isResistant', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="isResistant" className="text-xs text-fg-muted">耐药样本</label>
                </div>
              </div>
              {formData.hasPriorTreatment && (
                <div>
                  <label className="block text-xs text-fg-muted mb-1">既往治疗详情</label>
                  <TextArea
                    value={formData.priorTreatmentDetail}
                    onChange={(e) => handleChange('priorTreatmentDetail', e.target.value)}
                    placeholder="请描述既往治疗方案，如：培美曲塞+顺铂 4周期"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 检测需求 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">检测需求</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">检测目的 *</label>
                <Select
                  value={formData.testPurpose}
                  onChange={(value) => handleChange('testPurpose', Array.isArray(value) ? value[0] : value)}
                  options={TEST_PURPOSE_OPTIONS}
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">重点关注基因</label>
                <Input
                  value={formData.focusGenes}
                  onChange={(e) => handleChange('focusGenes', e.target.value)}
                  placeholder="多个基因用逗号分隔，如：EGFR,ALK,ROS1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs text-fg-muted mb-1">临床问题</label>
              <TextArea
                value={formData.clinicalQuestion}
                onChange={(e) => handleChange('clinicalQuestion', e.target.value)}
                placeholder="请描述需要解决的临床问题"
                rows={2}
              />
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

          {/* HE 染色图片 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">HE 染色图片</h3>
            <p className="text-xs text-fg-muted mb-3">上传病理切片的 HE 染色图片，支持 JPG、PNG 格式</p>
            
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-default rounded-lg p-6 text-center cursor-pointer hover:border-accent-emphasis hover:bg-accent-subtle/30 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-fg-muted mx-auto mb-2" />
              <p className="text-sm text-fg-muted">点击或拖拽上传 HE 染色图片</p>
            </div>

            {formData.heImages.length > 0 && (
              <div className="mt-4 space-y-3">
                {formData.heImages.map((image) => (
                  <div key={image.id} className="flex gap-3 p-3 bg-canvas-subtle rounded-lg">
                    <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-canvas-inset">
                      <img
                        src={image.preview}
                        alt="HE 染色图片预览"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="w-4 h-4 text-fg-muted" />
                        <span className="text-sm text-fg-default truncate">{image.file.name}</span>
                        <span className="text-xs text-fg-muted">
                          ({(image.file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Input
                        value={image.description}
                        onChange={(e) => handleImageDescriptionChange(image.id, e.target.value)}
                        placeholder="添加图片描述（可选）"
                        className="text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="p-1.5 rounded hover:bg-danger-subtle text-fg-muted hover:text-danger-fg transition-colors self-start"
                      title="删除图片"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
