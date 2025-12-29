'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';
import { User, Stethoscope, FileText, FolderKanban, Users, Activity } from 'lucide-react';
import { getSampleDetail } from '../mock-data';
import type { SampleDetail } from '../types';
import { STATUS_CONFIG, GENDER_CONFIG } from '../types';

interface SampleDetailPanelProps {
  sampleId: string;
}

type TabType = 'basic' | 'clinical' | 'submission' | 'project' | 'family' | 'analysis';

const TAB_CONFIGS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'basic', label: '基本信息', icon: <User className="w-4 h-4" /> },
  { id: 'clinical', label: '临床诊断', icon: <Stethoscope className="w-4 h-4" /> },
  { id: 'submission', label: '送检信息', icon: <FileText className="w-4 h-4" /> },
  { id: 'project', label: '项目信息', icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'family', label: '家族史', icon: <Users className="w-4 h-4" /> },
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

export function SampleDetailPanel({ sampleId }: SampleDetailPanelProps) {
  const [sample, setSample] = React.useState<SampleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>('basic');

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
            <InfoCard title="个人信息">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="姓名" value={sample.name} />
                <InfoItem label="性别" value={<span className={genderInfo.color}>{genderInfo.label}</span>} />
                <InfoItem label="年龄" value={`${sample.age}岁`} />
                <InfoItem label="出生日期" value={sample.birthDate} />
                <InfoItem label="民族" value={sample.ethnicity} />
                <InfoItem label="身份证号" value={sample.idCard} />
                <InfoItem label="联系电话" value={sample.phone} />
              </div>
            </InfoCard>
            <InfoCard title="样本信息">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <InfoItem label="样本编号" value={sample.id} />
                <InfoItem label="样本类型" value={sample.sampleType} />
                <InfoItem label="家系编号" value={sample.pedigreeId} />
                <InfoItem label="家系名称" value={sample.pedigreeName} />
                <InfoItem label="创建时间" value={sample.createdAt} />
                <InfoItem label="更新时间" value={sample.updatedAt} />
              </div>
            </InfoCard>
          </div>
        );

      case 'clinical':
        return (
          <div className="space-y-4">
            <InfoCard title="诊断信息">
              <div className="space-y-4">
                <InfoItem label="主要诊断" value={sample.clinicalDiagnosis.mainDiagnosis} />
                <InfoItem 
                  label="临床症状" 
                  value={
                    sample.clinicalDiagnosis.symptoms.length > 0 
                      ? sample.clinicalDiagnosis.symptoms.map((s, i) => (
                          <Tag key={i} variant="neutral" className="mr-1 mb-1">{s}</Tag>
                        ))
                      : '-'
                  } 
                />
                <InfoItem label="发病年龄" value={sample.clinicalDiagnosis.onsetAge} />
              </div>
            </InfoCard>
            <InfoCard title="病史描述">
              <p className="text-sm text-fg-default whitespace-pre-wrap">
                {sample.clinicalDiagnosis.diseaseHistory || '暂无病史描述'}
              </p>
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

      case 'family':
        return (
          <div className="space-y-4">
            <InfoCard title="家族史概况">
              <InfoItem 
                label="是否有家族史" 
                value={
                  <Tag variant={sample.familyHistory.hasHistory ? 'warning' : 'neutral'}>
                    {sample.familyHistory.hasHistory ? '有' : '无'}
                  </Tag>
                } 
              />
            </InfoCard>
            {sample.familyHistory.hasHistory && sample.familyHistory.affectedMembers && (
              <InfoCard title="患病亲属">
                <div className="space-y-3">
                  {sample.familyHistory.affectedMembers.map((member, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 bg-canvas-default rounded">
                      <span className="text-sm font-medium text-fg-default w-16">{member.relation}</span>
                      <span className="text-sm text-fg-default flex-1">{member.condition}</span>
                      {member.onsetAge && (
                        <span className="text-xs text-fg-muted">发病年龄: {member.onsetAge}</span>
                      )}
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
            {sample.familyHistory.pedigreeNote && (
              <InfoCard title="家系备注">
                <p className="text-sm text-fg-default">{sample.familyHistory.pedigreeNote}</p>
              </InfoCard>
            )}
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
          <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
        </div>
        <div className="flex items-center gap-4 text-xs text-fg-muted">
          <span>样本编号: {sample.id}</span>
          <span>样本类型: {sample.sampleType}</span>
          <span>家系: {sample.pedigreeName}</span>
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
    </div>
  );
}
