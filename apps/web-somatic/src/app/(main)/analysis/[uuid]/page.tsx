'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { getTaskDetail, getQCResult, getSampleInfo } from './mock-data';
import { useTabState } from './hooks/useTabState';
import type { AnalysisTaskDetail, QCResult, SampleInfo, TabType, TabConfig } from './types';
import {
  TaskHeader,
  ResultTabs,
  SampleInfoTab,
  QCResultTab,
  SNVIndelTab,
  HotspotTab,
  ChemotherapyTab,
  GermlineTab,
  CNVGeneTab,
  CNVExonTab,
  CNVChromTab,
  FusionTab,
  NeoantigenTab,
  BiomarkersTab,
  ReportTab,
} from './components';
import { getTabConfigsByPipeline } from './types';

export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const uuid = params.uuid as string;
  const [task, setTask] = React.useState<AnalysisTaskDetail | null>(null);
  const [qcResult, setQcResult] = React.useState<QCResult | null>(null);
  const [sampleInfo, setSampleInfo] = React.useState<SampleInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [notFound, setNotFound] = React.useState(false);

  // 使用标签页状态管理hook
  const { activeTab, setActiveTab, getFilterState, setFilterState } = useTabState(uuid);

  // 根据任务类型获取对应的标签页配置
  const tabConfigs = React.useMemo(() => {
    return task ? getTabConfigsByPipeline(task.pipeline) : [];
  }, [task?.pipeline]);

  // 如果当前激活的标签页不在新的配置中，自动切换到第一个
  React.useEffect(() => {
    if (tabConfigs.length > 0 && !tabConfigs.some(t => t.id === activeTab)) {
      setActiveTab(tabConfigs[0].id);
    }
  }, [tabConfigs, activeTab, setActiveTab]);

  // 加载任务数据
  React.useEffect(() => {
    async function loadTask() {
      setLoading(true);
      const [taskData, qcData, sampleData] = await Promise.all([
        getTaskDetail(uuid),
        getQCResult(uuid),
        getSampleInfo(uuid)
      ]);
      if (!taskData) {
        setNotFound(true);
      } else {
        setTask(taskData);
        setQcResult(qcData);
        setSampleInfo(sampleData);
      }
      setLoading(false);
    }
    loadTask();
  }, [uuid]);

  // 返回任务列表
  const handleBack = React.useCallback(() => {
    router.push('/analysis');
  }, [router]);

  // 404页面
  if (notFound) {
    return (
      <PageContent>
        <div className="flex flex-col items-center justify-center py-16">
          <h2 className="text-2xl font-semibold text-fg-default mb-2">404</h2>
          <p className="text-fg-muted mb-4">未找到该分析任务</p>
          <button
            onClick={handleBack}
            className="text-accent-fg hover:underline"
          >
            返回任务列表
          </button>
        </div>
      </PageContent>
    );
  }

  // 加载中
  if (loading) {
    return (
      <PageContent>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-emphasis" />
        </div>
      </PageContent>
    );
  }

  if (!task) {
    return null;
  }

  // 渲染当前标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'sample-info':
        return <SampleInfoTab taskId={uuid} />;
      case 'qc':
        return <QCResultTab taskId={uuid} />;
      case 'snv-indel':
        return (
          <SNVIndelTab
            taskId={uuid}
            filterState={getFilterState('snv-indel')}
            onFilterChange={(state) => setFilterState('snv-indel', state)}
          />
        );
      case 'hotspot':
        return (
          <HotspotTab
            taskId={uuid}
            filterState={getFilterState('hotspot')}
            onFilterChange={(state) => setFilterState('hotspot', state)}
          />
        );
      case 'chemotherapy':
        return (
          <ChemotherapyTab
            taskId={uuid}
            filterState={getFilterState('chemotherapy')}
            onFilterChange={(state) => setFilterState('chemotherapy', state)}
          />
        );
      case 'germline':
        return (
          <GermlineTab
            taskId={uuid}
            filterState={getFilterState('germline')}
            onFilterChange={(state) => setFilterState('germline', state)}
          />
        );
      case 'cnv-gene':
        return (
          <CNVGeneTab
            taskId={uuid}
            filterState={getFilterState('cnv-gene')}
            onFilterChange={(state) => setFilterState('cnv-gene', state)}
          />
        );
      case 'cnv-exon':
        return (
          <CNVExonTab
            taskId={uuid}
            filterState={getFilterState('cnv-exon')}
            onFilterChange={(state) => setFilterState('cnv-exon', state)}
          />
        );
      case 'cnv-chrom':
        return (
          <CNVChromTab
            taskId={uuid}
            filterState={getFilterState('cnv-chrom')}
            onFilterChange={(state) => setFilterState('cnv-chrom', state)}
            gender={sampleInfo?.gender || qcResult?.predictedGender || 'Unknown'}
          />
        );
      case 'fusion':
        return (
          <FusionTab
            taskId={uuid}
            filterState={getFilterState('fusion')}
            onFilterChange={(state) => setFilterState('fusion', state)}
          />
        );
      case 'neoantigen':
        return (
          <NeoantigenTab
            taskId={uuid}
            filterState={getFilterState('neoantigen')}
            onFilterChange={(state) => setFilterState('neoantigen', state)}
          />
        );
      case 'biomarkers':
        return <BiomarkersTab taskId={uuid} />;
      case 'report':
        return <ReportTab taskId={uuid} />;
      default:
        return null;
    }
  };

  return (
    <PageContent>
      {/* 任务信息头部 */}
      <TaskHeader task={task} onBack={handleBack} />

      {/* 标签面板和内容 */}
      <ResultTabs activeTab={activeTab} onTabChange={setActiveTab} tabConfigs={tabConfigs}>
        {renderTabContent()}
      </ResultTabs>
    </PageContent>
  );
}
