'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Download, Upload, Trash2 } from 'lucide-react';
import { NewSampleModal } from './components';
import { mockSamples } from './mock-data';
import type { Sample } from './types';
import { STATUS_CONFIG, GENDER_CONFIG } from './types';

export default function SamplesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = React.useState(false);

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

  const handleRowClick = (sample: Sample) => {
    router.push(`/samples/${sample.id}`);
  };

  const columns: Column<Sample>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <span className="text-accent-fg hover:underline cursor-pointer font-mono text-xs">{row.id.substring(0, 8)}...</span>
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
              router.push(`/samples/pedigree?id=${row.pedigreeId}`);
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

  return (
    <div className="flex h-full">
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
          <DataTable
            data={filteredSamples}
            columns={columns}
            rowKey="id"
            striped
            density="compact"
            onRowClick={handleRowClick}
            className="cursor-pointer"
          />
        </div>
      </div>

      <NewSampleModal isOpen={isNewSampleModalOpen} onClose={() => setIsNewSampleModalOpen(false)} onSubmit={(data) => console.log('新建样本:', data)} />
    </div>
  );
}
