'use client';

import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Upload, Search, FileSpreadsheet, Download, Info, X, ChevronRight, ChevronLeft, List, AlertTriangle } from 'lucide-react';
import * as React from 'react';

type Platform = 'illumina' | 'bgi';

interface SampleIndex {
  id: string;
  sampleId: string;
  sampleName: string;
  lane: string;
  index5: string;
  index7: string;
  matched: boolean;
}

interface SampleSheet {
  id: string;
  fileName: string;
  runId: string;
  platform: Platform;
  sampleCount: number;
  matchedCount: number;
  unmatchedCount: number;
  updatedAt: string;
  updatedBy: string;
  status: 'processing' | 'completed' | 'error';
  samples: SampleIndex[];
}

const mockSampleSheets: SampleSheet[] = [
  {
    id: '1',
    fileName: 'SampleSheet_Run001.csv',
    runId: 'RUN-2024120001',
    platform: 'illumina',
    sampleCount: 48,
    matchedCount: 45,
    unmatchedCount: 3,
    updatedAt: '2024-12-20 14:30',
    updatedBy: '张技师',
    status: 'completed',
    samples: [
      { id: '1-1', sampleId: 'S2024120001', sampleName: '张**', lane: '1', index5: 'ATCACG', index7: 'TTAGGC', matched: true },
      { id: '1-2', sampleId: 'S2024120002', sampleName: '李**', lane: '1', index5: 'CGATGT', index7: 'TGACCA', matched: true },
      { id: '1-3', sampleId: 'S2024120003', sampleName: '王**', lane: '1', index5: 'TTAGGC', index7: 'ACAGTG', matched: true },
      { id: '1-4', sampleId: 'S2024120004', sampleName: '赵**', lane: '1', index5: 'TGACCA', index7: 'GCCAAT', matched: false },
      { id: '1-5', sampleId: 'S2024120005', sampleName: '钱**', lane: '1', index5: 'ATCACG', index7: 'TTAGGC', matched: true }, // 与 1-1 重复
      { id: '1-6', sampleId: 'S2024120006', sampleName: '孙**', lane: '2', index5: 'GCCAAT', index7: 'ACTTGA', matched: true },
    ],
  },
  {
    id: '2',
    fileName: 'lane1_barcode.csv',
    runId: 'V350012345',
    platform: 'bgi',
    sampleCount: 96,
    matchedCount: 96,
    unmatchedCount: 0,
    updatedAt: '2024-12-25 09:15',
    updatedBy: '李技师',
    status: 'completed',
    samples: [
      { id: '2-1', sampleId: 'B2024120001', sampleName: '周**', lane: '1', index5: 'AACGTGAT', index7: 'AAACATCG', matched: true },
      { id: '2-2', sampleId: 'B2024120002', sampleName: '吴**', lane: '1', index5: 'AAACATCG', index7: 'AACGTGAT', matched: true },
      { id: '2-3', sampleId: 'B2024120003', sampleName: '郑**', lane: '1', index5: 'ATGCCTAA', index7: 'ATGCCTAA', matched: true },
    ],
  },
  {
    id: '3',
    fileName: 'SampleSheet_Run003.csv',
    runId: 'RUN-2024120003',
    platform: 'illumina',
    sampleCount: 24,
    matchedCount: 0,
    unmatchedCount: 0,
    updatedAt: '2024-12-28 10:00',
    updatedBy: '张技师',
    status: 'processing',
    samples: [],
  },
];

const platformLabels: Record<Platform, string> = {
  illumina: 'Illumina',
  bgi: 'BGI/MGI',
};

const platformColors: Record<Platform, string> = {
  illumina: 'bg-blue-100 text-blue-700',
  bgi: 'bg-green-100 text-green-700',
};

interface OpenTab {
  id: string;
  sheetId: string;
  runId: string;
  fileName: string;
}


