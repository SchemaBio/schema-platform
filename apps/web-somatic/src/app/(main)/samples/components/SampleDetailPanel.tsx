'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import { User, Stethoscope, FileText, FolderKanban, Activity, Image as ImageIcon, X, Pill, Target } from 'lucide-react';
import { getSampleDetail } from '../mock-data';
import type { SampleDetail } from '../types';
import { STATUS_CONFIG, GENDER_CONFIG, SAMPLE_SOURCE_OPTIONS, SAMPLING_METHOD_OPTIONS, TEST_PURPOSE_OPTIONS, TREATMENT_TYPE_OPTIONS } from '../types';

interface SampleDetailPanelProps {
  sampleId: string;
}

type TabType = 'basic' | 'tumor' | 'treatment' | 'submission' | 'project' | 'heImages' | 'analysis';

const TAB_CONFIGS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'basic', label: '基本信息', icon: <User className="w-4 h-4" /> },
  { id: 'tumor', label: '肿瘤信息', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'treatment', label: '治疗与检测', icon: <Pill className="w-4 h-4" /> },
  { id: 'submission', label: '送检信息', icon: <FileText className="w-4 h-4" /> },
  { id: 'project', label: '项目信息', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'heImages', label: 'HE 染色', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'analysis', label: '分析任务', icon: <Activity className="w-4 h-4" /> },
];

