'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { Button, Tag } from '@schema/ui-kit';
import { ArrowLeft, Database, User, FileText, Activity, Users, RotateCcw } from 'lucide-react';
import { getSampleDetail } from '../mock-data';
import type { SampleDetail } from '../types';
import { STATUS_CONFIG, GENDER_CONFIG } from '../types';
import { MatchingTab } from './components/MatchingTab';
import { SampleInfoTab } from './components/SampleInfoTab';

type TabType = 'info' | 'matching' | 'clinical' | 'family' | 'analysis';

const TAB_CONFIGS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'info', label: '基本信息', icon: <User className="w-4 h-4" /> },
  { id: 'matching', label: '数据匹配', icon: <Database className="w-4 h-4" /> },
  { id: 'clinical', label: '临床诊断', icon: <FileText className="w-4 h-4" /> },
  { id: 'family', label: '家族史', icon: <Users className="w-4 h-4" /> },
  { id: 'analysis', label: '分析任务', icon: <Activity className="w-4 h-4" /> },
];

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();

  const uuid = params.uuid as string;
  const [sample, setSample] = React.useState<SampleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>('info');

  React.useEffect(() => {
    async function loadSample() {
      setLoading(true);
      const data = await getSampleDetail(uuid);
      if (!data) {
        setNotFound(true);
      } else {
        setSample(data);
      }
      setLoading(false);
    }
    loadSample();
  }, [uuid]);

  const handleBack = React.useCallback(() => {
    router.push('/samples');
  }, [router]);

  const handleRedo = React.useCallback(() => {
    // TODO: Implement sample redo functionality
    console.log('Redo sample:', uuid);
  }, [uuid]);

  if (notFound) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">404</h2>
          <p className="text-fg-muted mb-4">未找到该样本</p>
          <button
            onClick={handleBack}
            className="text-accent-fg hover:underline"
          >
            返回样本列表
          </button>
        </div>
      </PageContent>
    );
  }

  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
        </div>
      </PageContent>
    );
  }

  if (!sample) {
    return null;
  }

  const statusInfo = STATUS_CONFIG[sample.status];
  const genderInfo = GENDER_CONFIG[sample.gender];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <SampleInfoTab sample={sample} />;
      case 'matching':
        return <MatchingTab sampleId={uuid} />;
      case 'clinical':
        return (
          <div className="bg-canvas-subtle rounded-lg p-4">
            <h4 className="text-sm font-medium text-fg-default mb-3">临床诊断</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-fg-muted">主要诊断</span>
                <p className="text-sm text-fg-default">{sample.clinicalDiagnosis?.mainDiagnosis || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">临床症状</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sample.clinicalDiagnosis?.symptoms?.map((s: string, i: number) => (
                    <Tag key={i} variant="neutral">{s}</Tag>
                  )) || <span className="text-sm text-fg-muted">-</span>}
                </div>
              </div>
            </div>
          </div>
        );
      case 'family':
        return (
          <div className="bg-canvas-subtle rounded-lg p-4">
            <h4 className="text-sm font-medium text-fg-default mb-3">家族史</h4>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-fg-muted">家系编号</span>
                <p className="text-sm text-fg-default">{sample.pedigreeId || '-'}</p>
              </div>
              <div>
                <span className="text-xs text-fg-muted">家系名称</span>
                <p className="text-sm text-fg-default">{sample.pedigreeName || '-'}</p>
              </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="bg-canvas-subtle rounded-lg p-4">
            <h4 className="text-sm font-medium text-fg-default mb-3">关联分析任务</h4>
            {sample.analysisTasks?.length > 0 ? (
              <div className="space-y-2">
                {sample.analysisTasks.map((task: { id: string; name: string; status: string; createdAt: string }) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-canvas-default rounded hover:bg-canvas-inset transition-colors cursor-pointer"
                    onClick={() => router.push(`/tasks/${task.id}`)}
                  >
                    <div>
                      <span className="text-sm font-medium text-fg-default">{task.name}</span>
                      <span className="text-xs text-fg-muted ml-2">{task.createdAt}</span>
                    </div>
                    <Tag variant={task.status === 'completed' ? 'success' : task.status === 'running' ? 'info' : 'neutral'}>
                      {task.status === 'completed' ? '已完成' : task.status === 'running' ? '运行中' : task.status}
                    </Tag>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-fg-muted">暂无关联的分析任务</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <PageContent>
      {/* 样本信息头部 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="small" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={handleBack}>
            返回
          </Button>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-border-default">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-fg-default">{sample.name}</h2>
            <span className={`text-sm ${genderInfo.color}`}>{genderInfo.label}</span>
            <span className="text-sm text-fg-muted">{sample.age}岁</span>
            <Tag variant={statusInfo.variant}>{statusInfo.label}</Tag>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              onClick={handleRedo}
            >
              重做样本
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-fg-muted mt-2">
          <span>样本编号: <span className="font-mono">{uuid}</span></span>
          <span>样本类型: {sample.sampleType}</span>
          <span>创建时间: {sample.createdAt}</span>
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
                  flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
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
    </PageContent>
  );
}