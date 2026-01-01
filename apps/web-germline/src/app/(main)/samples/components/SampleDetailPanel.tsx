'use client';

import * as React from 'react';
import Link from 'next/link';
import { Tag, Button, Input, Select, TextArea } from '@schema/ui-kit';
import { User, Stethoscope, FileText, FolderKanban, Users, Activity, GitBranch, Pencil, Save, X, Plus, Search } from 'lucide-react';
import { getSampleDetail } from '../mock-data';
import type { SampleDetail } from '../types';
import { STATUS_CONFIG, GENDER_CONFIG } from '../types';

interface SampleDetailPanelProps {
  sampleId: string;
  onClose?: () => void;
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

// 信息项组件（支持编辑模式）
function InfoItem({
  label,
  value,
  className,
  isEditing,
  editValue,
  onEditChange,
  type = 'text'
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  isEditing?: boolean;
  editValue?: string;
  onEditChange?: (value: string) => void;
  type?: 'text' | 'date' | 'select';
}) {
  if (isEditing && onEditChange) {
    return (
      <div className={`flex flex-col gap-1 ${className || ''}`}>
        <span className="text-xs text-fg-muted">{label}</span>
        <Input
          value={editValue || ''}
          onChange={(e) => onEditChange(e.target.value)}
          type={type === 'date' ? 'date' : 'text'}
          className="text-sm"
        />
      </div>
    );
  }
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

// 常用HPO术语列表（模拟数据）
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

// HPO术语输入组件
function HpoTermInput({ onAdd }: { onAdd: (term: { id: string; name: string }) => void }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredTerms = React.useMemo(() => {
    if (!searchQuery) return COMMON_HPO_TERMS.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return COMMON_HPO_TERMS.filter(
      t => t.id.toLowerCase().includes(query) || t.name.includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="搜索HPO术语（如：HP:0001250 或 癫痫）"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            leftElement={<Search className="w-4 h-4" />}
          />
          {showDropdown && filteredTerms.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-auto">
              {filteredTerms.map((term) => (
                <button
                  key={term.id}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    onAdd(term);
                    setSearchQuery('');
                    setShowDropdown(false);
                  }}
                >
                  <span className="font-mono text-xs text-blue-500">{term.id}</span>
                  <span className="text-sm">{term.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {showDropdown && (
        <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)} />
      )}
    </div>
  );
}

export function SampleDetailPanel({ sampleId, onClose }: SampleDetailPanelProps) {
  const [sample, setSample] = React.useState<SampleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabType>('basic');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editData, setEditData] = React.useState<Partial<SampleDetail>>({});

  React.useEffect(() => {
    async function loadSample() {
      setLoading(true);
      const data = await getSampleDetail(sampleId);
      setSample(data);
      if (data) {
        setEditData(data);
      }
      setLoading(false);
    }
    loadSample();
  }, [sampleId]);

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editData) {
      setSample(editData as SampleDetail);
      setIsEditing(false);
      console.log('保存样本数据:', editData);
    }
  };

  const handleCancelEdit = () => {
    if (sample) {
      setEditData(sample);
    }
    setIsEditing(false);
  };

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
                <InfoItem
                  label="姓名"
                  value={sample.name}
                  isEditing={isEditing}
                  editValue={editData.name}
                  onEditChange={(v) => handleEditChange('name', v)}
                />
                <InfoItem label="性别" value={<span className={genderInfo.color}>{genderInfo.label}</span>} />
                <InfoItem label="年龄" value={`${sample.age}岁`} />
                <InfoItem
                  label="出生日期"
                  value={sample.birthDate}
                  isEditing={isEditing}
                  editValue={editData.birthDate}
                  onEditChange={(v) => handleEditChange('birthDate', v)}
                  type="date"
                />
                <InfoItem
                  label="民族"
                  value={sample.ethnicity}
                  isEditing={isEditing}
                  editValue={editData.ethnicity}
                  onEditChange={(v) => handleEditChange('ethnicity', v)}
                />
                <InfoItem
                  label="身份证号"
                  value={sample.idCard}
                  isEditing={isEditing}
                  editValue={editData.idCard}
                  onEditChange={(v) => handleEditChange('idCard', v)}
                />
                <InfoItem
                  label="联系电话"
                  value={sample.phone}
                  isEditing={isEditing}
                  editValue={editData.phone}
                  onEditChange={(v) => handleEditChange('phone', v)}
                />
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
                <InfoItem
                  label="主要诊断"
                  value={sample.clinicalDiagnosis.mainDiagnosis}
                  isEditing={isEditing}
                  editValue={(editData.clinicalDiagnosis as any)?.mainDiagnosis}
                  onEditChange={(v) => setEditData(prev => ({
                    ...prev,
                    clinicalDiagnosis: { ...prev.clinicalDiagnosis, mainDiagnosis: v }
                  } as any))}
                />
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
                <InfoItem
                  label="发病年龄"
                  value={sample.clinicalDiagnosis.onsetAge}
                  isEditing={isEditing}
                  editValue={(editData.clinicalDiagnosis as any)?.onsetAge}
                  onEditChange={(v) => setEditData(prev => ({
                    ...prev,
                    clinicalDiagnosis: { ...prev.clinicalDiagnosis, onsetAge: v }
                  } as any))}
                />
              </div>
            </InfoCard>

            <InfoCard title="病史描述">
              <p className="text-sm text-fg-default whitespace-pre-wrap">
                {sample.clinicalDiagnosis.diseaseHistory || '暂无病史描述'}
              </p>
            </InfoCard>

            {/* HPO术语 */}
            <InfoCard title="HPO表型术语">
              <div className="space-y-3">
                {sample.clinicalDiagnosis.hpoTerms && sample.clinicalDiagnosis.hpoTerms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {sample.clinicalDiagnosis.hpoTerms.map((term) => (
                      <div
                        key={term.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md text-sm border border-blue-200"
                      >
                        <span className="font-mono text-xs text-blue-500">{term.id}</span>
                        <span>{term.name}</span>
                        {isEditing && (
                          <button
                            onClick={() => {
                              const newTerms = sample.clinicalDiagnosis.hpoTerms?.filter(t => t.id !== term.id) || [];
                              setEditData(prev => ({
                                ...prev,
                                clinicalDiagnosis: { ...prev.clinicalDiagnosis, hpoTerms: newTerms }
                              } as any));
                              setSample(prev => prev ? {
                                ...prev,
                                clinicalDiagnosis: { ...prev.clinicalDiagnosis, hpoTerms: newTerms }
                              } : null);
                            }}
                            className="ml-1 text-blue-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-fg-muted">暂无HPO术语</p>
                )}
                {isEditing && (
                  <HpoTermInput
                    onAdd={(term) => {
                      const currentTerms = sample.clinicalDiagnosis.hpoTerms || [];
                      if (!currentTerms.find(t => t.id === term.id)) {
                        const newTerms = [...currentTerms, term];
                        setEditData(prev => ({
                          ...prev,
                          clinicalDiagnosis: { ...prev.clinicalDiagnosis, hpoTerms: newTerms }
                        } as any));
                        setSample(prev => prev ? {
                          ...prev,
                          clinicalDiagnosis: { ...prev.clinicalDiagnosis, hpoTerms: newTerms }
                        } : null);
                      }
                    }}
                  />
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

      case 'family':
        return (
          <div className="space-y-4">
            {/* 家系关联信息 */}
            {sample.pedigreeId && sample.pedigreeId !== '-' && (
              <InfoCard title="关联家系">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <InfoItem label="家系编号" value={sample.pedigreeId} />
                    <InfoItem label="家系名称" value={sample.pedigreeName} />
                  </div>
                  <Link href={`/samples/pedigree?id=${sample.pedigreeId}`}>
                    <Button variant="secondary" size="small" leftIcon={<GitBranch className="w-4 h-4" />}>
                      查看家系图
                    </Button>
                  </Link>
                </div>
              </InfoCard>
            )}
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-medium text-fg-default">{sample.name}</h3>
            <span className={`text-sm ${genderInfo.color}`}>{genderInfo.label}</span>
            <span className="text-sm text-fg-muted">{sample.age}岁</span>
            <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="secondary" size="small" onClick={handleCancelEdit}>
                  取消
                </Button>
                <Button variant="primary" size="small" leftIcon={<Save className="w-4 h-4" />} onClick={handleSave}>
                  保存
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="small" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setIsEditing(true)}>
                编辑
              </Button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
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