// 信息项组件
function InfoItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 ${className || ''}`}>
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
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>('basic');
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadSample() {
      setLoading(true);
      const data = await getSampleDetail(sampleId);
      setSample(data);
      setLoading(false);
    }
    loadSample();
  }, [sampleId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  if (!sample) {
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="姓名" value={sample.name} />
                <InfoItem label="性别" value={<span className={genderInfo.color}>{genderInfo.label}</span>} />
                <InfoItem label="年龄" value={`${sample.age}岁`} />
                <InfoItem label="出生日期" value={sample.birthDate} />
                <InfoItem label="身份证号" value={sample.idCard} />
                <InfoItem label="联系电话" value={sample.phone} />
              </div>
            </InfoCard>
            <InfoCard title="样本信息">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="样本编号" value={sample.id} />
                <InfoItem label="样本类型" value={sample.sampleType} />
                <InfoItem 
                  label="是否配对" 
                  value={
                    <Tag variant={sample.sourceInfo.isPaired ? 'success' : 'neutral'}>
                      {sample.sourceInfo.isPaired ? '是' : '否'}
                    </Tag>
                  } 
                />
                {sample.sourceInfo.isPaired && (
                  <InfoItem label="配对样本" value={sample.sourceInfo.pairedSampleId} />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem 
                  label="肿瘤类型" 
                  value={<Tag variant="danger">{sample.tumorInfo.tumorType}</Tag>} 
                />
                <InfoItem label="病理分型" value={sample.tumorInfo.pathologyType} />
                <InfoItem 
                  label="临床分期" 
                  value={
                    sample.tumorInfo.clinicalStage && (
                      <Tag variant="warning">{sample.tumorInfo.clinicalStage} 期</Tag>
                    )
                  } 
                />
                <InfoItem 
                  label="肿瘤细胞含量" 
                  value={sample.tumorInfo.tumorPurity ? `${sample.tumorInfo.tumorPurity}%` : undefined} 
                />
              </div>
            </InfoCard>
            {sample.tumorInfo.tnmStage && (
              <InfoCard title="TNM 分期">
                <div className="grid grid-cols-3 gap-4">
                  <InfoItem label="T 分期" value={sample.tumorInfo.tnmStage.t} />
                  <InfoItem label="N 分期" value={sample.tumorInfo.tnmStage.n} />
                  <InfoItem label="M 分期" value={sample.tumorInfo.tnmStage.m} />
                </div>
              </InfoCard>
            )}
            <InfoCard title="样本来源">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem 
                  label="来源类型" 
                  value={getOptionLabel(SAMPLE_SOURCE_OPTIONS, sample.sourceInfo.sampleSource)} 
                />
                <InfoItem 
                  label="取样方式" 
                  value={getOptionLabel(SAMPLING_METHOD_OPTIONS, sample.sourceInfo.samplingMethod)} 
                />
                <InfoItem label="取样日期" value={sample.sourceInfo.samplingDate} />
                <InfoItem label="取样部位" value={sample.sourceInfo.samplingLocation} />
              </div>
            </InfoCard>
          </div>
        );

      case 'treatment':
        return (
          <div className="space-y-4">
            <InfoCard title="既往治疗">
              <div className="space-y-3">
                <InfoItem 
                  label="是否有既往治疗" 
                  value={
                    <Tag variant={sample.treatmentInfo.hasPriorTreatment ? 'warning' : 'neutral'}>
                      {sample.treatmentInfo.hasPriorTreatment ? '有' : '无'}
                    </Tag>
                  } 
                />
                {sample.treatmentInfo.hasPriorTreatment && sample.treatmentInfo.priorTreatments && (
                  <div className="mt-3 space-y-2">
                    {sample.treatmentInfo.priorTreatments.map((treatment, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 bg-canvas-default rounded">
                        <Tag variant="info">
                          {getOptionLabel(TREATMENT_TYPE_OPTIONS, treatment.type)}
                        </Tag>
                        <span className="text-sm text-fg-default flex-1">{treatment.detail || '-'}</span>
                        {treatment.date && (
                          <span className="text-xs text-fg-muted">{treatment.date}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  <InfoItem label="当前用药" value={sample.treatmentInfo.currentMedication} />
                  <InfoItem 
                    label="是否耐药" 
                    value={
                      <Tag variant={sample.treatmentInfo.isResistant ? 'danger' : 'neutral'}>
                        {sample.treatmentInfo.isResistant ? '是' : '否'}
                      </Tag>
                    } 
                  />
                  <InfoItem 
                    label="是否复发" 
                    value={
                      <Tag variant={sample.treatmentInfo.isRecurrent ? 'danger' : 'neutral'}>
                        {sample.treatmentInfo.isRecurrent ? '是' : '否'}
                      </Tag>
                    } 
                  />
                </div>
              </div>
            </InfoCard>
            <InfoCard title="检测需求">
              <div className="space-y-3">
                <InfoItem 
                  label="检测目的" 
                  value={
                    <Tag variant="info">
                      {getOptionLabel(TEST_PURPOSE_OPTIONS, sample.testRequirement.testPurpose)}
                    </Tag>
                  } 
                />
                {sample.testRequirement.focusGenes && sample.testRequirement.focusGenes.length > 0 && (
                  <InfoItem 
                    label="重点关注基因" 
                    value={
                      <div className="flex flex-wrap gap-1">
                        {sample.testRequirement.focusGenes.map((gene, i) => (
                          <Tag key={i} variant="neutral">{gene}</Tag>
                        ))}
                      </div>
                    } 
                  />
                )}
                {sample.testRequirement.focusPathways && sample.testRequirement.focusPathways.length > 0 && (
                  <InfoItem 
                    label="重点关注通路" 
                    value={
                      <div className="flex flex-wrap gap-1">
                        {sample.testRequirement.focusPathways.map((pathway, i) => (
                          <Tag key={i} variant="neutral">{pathway}</Tag>
                        ))}
                      </div>
                    } 
                  />
                )}
                {sample.testRequirement.clinicalQuestion && (
                  <InfoItem label="临床问题" value={sample.testRequirement.clinicalQuestion} />
                )}
              </div>
            </InfoCard>
          </div>
        );

      case 'submission':
        return (
          <InfoCard title="送检信息">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="送检医院" value={sample.submissionInfo.hospital} />
              <InfoItem label="送检科室" value={sample.submissionInfo.department} />
              <InfoItem label="送检医生" value={sample.submissionInfo.doctor} />
              <InfoItem label="送检日期" value={sample.submissionInfo.submissionDate} />
              <InfoItem label="采样日期" value={sample.submissionInfo.sampleCollectionDate} />
              <InfoItem label="收样日期" value={sample.submissionInfo.sampleReceiveDate} />
              <InfoItem 
                label="样本质量" 
                value={
                  <Tag variant={
                    sample.submissionInfo.sampleQuality === 'good' ? 'success' :
                    sample.submissionInfo.sampleQuality === 'acceptable' ? 'warning' : 'danger'
                  }>
                    {sample.submissionInfo.sampleQuality === 'good' ? '良好' :
                     sample.submissionInfo.sampleQuality === 'acceptable' ? '合格' : '不合格'}
                  </Tag>
                } 
              />
            </div>
          </InfoCard>
        );

      case 'project':
        return (
          <InfoCard title="项目信息">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="项目编号" value={sample.projectInfo.projectId} />
              <InfoItem label="项目名称" value={sample.projectInfo.projectName} />
              <InfoItem label="检测Panel" value={sample.projectInfo.panel} />
              <InfoItem 
                label="检测项目" 
                value={
                  sample.projectInfo.testItems.length > 0
                    ? sample.projectInfo.testItems.map((item, i) => (
                        <Tag key={i} variant="info" className="mr-1 mb-1">{item}</Tag>
                      ))
                    : '-'
                } 
              />
              <InfoItem label="承诺周期" value={`${sample.projectInfo.turnaroundDays}天`} />
              <InfoItem 
                label="优先级" 
                value={
                  <Tag variant={sample.projectInfo.priority === 'urgent' ? 'danger' : 'neutral'}>
                    {sample.projectInfo.priority === 'urgent' ? '加急' : '普通'}
                  </Tag>
                } 
              />
            </div>
          </InfoCard>
        );

      case 'heImages':
        return (
          <div className="space-y-4">
            <InfoCard title="HE 染色图片">
              {sample.heImages && sample.heImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {sample.heImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-canvas-default rounded-lg overflow-hidden border border-border-default hover:border-accent-emphasis transition-colors cursor-pointer"
                      onClick={() => setPreviewImage(image.url)}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
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
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-fg-muted">暂无 HE 染色图片</p>
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

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* 样本信息头部 */}
      <div className="mb-4 pb-3 border-b border-border-default">
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
