'use client';

import * as React from 'react';
import { Button, Input, Select, TextArea, Tag } from '@schema/ui-kit';
import { User, Stethoscope, FileText, FolderKanban, Activity, Image as ImageIcon, X, Pill, Save, Calendar, Upload, Trash2, Link2 } from 'lucide-react';
import { getSampleDetail } from '../mock-data';
import type { SampleDetail } from '../types';
import { 
  STATUS_CONFIG, 
  GENDER_CONFIG, 
  SAMPLE_TYPE_OPTIONS,
  NUCLEIC_ACID_TYPE_OPTIONS,
  SAMPLE_SOURCE_OPTIONS, 
  SAMPLING_METHOD_OPTIONS, 
  TEST_PURPOSE_OPTIONS, 
  TREATMENT_TYPE_OPTIONS,
  CLINICAL_STAGE_OPTIONS,
  TUMOR_TYPE_OPTIONS,
} from '../types';

interface SampleDetailPanelProps {
  sampleId: string;
}

type TabType = 'basic' | 'tumor' | 'treatment' | 'submission' | 'project' | 'heImages' | 'analysis' | 'related';

const TAB_CONFIGS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'basic', label: '基本信息', icon: <User className="w-4 h-4" /> },
  { id: 'tumor', label: '肿瘤信息', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'treatment', label: '治疗与检测', icon: <Pill className="w-4 h-4" /> },
  { id: 'submission', label: '送检信息', icon: <FileText className="w-4 h-4" /> },
  { id: 'project', label: '项目信息', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'heImages', label: 'HE 染色', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'analysis', label: '分析任务', icon: <Activity className="w-4 h-4" /> },
  { id: 'related', label: '关联样本', icon: <Link2 className="w-4 h-4" /> },
];

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'unknown', label: '未知' },
];

const priorityOptions = [
  { value: 'normal', label: '普通' },
  { value: 'urgent', label: '加急' },
];

const qualityOptions = [
  { value: 'good', label: '良好' },
  { value: 'acceptable', label: '合格' },
  { value: 'poor', label: '不合格' },
];

