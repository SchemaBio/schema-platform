'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea } from '@schema/ui-kit';
import { X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Gender, SampleType, SampleSource, SamplingMethod, TestPurpose, ClinicalStage } from '../types';
import { 
  SAMPLE_TYPE_OPTIONS, 
  SAMPLE_SOURCE_OPTIONS, 
  SAMPLING_METHOD_OPTIONS, 
  TEST_PURPOSE_OPTIONS, 
  CLINICAL_STAGE_OPTIONS,
  TUMOR_TYPE_OPTIONS,
} from '../types';

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

export interface NewSampleFormData {
  // 患者信息
  name: string;
  gender: Gender;
  age: string;
  birthDate: string;
  
  // 样本信息
  sampleType: SampleType;
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
  const [formData, setFormData] = React.useState<NewSampleFormData>({
    name: '',
    gender: 'unknown',
    age: '',
    birthDate: '',
    sampleType: 'FFPE',
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

  const handleChange = (field: keyof NewSampleFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    setFormData({
      name: '',
      gender: 'unknown',
      age: '',
      birthDate: '',
      sampleType: 'FFPE',
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
          {/* 患者信息 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-fg-default mb-3">患者信息</h3>
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
                <label className="block text-xs text-fg-muted mb-1">出生日期</label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                />
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