export default function LabPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [platformFilter, setPlatformFilter] = React.useState<Platform | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [selectedPlatform, setSelectedPlatform] = React.useState<Platform>('illumina');
  const [openTabs, setOpenTabs] = React.useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

  const handleOpenTab = React.useCallback((sheet: SampleSheet) => {
    const existingTab = openTabs.find(t => t.sheetId === sheet.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }
    const newTab: OpenTab = {
      id: `tab-${Date.now()}`,
      sheetId: sheet.id,
      runId: sheet.runId,
      fileName: sheet.fileName,
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

  const filteredSheets = React.useMemo(() => {
    return mockSampleSheets.filter((s) => {
      const matchesSearch = !searchQuery ||
        s.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.runId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === 'all' || s.platform === platformFilter;
      return matchesSearch && matchesPlatform;
    });
  }, [searchQuery, platformFilter]);

  const getStatusTag = (sheet: SampleSheet) => {
    switch (sheet.status) {
      case 'processing':
        return <Tag variant="info">处理中</Tag>;
      case 'completed':
        if (sheet.unmatchedCount > 0) {
          return <Tag variant="warning">部分匹配</Tag>;
        }
        return <Tag variant="success">全部匹配</Tag>;
      case 'error':
        return <Tag variant="danger">错误</Tag>;
    }
  };

  const columns: Column<SampleSheet>[] = [
    {
      id: 'fileName',
      header: '文件名',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-fg-muted" />
          <span 
            className="text-accent-fg hover:underline cursor-pointer"
            onClick={(e) => { e.stopPropagation(); handleOpenTab(row); }}
          >
            {row.fileName}
          </span>
        </div>
      ),
      width: 220,
    },
    { id: 'runId', header: '测序批次', accessor: 'runId', width: 140 },
    {
      id: 'platform',
      header: '平台',
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${platformColors[row.platform]}`}>
          {platformLabels[row.platform]}
        </span>
      ),
      width: 100,
    },
    {
      id: 'sampleCount',
      header: '样本数',
      accessor: (row) => `${row.sampleCount} 个`,
      width: 80,
    },
    {
      id: 'matching',
      header: '匹配情况',
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-success-fg">{row.matchedCount} 匹配</span>
          {row.unmatchedCount > 0 && (
            <span className="text-warning-fg">{row.unmatchedCount} 未匹配</span>
          )}
        </div>
      ),
      width: 140,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => getStatusTag(row),
      width: 100,
    },
    { id: 'updatedAt', header: '更新时间', accessor: 'updatedAt', width: 140 },
    { id: 'updatedBy', header: '最后更新人', accessor: 'updatedBy', width: 100 },
  ];

  const activeTab = openTabs.find(t => t.id === activeTabId);
  const activeSheet = activeTab ? mockSampleSheets.find(s => s.id === activeTab.sheetId) : null;
  const hasOpenTabs = openTabs.length > 0;

  const statusDotColors: Record<SampleSheet['status'], string> = {
    processing: 'bg-accent-emphasis',
    completed: 'bg-success-emphasis',
    error: 'bg-danger-emphasis',
  };


  return (
    <div className="flex h-full">
      {hasOpenTabs ? (
        sidebarCollapsed ? (
          <div className="w-10 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col items-center py-2">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
              title="展开列表"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-2 text-xs text-fg-muted writing-mode-vertical">上机表</div>
            <div className="mt-auto mb-2 w-5 h-5 rounded-full bg-accent-emphasis text-white text-xs flex items-center justify-center">
              {openTabs.length}
            </div>
          </div>
        ) : (
          <div className="w-56 flex-shrink-0 border-r border-border-default bg-canvas-subtle flex flex-col">
            <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-fg-muted" />
                <span className="text-sm font-medium text-fg-default">上机表列表</span>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 rounded hover:bg-canvas-inset text-fg-muted hover:text-fg-default transition-colors"
                title="收起"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="p-2 border-b border-border-default">
              <Input
                placeholder="搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftElement={<Search className="w-3.5 h-3.5" />}
              />
            </div>
            <div className="flex-1 overflow-auto">
              {filteredSheets.map((sheet) => {
                const isOpen = openTabs.some(t => t.sheetId === sheet.id);
                const isActive = activeTab?.sheetId === sheet.id;
                return (
                  <div
                    key={sheet.id}
                    onClick={() => handleOpenTab(sheet)}
                    className={`px-3 py-2 cursor-pointer border-b border-border-muted transition-colors
                      ${isActive ? 'bg-accent-subtle border-l-2 border-l-accent-emphasis' : isOpen ? 'bg-canvas-inset' : 'hover:bg-canvas-inset'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusDotColors[sheet.status]}`} />
                      <span className={`text-sm ${isActive ? 'text-accent-fg font-medium' : 'text-fg-default'}`}>{sheet.runId}</span>
                    </div>
                    <div className="text-xs text-fg-muted ml-4 truncate">{sheet.fileName}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div className="flex-1">
          <div className="p-6 h-full overflow-auto">
            <h2 className="text-lg font-medium text-fg-default mb-4">上机表管理</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Illumina</span>
                  <span className="text-sm font-medium text-blue-900">Sample Sheet 格式</span>
                </div>
                <p className="text-xs text-blue-700 mb-2">支持 Illumina 测序仪标准 Sample Sheet (CSV) 格式。</p>
                <div className="text-xs text-blue-600 font-mono bg-blue-100 p-2 rounded">必需字段: Sample_ID, index, index2</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">BGI/MGI</span>
                  <span className="text-sm font-medium text-green-900">Barcode 表格式</span>
                </div>
                <p className="text-xs text-green-700 mb-2">支持 BGI/MGI 测序平台的 Barcode 配置表格式。</p>
                <div className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">必需字段: SampleID, Barcode, Lane</div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-64">
                  <Input placeholder="搜索文件名或批次号..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
                </div>
                <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')} className="h-8 px-3 py-0 text-sm border border-border-default rounded-md bg-canvas-default focus:outline-none focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis">
                  <option value="all">全部平台</option>
                  <option value="illumina">Illumina</option>
                  <option value="bgi">BGI/MGI</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>下载模板</Button>
                <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowUploadModal(true)}>上传上机表</Button>
              </div>
            </div>
            <DataTable data={filteredSheets} columns={columns} rowKey="id" density="default" striped onRowClick={handleOpenTab} />
          </div>
        </div>
      )}


      {hasOpenTabs && (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center border-b border-border-default bg-canvas-subtle overflow-x-auto flex-shrink-0">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-border-muted text-sm whitespace-nowrap transition-colors
                  ${activeTabId === tab.id ? 'bg-canvas-default text-fg-default border-b-2 border-b-accent-emphasis -mb-px' : 'text-fg-muted hover:bg-canvas-inset hover:text-fg-default'}`}
              >
                <span>{tab.runId}</span>
                <button onClick={(e) => handleCloseTab(tab.id, e)} className="p-0.5 rounded hover:bg-canvas-inset" aria-label="关闭标签">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-6">
            {activeSheet && <SampleSheetDetail sheet={activeSheet} />}
          </div>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
}

function SampleSheetDetail({ sheet }: { sheet: SampleSheet }) {
  const [sampleSearch, setSampleSearch] = React.useState('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedRunId, setEditedRunId] = React.useState(sheet.runId);
  const [editedPlatform, setEditedPlatform] = React.useState<Platform>(sheet.platform);
  const [editedSamples, setEditedSamples] = React.useState<SampleIndex[]>(sheet.samples);

  // 检测重复的 i5+i7 组合（同一 Lane 内）
  const duplicateIndexKeys = React.useMemo(() => {
    const samples = isEditing ? editedSamples : sheet.samples;
    const indexMap = new Map<string, string[]>();
    samples.forEach(sample => {
      const key = `${sample.lane}-${sample.index5}-${sample.index7}`;
      if (!indexMap.has(key)) {
        indexMap.set(key, []);
      }
      indexMap.get(key)!.push(sample.id);
    });
    const duplicates = new Set<string>();
    indexMap.forEach((ids) => {
      if (ids.length > 1) {
        ids.forEach(id => duplicates.add(id));
      }
    });
    return duplicates;
  }, [sheet.samples, editedSamples, isEditing]);

  const filteredSamples = React.useMemo(() => {
    const samples = isEditing ? editedSamples : sheet.samples;
    if (!sampleSearch) return samples;
    const query = sampleSearch.toLowerCase();
    return samples.filter(s => s.sampleId.toLowerCase().includes(query) || s.sampleName.includes(query));
  }, [sheet.samples, editedSamples, sampleSearch, isEditing]);

  const handleSave = () => {
    // TODO: 保存修改到后端
    console.log('Save:', { runId: editedRunId, platform: editedPlatform, samples: editedSamples });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedRunId(sheet.runId);
    setEditedPlatform(sheet.platform);
    setEditedSamples(sheet.samples);
    setIsEditing(false);
  };

  const handleSampleChange = (sampleId: string, field: keyof SampleIndex, value: string) => {
    setEditedSamples(prev => prev.map(s => 
      s.id === sampleId ? { ...s, [field]: value } : s
    ));
  };

  // 检查必填字段是否为空
  const getEmptyRequiredFields = (sample: SampleIndex) => {
    const empty: string[] = [];
    if (!sample.sampleId.trim()) empty.push('sampleId');
    if (!sample.index5.trim()) empty.push('index5');
    if (!sample.index7.trim()) empty.push('index7');
    return empty;
  };

  const sampleColumns: Column<SampleIndex>[] = isEditing ? [
    { 
      id: 'sampleId', 
      header: <span>样本编号 <span className="text-danger-fg">*</span></span>, 
      accessor: (row) => {
        const isEmpty = !row.sampleId.trim();
        return (
          <input
            type="text"
            value={row.sampleId}
            onChange={(e) => handleSampleChange(row.id, 'sampleId', e.target.value)}
            placeholder="必填"
            className={`w-full h-7 px-2 text-sm border rounded focus:outline-none focus:border-accent-emphasis ${
              isEmpty ? 'border-danger-emphasis bg-danger-subtle' : 'border-border-default bg-canvas-default'
            }`}
          />
        );
      },
      width: 140 
    },
    { 
      id: 'sampleName', 
      header: '样本名称', 
      accessor: (row) => (
        <input
          type="text"
          value={row.sampleName}
          onChange={(e) => handleSampleChange(row.id, 'sampleName', e.target.value)}
          placeholder="选填"
          className="w-full h-7 px-2 text-sm border border-border-default rounded bg-canvas-default focus:outline-none focus:border-accent-emphasis"
        />
      ),
      width: 100 
    },
    { 
      id: 'lane', 
      header: 'Lane', 
      accessor: (row) => (
        <input
          type="text"
          value={row.lane}
          onChange={(e) => handleSampleChange(row.id, 'lane', e.target.value)}
          placeholder="选填"
          className="w-full h-7 px-2 text-sm border border-border-default rounded bg-canvas-default focus:outline-none focus:border-accent-emphasis"
        />
      ),
      width: 80 
    },
    { 
      id: 'index5', 
      header: <span>Index 5 (i5) <span className="text-danger-fg">*</span></span>, 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        const isEmpty = !row.index5.trim();
        const hasError = isDuplicate || isEmpty;
        return (
          <input
            type="text"
            value={row.index5}
            onChange={(e) => handleSampleChange(row.id, 'index5', e.target.value.toUpperCase())}
            placeholder="必填"
            className={`w-full h-7 px-2 text-sm font-mono border rounded focus:outline-none focus:border-accent-emphasis ${
              hasError ? 'border-danger-emphasis bg-danger-subtle text-danger-fg' : 'border-border-default bg-canvas-default'
            }`}
          />
        );
      }, 
      width: 140 
    },
    { 
      id: 'index7', 
      header: <span>Index 7 (i7) <span className="text-danger-fg">*</span></span>, 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        const isEmpty = !row.index7.trim();
        const hasError = isDuplicate || isEmpty;
        return (
          <input
            type="text"
            value={row.index7}
            onChange={(e) => handleSampleChange(row.id, 'index7', e.target.value.toUpperCase())}
            placeholder="必填"
            className={`w-full h-7 px-2 text-sm font-mono border rounded focus:outline-none focus:border-accent-emphasis ${
              hasError ? 'border-danger-emphasis bg-danger-subtle text-danger-fg' : 'border-border-default bg-canvas-default'
            }`}
          />
        );
      }, 
      width: 140 
    },
    { 
      id: 'status', 
      header: '状态', 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        const emptyFields = getEmptyRequiredFields(row);
        if (emptyFields.length > 0) {
          return <Tag variant="danger">必填项为空</Tag>;
        }
        if (isDuplicate) {
          return <Tag variant="danger">Index 重复</Tag>;
        }
        return <Tag variant={row.matched ? 'success' : 'warning'}>{row.matched ? '已匹配' : '未匹配'}</Tag>;
      }, 
      width: 100 
    },
  ] : [
    { id: 'sampleId', header: '样本编号', accessor: 'sampleId', width: 140 },
    { id: 'sampleName', header: '样本名称', accessor: 'sampleName', width: 100 },
    { id: 'lane', header: 'Lane', accessor: 'lane', width: 80 },
    { 
      id: 'index5', 
      header: 'Index 5 (i5)', 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        return (
          <code className={`text-xs px-1.5 py-0.5 rounded ${isDuplicate ? 'bg-danger-subtle text-danger-fg' : 'bg-canvas-subtle'}`}>
            {row.index5}
          </code>
        );
      }, 
      width: 140 
    },
    { 
      id: 'index7', 
      header: 'Index 7 (i7)', 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        return (
          <code className={`text-xs px-1.5 py-0.5 rounded ${isDuplicate ? 'bg-danger-subtle text-danger-fg' : 'bg-canvas-subtle'}`}>
            {row.index7}
          </code>
        );
      }, 
      width: 140 
    },
    { 
      id: 'status', 
      header: '状态', 
      accessor: (row) => {
        const isDuplicate = duplicateIndexKeys.has(row.id);
        if (isDuplicate) {
          return <Tag variant="danger">Index 重复</Tag>;
        }
        return <Tag variant={row.matched ? 'success' : 'warning'}>{row.matched ? '已匹配' : '未匹配'}</Tag>;
      }, 
      width: 100 
    },
  ];

  return (
    <div>
      {/* 基本信息 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-fg-default">{sheet.fileName}</h3>
          {!isEditing ? (
            <Button variant="secondary" size="small" onClick={() => setIsEditing(true)}>
              编辑信息
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="small" onClick={handleCancel}>取消</Button>
              <Button variant="primary" size="small" onClick={handleSave}>保存</Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="p-4 bg-canvas-subtle rounded-lg border border-border space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-fg-muted mb-1">测序批次 / 芯片号</label>
                <Input 
                  value={editedRunId} 
                  onChange={(e) => setEditedRunId(e.target.value)} 
                  placeholder="输入测序批次或芯片号"
                />
              </div>
              <div>
                <label className="block text-xs text-fg-muted mb-1">测序平台</label>
                <select 
                  value={editedPlatform} 
                  onChange={(e) => setEditedPlatform(e.target.value as Platform)}
                  className="w-full h-8 px-3 text-sm border border-border-default rounded-md bg-canvas-default focus:outline-none focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis"
                >
                  <option value="illumina">Illumina</option>
                  <option value="bgi">BGI/MGI</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-fg-muted mb-1">样本数量</div>
                <div className="text-sm font-medium text-fg-default">{sheet.sampleCount} 个</div>
              </div>
              <div>
                <div className="text-xs text-fg-muted mb-1">匹配情况</div>
                <div className="text-sm font-medium">
                  <span className="text-success-fg">{sheet.matchedCount} 匹配</span>
                  {sheet.unmatchedCount > 0 && <span className="text-warning-fg ml-2">{sheet.unmatchedCount} 未匹配</span>}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-canvas-subtle rounded-lg border border-border">
            <div>
              <div className="text-xs text-fg-muted mb-1">测序批次</div>
              <div className="text-sm font-medium text-fg-default">{sheet.runId}</div>
            </div>
            <div>
              <div className="text-xs text-fg-muted mb-1">测序平台</div>
              <div className="text-sm font-medium text-fg-default">{platformLabels[sheet.platform]}</div>
            </div>
            <div>
              <div className="text-xs text-fg-muted mb-1">样本数量</div>
              <div className="text-sm font-medium text-fg-default">{sheet.sampleCount} 个</div>
            </div>
            <div>
              <div className="text-xs text-fg-muted mb-1">匹配情况</div>
              <div className="text-sm font-medium">
                <span className="text-success-fg">{sheet.matchedCount} 匹配</span>
                {sheet.unmatchedCount > 0 && <span className="text-warning-fg ml-2">{sheet.unmatchedCount} 未匹配</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 重复 Index 警告 */}
      {duplicateIndexKeys.size > 0 && (
        <div className="mb-4 p-3 bg-danger-subtle rounded-lg border border-danger-muted flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-danger-fg mt-0.5 shrink-0" />
          <div className="text-sm text-danger-fg">
            检测到 {duplicateIndexKeys.size} 个样本存在 Index 重复（同一 Lane 内 i5+i7 组合相同），请检查并修正。
          </div>
        </div>
      )}

      {/* 样本列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-medium text-fg-default">样本 Index 配置</h4>
          <div className="w-64">
            <Input placeholder="搜索样本..." value={sampleSearch} onChange={(e) => setSampleSearch(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
          </div>
        </div>
        {sheet.samples.length > 0 ? (
          <DataTable data={filteredSamples} columns={sampleColumns} rowKey="id" density="compact" striped />
        ) : (
          <div className="text-center py-12 text-fg-muted bg-canvas-subtle rounded-lg border border-border">
            {sheet.status === 'processing' ? '正在解析上机表...' : '暂无样本数据'}
          </div>
        )}
      </div>
    </div>
  );
}


function UploadModal({ selectedPlatform, onPlatformChange, onClose }: { selectedPlatform: Platform; onPlatformChange: (p: Platform) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-canvas-default rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-fg-default mb-4">上传上机表</h3>
        <div className="mb-4">
          <label className="block text-sm text-fg-muted mb-2">选择测序平台</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => onPlatformChange('illumina')} className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedPlatform === 'illumina' ? 'border-blue-500 bg-blue-50' : 'border-border hover:border-blue-300'}`}>
              <div className="font-medium text-fg-default">Illumina</div>
              <div className="text-xs text-fg-muted mt-1">NovaSeq, NextSeq, MiSeq 等</div>
            </button>
            <button type="button" onClick={() => onPlatformChange('bgi')} className={`p-3 rounded-lg border-2 text-left transition-colors ${selectedPlatform === 'bgi' ? 'border-green-500 bg-green-50' : 'border-border hover:border-green-300'}`}>
              <div className="font-medium text-fg-default">BGI/MGI</div>
              <div className="text-xs text-fg-muted mt-1">DNBSEQ-T7, G400 等</div>
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-fg-muted mb-2">上传文件</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent-muted transition-colors cursor-pointer">
            <Upload className="w-8 h-8 mx-auto text-fg-muted mb-2" />
            <p className="text-sm text-fg-default">点击或拖拽文件到此处</p>
            <p className="text-xs text-fg-muted mt-1">{selectedPlatform === 'illumina' ? '支持 .csv 格式的 Sample Sheet' : '支持 .csv 或 .txt 格式的 Barcode 表'}</p>
          </div>
        </div>
        <div className="mb-4 p-3 bg-canvas-subtle rounded-md">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-fg-muted mt-0.5" />
            <div className="text-xs text-fg-muted">
              {selectedPlatform === 'illumina' ? (
                <>
                  <p className="font-medium mb-1">Illumina Sample Sheet 格式要求：</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>包含 [Header]、[Reads]、[Data] 区块</li>
                    <li>Data 区块必须包含 Sample_ID 列</li>
                    <li>支持单端和双端 index</li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">BGI/MGI Barcode 表格式要求：</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>必须包含 SampleID、Barcode、Lane 列</li>
                    <li>支持多 Lane 配置</li>
                    <li>Barcode 支持 10bp 或 20bp 格式</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary">上传</Button>
        </div>
      </div>
    </div>
  );
}
