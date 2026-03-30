'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tooltip } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Download, Upload, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { NewSampleModal, EditSampleModal } from './components';
import { mockSamples } from './mock-data';
import type { Sample } from './types';
import { GENDER_CONFIG } from './types';
import type { EditSampleFormData } from './components';

// 简化的ID显示组件（点击复制，无复制按钮）
function IdCell({ id }: { id: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip content={id} placement="top" variant="default">
      <span
        className={`font-mono text-xs cursor-pointer ${copied ? 'text-green-500' : 'text-accent-fg hover:underline'}`}
        onClick={handleClick}
      >
        {id.substring(0, 8)}
      </span>
    </Tooltip>
  );
}

export default function SamplesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = React.useState(false);
  const [editingSample, setEditingSample] = React.useState<Sample | null>(null);
  const [samples, setSamples] = React.useState<Sample[]>(mockSamples);

  const handleDownloadTemplate = () => {
    const templateContent = `样本编号,内部编号,性别,样本类型,批次,临床诊断
S001,INT-001,男,全血,BATCH-2024-001,遗传性心肌病待查`;
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
    if (!searchQuery) return samples;
    const query = searchQuery.toLowerCase();
    return samples.filter(
      (s) => s.id.toLowerCase().includes(query) || s.internalId.toLowerCase().includes(query)
    );
  }, [searchQuery, samples]);

  const handleEditSample = (id: string, data: EditSampleFormData) => {
    setSamples(prev => prev.map(s => {
      if (s.id !== id) return s;

      // 处理匹配数据
      const matchedPair = (data.r1Path && data.r2Path)
        ? { r1Path: data.r1Path, r2Path: data.r2Path }
        : null;

      return {
        ...s,
        internalId: data.internalId,
        gender: data.gender,
        sampleType: data.sampleType,
        batch: data.batch,
        clinicalDiagnosis: data.clinicalDiagnosis,
        hpoTerms: data.hpoTerms,
        matchedPair,
        remark: data.remark,
      };
    }));
    console.log('编辑样本:', id, data);
  };

  const handleDeleteSample = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
    console.log('删除样本:', id);
  };

  // 匹配状态单元格组件
  const MatchedCell = ({ sample }: { sample: Sample }) => {
    if (sample.matchedPair) {
      return (
        <Tooltip
          content={
            <div className="text-xs space-y-1">
              <div><span className="text-gray-400">R1:</span> {sample.matchedPair.r1Path}</div>
              <div><span className="text-gray-400">R2:</span> {sample.matchedPair.r2Path}</div>
            </div>
          }
        >
          <span className="inline-flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </span>
        </Tooltip>
      );
    }
    return (
      <Tooltip
        content={
          <div className="text-xs text-gray-400">
            暂无匹配数据
          </div>
        }
      >
        <span className="inline-flex items-center justify-center">
          <XCircle className="w-5 h-5 text-gray-300" />
        </span>
      </Tooltip>
    );
  };

  // HPO单元格组件
  const HpoCell = ({ hpoTerms }: { hpoTerms: { id: string; name: string }[] }) => {
    if (!hpoTerms || hpoTerms.length === 0) {
      return <span className="text-fg-muted">-</span>;
    }
    return (
      <Tooltip
        content={
          <div className="text-xs space-y-1">
            {hpoTerms.map(term => (
              <div key={term.id}>
                <span className="text-blue-400 font-mono">{term.id}</span>
                <span className="text-gray-300 ml-1">{term.name}</span>
              </div>
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-x-1 gap-y-0.5 text-xs">
          {hpoTerms.map(term => (
            <span key={term.id} className="inline-flex items-center justify-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 truncate">
              {term.id}
            </span>
          ))}
        </div>
      </Tooltip>
    );
  };

  const columns: Column<Sample>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => <IdCell id={row.id} />,
      width: 120,
    },
    {
      id: 'internalId',
      header: '内部编号',
      accessor: 'internalId',
      width: 90,
    },
    {
      id: 'batch',
      header: '批次',
      accessor: 'batch',
      width: 120,
    },
    {
      id: 'gender',
      header: '性别',
      accessor: (row) => {
        const genderInfo = GENDER_CONFIG[row.gender];
        return <span className={genderInfo.color}>{genderInfo.label}</span>;
      },
      width: 50,
      align: 'center',
    },
    {
      id: 'sampleType',
      header: '样本类型',
      accessor: 'sampleType',
      width: 70,
      align: 'center',
    },
    {
      id: 'clinicalDiagnosis',
      header: '临床诊断',
      accessor: 'clinicalDiagnosis',
      width: 160,
    },
    {
      id: 'hpoTerms',
      header: 'HPO',
      accessor: (row) => <HpoCell hpoTerms={row.hpoTerms} />,
      width: 160,
      align: 'center',
    },
    {
      id: 'matchedPair',
      header: '数据匹配',
      accessor: (row) => <MatchedCell sample={row} />,
      width: 80,
      align: 'center',
    },
    {
      id: 'remark',
      header: '备注',
      accessor: (row) => (
        <span className={row.remark ? 'text-fg-default truncate block max-w-[100px]' : 'text-fg-muted'}>
          {row.remark || '-'}
        </span>
      ),
      width: 100,
    },
    {
      id: 'createdAt',
      header: '创建时间',
      accessor: 'createdAt',
      width: 150,
    },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            className="p-1.5 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => setEditingSample(row)}
            aria-label="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            onClick={() => handleDeleteSample(row.id)}
            aria-label="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: 70,
      align: 'center',
    },
  ];

  return (
    <div className="flex h-full">
      <div className="flex-1">
        <div className="p-6 h-full overflow-auto">
          <h2 className="text-lg font-medium text-fg-default mb-4">样本管理</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="w-64">
              <Input placeholder="搜索样本编号、内部编号..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftElement={<Search className="w-4 h-4" />} />
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
          />
        </div>
      </div>

      <NewSampleModal isOpen={isNewSampleModalOpen} onClose={() => setIsNewSampleModalOpen(false)} onSubmit={(data) => console.log('新建样本:', data)} />

      <EditSampleModal
        isOpen={editingSample !== null}
        onClose={() => setEditingSample(null)}
        onSubmit={handleEditSample}
        sample={editingSample}
      />
    </div>
  );
}