'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Download, Upload, Eye, ChevronRight, ChevronLeft, List, X, Trash2 } from 'lucide-react';
import { SampleDetailPanel, NewSampleModal } from './components';
import { mockSamples } from './mock-data';
import type { Sample, OpenTab } from './types';
import { STATUS_CONFIG, GENDER_CONFIG } from './types';

const statusDotColors: Record<Sample['status'], string> = {
  pending: 'bg-neutral-emphasis',
  matched: 'bg-accent-emphasis',
  analyzing: 'bg-attention-emphasis',
  completed: 'bg-success-emphasis',
};

export default function SamplesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = React.useState(false);

  const handleOpenTab = React.useCallback((sample: Sample) => {
    const existingTab = openTabs.find(t => t.sampleId === sample.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      sampleId: sample.id,
      name: `${sample.name} (${sample.id})`,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, [openTabs]);

  const handleCloseTab = React.useCallback((tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId && newTabs.length > 0) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTabId(null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const handleDownloadTemplate = () => {
    const templateContent = `样本编号,姓名,性别,出生日期,样本类型,家系编号,送检医院,送检科室,送检医生,主要诊断,临床症状
S001,张三,男,1990-01-01,全血,FAM001,北京协和医院,心内科,王医生,遗传性心肌病,心悸;胸闷`;
    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '样本导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSamples = React.useMemo(() => {
    if (!searchQuery) return mockSamples;
    const query = searchQuery.toLowerCase();
    return mockSamples.filter(
      (s) => s.id.toLowerCase().includes(query) || s.name.includes(query) || s.pedigreeId.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const columns: Column<Sample>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }}>
          <span className="text-accent-fg hover:underline cursor-pointer">{row.id}</span>
        </div>
      ),
      width: 130,
    },
    {
      id: 'internalId',
      header: '内部编号',
      accessor: 'internalId',
      width: 100,
    },
    {
      id: 'name',
      header: '姓名',
      accessor: (row) => (
        <div>
          <span className="text-fg-default">{row.name}</span>
          <div className="text-xs text-fg-muted">
            <span className={GENDER_CONFIG[row.gender].color}>{GENDER_CONFIG[row.gender].label}</span>
            <span className="ml-1">{row.age}岁</span>
          </div>
        </div>
      ),
      width: 100,
    },
    { id: 'sampleType', header: '样本类型', accessor: 'sampleType', width: 90 },
    { id: 'hospital', header: '送检单位', accessor: 'hospital', width: 160 },
    { id: 'testProject', header: '送检项目', accessor: 'testProject', width: 140 },
    {
      id: 'pedigree',
      header: '家系',
      accessor: (row) => (
        row.pedigreeId !== '-' ? (
          <div
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/samples/pedigree?id=${row.pedigreeId}`;
            }}
          >
            <div className="text-accent-fg hover:underline">{row.pedigreeId}</div>
            {row.pedigreeName !== '-' && <div className="text-xs text-fg-muted">{row.pedigreeName}</div>}
          </div>
        ) : (
          <div className="text-fg-muted">-</div>
        )
      ),
      width: 120,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = STATUS_CONFIG[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 90,
    },
    { id: 'createdAt', header: '创建时间', accessor: 'createdAt', width: 110 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => console.log('删除', row.id)}
            aria-label="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 60,
    },
  ];

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const hasOpenTabs = openTabs.length > 0;

  return (
    <div className="flex h-full">
      {hasOpenTabs ? (
        sidebarCollapsed ? (
          <div className="w-10 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col items-center py-2">
            <button onClick={() => setSidebarCollapsed(false)} className="p-2 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors" title="展开样本列表">
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-2 text-xs text-fg-muted writing-mode-vertical">样本</div>
            <div className="mt-auto mb-2 w-5 h-5 rounded-full bg-accent-emphasis text-white text-xs flex items-center justify-center">{openTabs.length}</div>
          </div>
        ) : (
          <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default">样本列表</span>
              </div>
              <button onClick={() => setSidebarCollapsed(true)} className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors" title="收起">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 border-b border-border-default">
              <Input placeholder="搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-3.5 h-3.5" />} className="text-xs" />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredSamples.map((sample) => {
                const isOpen = openTabs.some(t => t.sampleId === sample.id);
                const isActive = activeTab?.sampleId === sample.id;
                return (
                  <div key={sample.id} onClick={() => handleOpenTab(sample)} className={`px-3 py-2 cursor-pointer border-b border-border-muted transition-colors ${isActive ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis' : isOpen ? 'bg-canvas-inset' : 'hover:bg-canvas-inset'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDotColors[sample.status]}`} />
                      <span className={`text-sm ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>{sample.id}</span>
                    </div>
                    <div className="text-xs text-fg-muted ml-4 truncate">{sample.name} · {GENDER_CONFIG[sample.gender].label} · {sample.age}岁</div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">样本管理</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="w-64">
                <Input placeholder="搜索样本编号、姓名、家系..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={handleDownloadTemplate}>下载模板</Button>
                <Button variant="secondary" leftIcon={<Upload className="w-4 h-4" />}>批量导入</Button>
                <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsNewSampleModalOpen(true)}>新建样本</Button>
              </div>
            </div>
            <DataTable data={filteredSamples} columns={columns} rowKey="id" striped density="compact" />
          </div>
        </div>
      )}

      {hasOpenTabs && (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center border-b border-border-default bg-canvas-subtle overflow-x-auto flex-shrink-0">
            {openTabs.map((tab) => (
              <div key={tab.id} onClick={() => setActiveTabId(tab.id)} className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-border-muted text-sm whitespace-nowrap transition-colors ${activeTabId === tab.id ? 'bg-canvas-default text-fg-default border-b-2 border-b-accent-emphasis -mb-px' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}>
                <span>{tab.name}</span>
                <button onClick={(e) => handleCloseTab(tab.id, e)} className="p-0.5 rounded hover:bg-canvas-inset" aria-label="关闭标签">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {activeTab && <SampleDetailPanel key={activeTab.sampleId} sampleId={activeTab.sampleId} />}
          </div>
        </div>
      )}

      <NewSampleModal isOpen={isNewSampleModalOpen} onClose={() => setIsNewSampleModalOpen(false)} onSubmit={(data) => console.log('新建样本:', data)} />
    </div>
  );
}
