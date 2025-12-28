'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Upload, Search, FileSpreadsheet, Download, Info } from 'lucide-react';
import * as React from 'react';

type Platform = 'illumina' | 'bgi';

interface SampleSheet {
  id: string;
  fileName: string;
  runId: string;
  platform: Platform;
  sampleCount: number;
  matchedCount: number;
  unmatchedCount: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'processing' | 'completed' | 'error';
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
    uploadedAt: '2024-12-20 14:30',
    uploadedBy: '张技师',
    status: 'completed',
  },
  {
    id: '2',
    fileName: 'lane1_barcode.csv',
    runId: 'V350012345',
    platform: 'bgi',
    sampleCount: 96,
    matchedCount: 96,
    unmatchedCount: 0,
    uploadedAt: '2024-12-25 09:15',
    uploadedBy: '李技师',
    status: 'completed',
  },
  {
    id: '3',
    fileName: 'SampleSheet_Run003.csv',
    runId: 'RUN-2024120003',
    platform: 'illumina',
    sampleCount: 24,
    matchedCount: 0,
    unmatchedCount: 0,
    uploadedAt: '2024-12-28 10:00',
    uploadedBy: '张技师',
    status: 'processing',
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

export default function SampleSheetPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [platformFilter, setPlatformFilter] = React.useState<Platform | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [selectedPlatform, setSelectedPlatform] = React.useState<Platform>('illumina');

  const filteredSheets = React.useMemo(() => {
    return mockSampleSheets.filter((s) => {
      const matchesSearch =
        !searchQuery ||
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
          <span>{row.fileName}</span>
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
    { id: 'uploadedAt', header: '上传时间', accessor: 'uploadedAt', width: 140 },
    { id: 'uploadedBy', header: '上传者', accessor: 'uploadedBy', width: 80 },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">上机表管理</h2>

      {/* 平台说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
              Illumina
            </span>
            <span className="text-sm font-medium text-blue-900">Sample Sheet 格式</span>
          </div>
          <p className="text-xs text-blue-700 mb-2">
            支持 Illumina 测序仪标准 Sample Sheet (CSV) 格式，包含 [Header]、[Reads]、[Data] 等区块。
          </p>
          <div className="text-xs text-blue-600 font-mono bg-blue-100 p-2 rounded">
            必需字段: Sample_ID, Sample_Name, index, index2
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
              BGI/MGI
            </span>
            <span className="text-sm font-medium text-green-900">Barcode 表格式</span>
          </div>
          <p className="text-xs text-green-700 mb-2">
            支持 BGI/MGI 测序平台的 Barcode 配置表格式，适用于 DNBSEQ 系列测序仪。
          </p>
          <div className="text-xs text-green-600 font-mono bg-green-100 p-2 rounded">
            必需字段: SampleID, Barcode, Lane
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-64">
            <Input
              placeholder="搜索文件名或批次号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftElement={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as Platform | 'all')}
            className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
          >
            <option value="all">全部平台</option>
            <option value="illumina">Illumina</option>
            <option value="bgi">BGI/MGI</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => {}}
          >
            下载模板
          </Button>
          <Button
            variant="primary"
            leftIcon={<Upload className="w-4 h-4" />}
            onClick={() => setShowUploadModal(true)}
          >
            上传上机表
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredSheets}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      {/* 上传弹窗 */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-canvas-default rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium text-fg-default mb-4">上传上机表</h3>
            
            {/* 平台选择 */}
            <div className="mb-4">
              <label className="block text-sm text-fg-muted mb-2">选择测序平台</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('illumina')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedPlatform === 'illumina'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  <div className="font-medium text-fg-default">Illumina</div>
                  <div className="text-xs text-fg-muted mt-1">NovaSeq, NextSeq, MiSeq 等</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('bgi')}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    selectedPlatform === 'bgi'
                      ? 'border-green-500 bg-green-50'
                      : 'border-border hover:border-green-300'
                  }`}
                >
                  <div className="font-medium text-fg-default">BGI/MGI</div>
                  <div className="text-xs text-fg-muted mt-1">DNBSEQ-T7, G400 等</div>
                </button>
              </div>
            </div>

            {/* 文件上传区域 */}
            <div className="mb-4">
              <label className="block text-sm text-fg-muted mb-2">上传文件</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent-muted transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-fg-muted mb-2" />
                <p className="text-sm text-fg-default">点击或拖拽文件到此处</p>
                <p className="text-xs text-fg-muted mt-1">
                  {selectedPlatform === 'illumina'
                    ? '支持 .csv 格式的 Sample Sheet'
                    : '支持 .csv 或 .txt 格式的 Barcode 表'}
                </p>
              </div>
            </div>

            {/* 格式说明 */}
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

            {/* 操作按钮 */}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                取消
              </Button>
              <Button variant="primary">
                上传
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContent>
  );
}
