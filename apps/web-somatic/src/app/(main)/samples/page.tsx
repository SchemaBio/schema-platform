'use client';

import * as React from 'react';
import { Button, Input, DataTable, Tooltip } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Search, Plus, Download, Upload, Trash2, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { NewSampleModal, EditSampleModal } from './components';
import { mockSamples } from './mock-data';
import type { Sample } from './types';
import { GENDER_CONFIG, TUMOR_TYPE_ICONS } from './types';
import type { NewSampleFormData, EditSampleFormData } from './components';

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

// 肿瘤类型单元格组件
function TumorTypeCell({ tumorType }: { tumorType: string }) {
  const icon = TUMOR_TYPE_ICONS[tumorType] || '🔘';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base">{icon}</span>
      <span className="text-fg-default">{tumorType}</span>
    </div>
  );
}

// 匹配状态单元格组件
function MatchedCell({ sample }: { sample: Sample }) {
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
}

export default function SamplesPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = React.useState(false);
  const [editingSample, setEditingSample] = React.useState<Sample | null>(null);
  const [samples, setSamples] = React.useState<Sample[]>(mockSamples);

  const handleDownloadTemplate = () => {
    const templateContent = `样本编号,内部编号,批次,性别,年龄,样本类型,核酸类型,肿瘤类型,临床分期,取样方式
a1b2c3d4-e5f6-7890-abcd-ef1234567890,INT-001,BATCH-2024-001,男,58,FFPE,DNA,肺癌,III,穿刺活检`;
    const blob = new Blob(['\ufeff' + templateContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '肿瘤样本导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredSamples = React.useMemo(() => {
    if (!searchQuery) return samples;
    const query = searchQuery.toLowerCase();
    return samples.filter(
      (s) => s.id.toLowerCase().includes(query) || s.internalId.toLowerCase().includes(query) || s.tumorType.toLowerCase().includes(query)
    );
  }, [searchQuery, samples]);

  const handleNewSample = (data: NewSampleFormData) => {
    console.log('新建样本:', data);
    setIsNewSampleModalOpen(false);
  };

  const handleEditSample = (id: string, data: EditSampleFormData) => {
    setSamples(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        internalId: data.internalId,
        batch: data.batch,
        gender: data.gender,
        age: data.age ? parseInt(data.age) : undefined,
        birthDate: data.birthDate,
        sampleType: data.sampleType,
        nucleicAcidType: data.nucleicAcidType,
        tumorType: data.tumorType,
        pairedSampleId: data.pairedSampleId || undefined,
        remark: data.remark,
      };
    }));
    console.log('编辑样本:', id, data);
  };

  const handleDeleteSample = (id: string) => {
    setSamples(prev => prev.filter(s => s.id !== id));
    console.log('删除样本:', id);
  };

  const columns: Column<Sample>[] = [
    {
      id: 'sample',
      header: '样本编号',
      accessor: (row) => (
        <div>
          <IdCell id={row.id} />
          {row.pairedSampleId && (
            <div className="text-xs text-fg-muted mt-0.5">配对: {row.pairedSampleId.substring(0, 8)}</div>
          )}
        </div>
      ),
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
      id: 'age',
      header: '年龄',
      accessor: (row) => row.age !== undefined ? `${row.age}岁` : '-',
      width: 60,
      align: 'center',
    },
    {
      id: 'sampleType',
      header: '样本类型',
      accessor: 'sampleType',
      width: 80,
      align: 'center',
    },
    {
      id: 'nucleicAcidType',
      header: '核酸类型',
      accessor: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${row.nucleicAcidType === 'DNA' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
          {row.nucleicAcidType}
        </span>
      ),
      width: 80,
      align: 'center',
    },
    {
      id: 'tumorType',
      header: '肿瘤类型',
      accessor: (row) => <TumorTypeCell tumorType={row.tumorType} />,
      width: 110,
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
        <span className={row.remark ? 'text-fg-default truncate block max-w-[80px]' : 'text-fg-muted'}>
          {row.remark || '-'}
        </span>
      ),
      width: 80,
    },
    {
      id: 'createdAt',
      header: '创建时间',
      accessor: 'createdAt',
      width: 100,
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
      width: 60,
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

      <NewSampleModal isOpen={isNewSampleModalOpen} onClose={() => setIsNewSampleModalOpen(false)} onSubmit={handleNewSample} />

      <EditSampleModal
        isOpen={editingSample !== null}
        onClose={() => setEditingSample(null)}
        onSubmit={handleEditSample}
        sample={editingSample}
      />
    </div>
  );
}