// 可编辑的信息项组件
function EditableItem({ 
  label, 
  value, 
  onChange,
  type = 'text',
  options,
  placeholder,
  disabled,
}: { 
  label: string; 
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      {type === 'select' && options ? (
        <Select
          value={String(value || '')}
          onChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
          options={options}
          disabled={disabled}
        />
      ) : type === 'textarea' ? (
        <TextArea
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          disabled={disabled}
        />
      ) : type === 'date' ? (
        <div className="flex items-center gap-1">
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder="1990-01-15"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => dateInputRef.current?.showPicker()}
            className="p-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            disabled={disabled}
          >
            <Calendar className="w-4 h-4 text-gray-500" />
          </button>
          <input
            ref={dateInputRef}
            type="date"
            value={String(value || '')}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
            disabled={disabled}
          />
        </div>
      ) : (
        <Input
          type={type}
          value={String(value || '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// 只读信息项组件
function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-fg-muted">{label}</span>
      <span className="text-sm text-fg-default">{value || '-'}</span>
    </div>
  );
}

// 信息卡片组件
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-canvas-subtle rounded-lg p-4">
      <h4 className="text-sm font-medium text-fg-default mb-3">{title}</h4>
      {children}
    </div>
  );
}

// 获取选项标签
function getOptionLabel(options: { value: string; label: string }[], value: string): string {
  return options.find(o => o.value === value)?.label || value;
}

export function SampleDetailPanel({ sampleId }: SampleDetailPanelProps) {
  const [sample, setSample] = React.useState<SampleDetail | null>(null);
  const [editedSample, setEditedSample] = React.useState<SampleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>('basic');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const heImageInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function loadSample() {
      setLoading(true);
      const data = await getSampleDetail(sampleId);
      setSample(data);
      setEditedSample(data);
      setHasChanges(false);
      setLoading(false);
    }
    loadSample();
  }, [sampleId]);

  const updateField = (path: string, value: string | number | boolean | string[]) => {
    if (!editedSample) return;
    
    const keys = path.split('.');
    const newSample = JSON.parse(JSON.stringify(editedSample));
    let obj = newSample;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    
    setEditedSample(newSample);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!editedSample) return;
    
    setSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 500));
    setSample(editedSample);
    setHasChanges(false);
    setSaving(false);
    console.log('保存样本数据:', editedSample);
  };

  const handleHeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editedSample || !e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      thumbnail: URL.createObjectURL(file),
      description: file.name.replace(/\.[^/.]+$/, ''),
      uploadedAt: new Date().toISOString().split('T')[0],
    }));

    const updatedSample = {
      ...editedSample,
      heImages: [...(editedSample.heImages || []), ...newImages],
    };
    setEditedSample(updatedSample);
    setHasChanges(true);

    if (heImageInputRef.current) {
      heImageInputRef.current.value = '';
    }
  };

  const handleDeleteHeImage = (imageId: string) => {
    if (!editedSample) return;
    
    const updatedSample = {
      ...editedSample,
      heImages: (editedSample.heImages || []).filter(img => img.id !== imageId),
    };
    setEditedSample(updatedSample);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  if (!sample || !editedSample) {
    return (
      <div className="flex items-center justify-center py-16 text-fg-muted">
        未找到该样本
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[sample.status];
  const genderInfo = GENDER_CONFIG[sample.gender];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-4">
            <InfoCard title="患者信息">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <EditableItem 
                  label="姓名" 
                  value={editedSample.name}
                  onChange={(v) => updateField('name', v)}
                />
                <EditableItem 
                  label="性别" 
                  value={editedSample.gender}
                  onChange={(v) => updateField('gender', v)}
                  type="select"
                  options={genderOptions}
                />
                <EditableItem 
                  label="年龄" 
                  value={editedSample.age}
                  onChange={(v) => updateField('age', parseInt(v) || 0)}
                  type="number"
                />
                <EditableItem 
                  label="出生日期" 
                  value={editedSample.birthDate}
                  onChange={(v) => updateField('birthDate', v)}
                  type="date"
                />
                <EditableItem
                  label="身份证号"
                  value={editedSample.idCard}
                  onChange={(v) => updateField('idCard', v)}
                  placeholder="选填"
                />
                <EditableItem
                  label="患者编号"
                  value={editedSample.patientCode}
                  onChange={(v) => updateField('patientCode', v)}
                  placeholder="身份证号或自定义编号"
                />
                <EditableItem
                  label="联系电话"
                  value={editedSample.phone}
                  onChange={(v) => updateField('phone', v)}
                  placeholder="选填"
                />
              </div>
            </InfoCard>
            <InfoCard title="样本信息">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="样本编号" value={sample.id} />
                <EditableItem 
                  label="样本类型" 
                  value={editedSample.sampleType}
                  onChange={(v) => updateField('sampleType', v)}
                  type="select"
                  options={SAMPLE_TYPE_OPTIONS}
                />
                <EditableItem 
                  label="核酸类型" 
                  value={(editedSample as any).nucleicAcidType || 'DNA'}
                  onChange={(v) => updateField('nucleicAcidType', v)}
                  type="select"
                  options={NUCLEIC_ACID_TYPE_OPTIONS}
                />
                <InfoItem 
                  label="是否配对" 
                  value={
                    <Tag variant={editedSample.sourceInfo.isPaired ? 'success' : 'neutral'}>
                      {editedSample.sourceInfo.isPaired ? '是' : '否'}
                    </Tag>
                  } 
                />
                {editedSample.sourceInfo.isPaired && (
                  <EditableItem 
                    label="配对样本" 
                    value={editedSample.sourceInfo.pairedSampleId}
                    onChange={(v) => updateField('sourceInfo.pairedSampleId', v)}
                  />
                )}
                <InfoItem label="创建时间" value={sample.createdAt} />
                <InfoItem label="更新时间" value={sample.updatedAt} />
              </div>
            </InfoCard>
          </div>
        );

      case 'tumor':
        return (
          <div className="space-y-4">
            <InfoCard title="肿瘤诊断">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <EditableItem 
                  label="肿瘤类型" 
                  value={editedSample.tumorInfo.tumorType}
                  onChange={(v) => updateField('tumorInfo.tumorType', v)}
                  type="select"
                  options={TUMOR_TYPE_OPTIONS}
                />
                <EditableItem 
                  label="病理分型" 
                  value={editedSample.tumorInfo.pathologyType}
                  onChange={(v) => updateField('tumorInfo.pathologyType', v)}
                  placeholder="如：腺癌、鳞癌"
                />
                <EditableItem 
                  label="临床分期" 
                  value={editedSample.tumorInfo.clinicalStage}
                  onChange={(v) => updateField('tumorInfo.clinicalStage', v)}
                  type="select"
                  options={CLINICAL_STAGE_OPTIONS}
                />
                <EditableItem 
                  label="肿瘤细胞含量(%)" 
                  value={editedSample.tumorInfo.tumorPurity}
                  onChange={(v) => updateField('tumorInfo.tumorPurity', parseInt(v) || 0)}
                  type="number"
                />
              </div>
            </InfoCard>
            <InfoCard title="TNM 分期">
              <div className="grid grid-cols-3 gap-4">
                <EditableItem 
                  label="T 分期" 
                  value={editedSample.tumorInfo.tnmStage?.t}
                  onChange={(v) => updateField('tumorInfo.tnmStage.t', v)}
                  placeholder="如：T2"
                />
                <EditableItem 
                  label="N 分期" 
                  value={editedSample.tumorInfo.tnmStage?.n}
                  onChange={(v) => updateField('tumorInfo.tnmStage.n', v)}
                  placeholder="如：N1"
                />
                <EditableItem 
                  label="M 分期" 
                  value={editedSample.tumorInfo.tnmStage?.m}
                  onChange={(v) => updateField('tumorInfo.tnmStage.m', v)}
                  placeholder="如：M0"
                />
              </div>
            </InfoCard>
            <InfoCard title="样本来源">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <EditableItem 
                  label="来源类型" 
                  value={editedSample.sourceInfo.sampleSource}
                  onChange={(v) => updateField('sourceInfo.sampleSource', v)}
                  type="select"
                  options={SAMPLE_SOURCE_OPTIONS}
                />
                <EditableItem 
                  label="取样方式" 
                  value={editedSample.sourceInfo.samplingMethod}
                  onChange={(v) => updateField('sourceInfo.samplingMethod', v)}
                  type="select"
                  options={SAMPLING_METHOD_OPTIONS}
                />
                <EditableItem 
                  label="取样日期" 
                  value={editedSample.sourceInfo.samplingDate}
                  onChange={(v) => updateField('sourceInfo.samplingDate', v)}
                  type="date"
                />
                <EditableItem 
                  label="取样部位" 
                  value={editedSample.sourceInfo.samplingLocation}
                  onChange={(v) => updateField('sourceInfo.samplingLocation', v)}
                  placeholder="如：右肺上叶"
                />
              </div>
            </InfoCard>
          </div>
        );

      case 'treatment':
        return (
          <div className="space-y-4">
            <InfoCard title="既往治疗">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedSample.treatmentInfo.hasPriorTreatment}
                      onChange={(e) => updateField('treatmentInfo.hasPriorTreatment', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-fg-default">有既往治疗</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedSample.treatmentInfo.isResistant}
                      onChange={(e) => updateField('treatmentInfo.isResistant', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-fg-default">耐药样本</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editedSample.treatmentInfo.isRecurrent}
                      onChange={(e) => updateField('treatmentInfo.isRecurrent', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-fg-default">复发样本</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <EditableItem 
                    label="当前用药" 
                    value={editedSample.treatmentInfo.currentMedication}
                    onChange={(v) => updateField('treatmentInfo.currentMedication', v)}
                    placeholder="选填"
                  />
                </div>
              </div>
            </InfoCard>
            <InfoCard title="检测需求">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <EditableItem 
                    label="检测目的" 
                    value={editedSample.testRequirement.testPurpose}
                    onChange={(v) => updateField('testRequirement.testPurpose', v)}
                    type="select"
                    options={TEST_PURPOSE_OPTIONS}
                  />
                  <EditableItem 
                    label="重点关注基因" 
                    value={editedSample.testRequirement.focusGenes?.join(', ')}
                    onChange={(v) => updateField('testRequirement.focusGenes', v.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="多个基因用逗号分隔"
                  />
                </div>
                <EditableItem 
                  label="临床问题" 
                  value={editedSample.testRequirement.clinicalQuestion}
                  onChange={(v) => updateField('testRequirement.clinicalQuestion', v)}
                  type="textarea"
                  placeholder="请描述需要解决的临床问题"
                />
              </div>
            </InfoCard>
          </div>
        );

      case 'submission':
        return (
          <InfoCard title="送检信息">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <EditableItem 
                label="送检医院" 
                value={editedSample.submissionInfo.hospital}
                onChange={(v) => updateField('submissionInfo.hospital', v)}
              />
              <EditableItem 
                label="送检科室" 
                value={editedSample.submissionInfo.department}
                onChange={(v) => updateField('submissionInfo.department', v)}
              />
              <EditableItem 
                label="送检医生" 
                value={editedSample.submissionInfo.doctor}
                onChange={(v) => updateField('submissionInfo.doctor', v)}
              />
              <EditableItem 
                label="送检日期" 
                value={editedSample.submissionInfo.submissionDate}
                onChange={(v) => updateField('submissionInfo.submissionDate', v)}
                type="date"
              />
              <EditableItem 
                label="采样日期" 
                value={editedSample.submissionInfo.sampleCollectionDate}
                onChange={(v) => updateField('submissionInfo.sampleCollectionDate', v)}
                type="date"
              />
              <EditableItem 
                label="收样日期" 
                value={editedSample.submissionInfo.sampleReceiveDate}
                onChange={(v) => updateField('submissionInfo.sampleReceiveDate', v)}
                type="date"
              />
              <EditableItem 
                label="样本质量" 
                value={editedSample.submissionInfo.sampleQuality}
                onChange={(v) => updateField('submissionInfo.sampleQuality', v)}
                type="select"
                options={qualityOptions}
              />
            </div>
          </InfoCard>
        );

      case 'project':
        return (
          <InfoCard title="项目信息">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <EditableItem 
                label="项目编号" 
                value={editedSample.projectInfo.projectId}
                onChange={(v) => updateField('projectInfo.projectId', v)}
              />
              <EditableItem 
                label="项目名称" 
                value={editedSample.projectInfo.projectName}
                onChange={(v) => updateField('projectInfo.projectName', v)}
              />
              <EditableItem 
                label="检测Panel" 
                value={editedSample.projectInfo.panel}
                onChange={(v) => updateField('projectInfo.panel', v)}
              />
              <EditableItem 
                label="检测项目" 
                value={editedSample.projectInfo.testItems.join(', ')}
                onChange={(v) => updateField('projectInfo.testItems', v.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="多个项目用逗号分隔"
              />
              <EditableItem 
                label="承诺周期(天)" 
                value={editedSample.projectInfo.turnaroundDays}
                onChange={(v) => updateField('projectInfo.turnaroundDays', parseInt(v) || 0)}
                type="number"
              />
              <EditableItem 
                label="优先级" 
                value={editedSample.projectInfo.priority}
                onChange={(v) => updateField('projectInfo.priority', v)}
                type="select"
                options={priorityOptions}
              />
            </div>
          </InfoCard>
        );

      case 'heImages':
        return (
          <div className="space-y-4">
            <InfoCard title="HE 染色图片">
              {/* 上传区域 */}
              <div className="mb-4">
                <div
                  onClick={() => heImageInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <input
                    ref={heImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    multiple
                    onChange={handleHeImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">点击或拖拽上传 HE 染色图片</p>
                  <p className="text-xs text-gray-400 mt-1">支持 JPG、PNG 格式</p>
                </div>
              </div>

              {/* 图片列表 */}
              {editedSample.heImages && editedSample.heImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {editedSample.heImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-canvas-default rounded-lg overflow-hidden border border-border-default hover:border-accent-emphasis transition-colors"
                    >
                      <div 
                        className="aspect-[4/3] overflow-hidden cursor-pointer"
                        onClick={() => setPreviewImage(image.url)}
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.description || 'HE 染色图片'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-fg-default truncate">{image.description || '无描述'}</p>
                        <p className="text-xs text-fg-muted">{image.uploadedAt}</p>
                      </div>
                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHeImage(image.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                        title="删除图片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fg-muted text-center py-4">暂无 HE 染色图片，请点击上方区域上传</p>
              )}
            </InfoCard>
          </div>
        );

      case 'analysis':
        return (
          <InfoCard title="关联分析任务">
            {sample.analysisTasks.length > 0 ? (
              <div className="space-y-2">
                {sample.analysisTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-canvas-default rounded hover:bg-canvas-inset transition-colors cursor-pointer">
                    <div>
                      <span className="text-sm font-medium text-fg-default">{task.name}</span>
                      <span className="text-xs text-fg-muted ml-2">{task.createdAt}</span>
                    </div>
                    <Tag variant={
                      task.status === 'completed' ? 'success' :
                      task.status === 'running' ? 'info' : 'neutral'
                    }>
                      {task.status === 'completed' ? '已完成' :
                       task.status === 'running' ? '运行中' : task.status}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-fg-muted">暂无关联的分析任务</p>
            )}
          </InfoCard>
        );

      case 'related':
        return (
          <div className="space-y-4">
            <InfoCard title="患者标识">
              <div className="grid grid-cols-2 gap-4">
                <InfoItem
                  label="身份证号"
                  value={sample.idCard || <span className="text-fg-muted">未填写</span>}
                />
                <InfoItem
                  label="患者编号"
                  value={sample.patientCode}
                />
              </div>
            </InfoCard>
            <InfoCard title="该患者的其他样本">
              {sample.relatedSamples && sample.relatedSamples.length > 0 ? (
                <div className="space-y-2">
                  {sample.relatedSamples.map((relatedSample) => {
                    const statusInfo = STATUS_CONFIG[relatedSample.status];
                    return (
                      <div
                        key={relatedSample.id}
                        className="flex items-center justify-between p-3 bg-canvas-default rounded hover:bg-canvas-inset transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="text-sm font-medium text-fg-default">{relatedSample.internalId}</span>
                          <span className="text-xs text-fg-muted ml-2">{relatedSample.tumorType}</span>
                          <span className="text-xs text-fg-muted ml-2">{relatedSample.createdAt}</span>
                        </div>
                        <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Link2 className="w-8 h-8 text-fg-muted mx-auto mb-2" />
                  <p className="text-sm text-fg-muted">该患者暂无其他样本</p>
                  <p className="text-xs text-fg-muted mt-1">同一患者的新样本将通过患者编号自动关联</p>
                </div>
              )}
            </InfoCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* 样本信息头部 */}
      <div className="mb-4 pb-3 border-b border-border-default">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-medium text-fg-default">{sample.name}</h3>
              <span className={`text-sm ${genderInfo.color}`}>{genderInfo.label}</span>
              <span className="text-sm text-fg-muted">{sample.age}岁</span>
              <Tag variant="danger">{sample.tumorInfo.tumorType}</Tag>
              <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
            </div>
            <div className="flex items-center gap-4 text-xs text-fg-muted">
              <span>样本编号: {sample.id}</span>
              <span>样本类型: {sample.sampleType}</span>
              {sample.tumorInfo.clinicalStage && <span>分期: {sample.tumorInfo.clinicalStage}期</span>}
              {sample.sourceInfo.isPaired && <span>配对样本: {sample.sourceInfo.pairedSampleId}</span>}
            </div>
          </div>
          {hasChanges && (
            <Button 
              variant="primary" 
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存修改'}
            </Button>
          )}
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-border-default mb-4">
        <nav className="flex gap-1" role="tablist">
          {TAB_CONFIGS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors
                  ${isActive
                    ? 'border-accent-emphasis text-accent-fg'
                    : 'border-transparent text-fg-muted hover:text-fg-default'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 标签页内容 */}
      <div>{renderTabContent()}</div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="HE 染色图片预览"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
