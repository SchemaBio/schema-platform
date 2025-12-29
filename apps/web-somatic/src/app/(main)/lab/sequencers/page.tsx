'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, DataTable, Tag } from '@schema/ui-kit';
import type { Column } from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, Server, FolderOpen } from 'lucide-react';
import * as React from 'react';

type Platform = 'illumina' | 'bgi';

interface Sequencer {
  id: string;
  name: string;
  serialNumber: string;
  platform: Platform;
  model: string;
  dataPath: string;
  status: 'online' | 'offline' | 'maintenance';
  lastSyncAt: string;
  createdAt: string;
}

const mockSequencers: Sequencer[] = [
  {
    id: '1',
    name: 'NovaSeq-01',
    serialNumber: 'NS500001',
    platform: 'illumina',
    model: 'NovaSeq 6000',
    dataPath: '/mnt/sequencer/novaseq01',
    status: 'online',
    lastSyncAt: '2024-12-29 08:30',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'NextSeq-01',
    serialNumber: 'NX200001',
    platform: 'illumina',
    model: 'NextSeq 2000',
    dataPath: '/mnt/sequencer/nextseq01',
    status: 'online',
    lastSyncAt: '2024-12-29 09:15',
    createdAt: '2024-03-20',
  },
  {
    id: '3',
    name: 'DNBSEQ-01',
    serialNumber: 'T7-001',
    platform: 'bgi',
    model: 'DNBSEQ-T7',
    dataPath: '/mnt/sequencer/dnbseq01',
    status: 'offline',
    lastSyncAt: '2024-12-28 16:00',
    createdAt: '2024-06-10',
  },
  {
    id: '4',
    name: 'MiSeq-01',
    serialNumber: 'MS100001',
    platform: 'illumina',
    model: 'MiSeq',
    dataPath: '/mnt/sequencer/miseq01',
    status: 'maintenance',
    lastSyncAt: '2024-12-25 10:00',
    createdAt: '2023-08-01',
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

const statusConfig: Record<Sequencer['status'], { label: string; variant: 'success' | 'neutral' | 'warning' }> = {
  online: { label: '在线', variant: 'success' },
  offline: { label: '离线', variant: 'neutral' },
  maintenance: { label: '维护中', variant: 'warning' },
};

export default function SequencersPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);
  const [editingSequencer, setEditingSequencer] = React.useState<Sequencer | null>(null);

  const filteredSequencers = React.useMemo(() => {
    if (!searchQuery) return mockSequencers;
    const query = searchQuery.toLowerCase();
    return mockSequencers.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.serialNumber.toLowerCase().includes(query) ||
      s.model.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleAdd = () => {
    setEditingSequencer(null);
    setShowModal(true);
  };

  const handleEdit = (sequencer: Sequencer) => {
    setEditingSequencer(sequencer);
    setShowModal(true);
  };

  const columns: Column<Sequencer>[] = [
    {
      id: 'name',
      header: '名称',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-fg-muted" />
          <span className="font-medium text-fg-default">{row.name}</span>
        </div>
      ),
      width: 150,
    },
    { id: 'serialNumber', header: '序列号', accessor: 'serialNumber', width: 120 },
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
    { id: 'model', header: '型号', accessor: 'model', width: 130 },
    {
      id: 'dataPath',
      header: '数据路径',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <FolderOpen className="w-3.5 h-3.5 text-fg-muted shrink-0" />
          <code className="text-xs bg-canvas-subtle px-1.5 py-0.5 rounded truncate max-w-[200px]" title={row.dataPath}>
            {row.dataPath}
          </code>
        </div>
      ),
      width: 250,
    },
    {
      id: 'status',
      header: '状态',
      accessor: (row) => {
        const config = statusConfig[row.status];
        return <Tag variant={config.variant}>{config.label}</Tag>;
      },
      width: 80,
    },
    { id: 'lastSyncAt', header: '最后同步', accessor: 'lastSyncAt', width: 140 },
    {
      id: 'actions',
      header: '操作',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="small" iconOnly aria-label="编辑" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => handleEdit(row)} />
          <Button variant="ghost" size="small" iconOnly aria-label="删除" leftIcon={<Trash2 className="w-4 h-4 text-danger-fg" />} />
        </div>
      ),
      width: 80,
    },
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">测序仪管理</h2>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索名称、序列号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
          添加测序仪
        </Button>
      </div>

      <DataTable
        data={filteredSequencers}
        columns={columns}
        rowKey="id"
        density="default"
        striped
      />

      {showModal && (
        <SequencerModal
          sequencer={editingSequencer}
          onClose={() => setShowModal(false)}
        />
      )}
    </PageContent>
  );
}

interface SequencerModalProps {
  sequencer: Sequencer | null;
  onClose: () => void;
}

function SequencerModal({ sequencer, onClose }: SequencerModalProps) {
  const isEditing = !!sequencer;
  const [name, setName] = React.useState(sequencer?.name || '');
  const [serialNumber, setSerialNumber] = React.useState(sequencer?.serialNumber || '');
  const [platform, setPlatform] = React.useState<Platform>(sequencer?.platform || 'illumina');
  const [model, setModel] = React.useState(sequencer?.model || '');
  const [dataPath, setDataPath] = React.useState(sequencer?.dataPath || '');
  const [status, setStatus] = React.useState<Sequencer['status']>(sequencer?.status || 'online');

  const handleSubmit = () => {
    // TODO: 保存到后端
    console.log('Save sequencer:', { name, serialNumber, platform, model, dataPath, status });
    onClose();
  };

  const modelOptions: Record<Platform, string[]> = {
    illumina: ['NovaSeq 6000', 'NovaSeq X', 'NextSeq 2000', 'NextSeq 1000', 'MiSeq'],
    bgi: ['DNBSEQ-T7', 'DNBSEQ-G400', 'DNBSEQ-G50', 'MGISEQ-2000'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-fg-default mb-4">
          {isEditing ? '编辑测序仪' : '添加测序仪'}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-fg-muted mb-1">
              名称 <span className="text-danger-fg">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：NovaSeq-01"
            />
          </div>

          <div>
            <label className="block text-sm text-fg-muted mb-1">
              序列号 <span className="text-danger-fg">*</span>
            </label>
            <Input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="设备序列号"
            />
          </div>

          <div>
            <label className="block text-sm text-fg-muted mb-1">测序平台</label>
            <select
              value={platform}
              onChange={(e) => {
                setPlatform(e.target.value as Platform);
                setModel(''); // 切换平台时清空型号
              }}
              className="w-full h-8 px-3 text-sm border border-border-default rounded-md bg-canvas-default focus:outline-none focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis"
            >
              <option value="illumina">Illumina</option>
              <option value="bgi">BGI/MGI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-fg-muted mb-1">型号</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-8 px-3 text-sm border border-border-default rounded-md bg-canvas-default focus:outline-none focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis"
            >
              <option value="">选择型号</option>
              {modelOptions[platform].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-fg-muted mb-1">
              数据挂载路径 <span className="text-danger-fg">*</span>
            </label>
            <Input
              value={dataPath}
              onChange={(e) => setDataPath(e.target.value)}
              placeholder="/mnt/sequencer/..."
              leftElement={<FolderOpen className="w-4 h-4" />}
            />
            <p className="text-xs text-fg-muted mt-1">测序仪下机数据的本地挂载路径</p>
          </div>

          <div>
            <label className="block text-sm text-fg-muted mb-1">状态</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Sequencer['status'])}
              className="w-full h-8 px-3 text-sm border border-border-default rounded-md bg-canvas-default focus:outline-none focus:border-accent-emphasis focus:ring-1 focus:ring-accent-emphasis"
            >
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="maintenance">维护中</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!name.trim() || !serialNumber.trim() || !dataPath.trim()}
          >
            {isEditing ? '保存' : '添加'}
          </Button>
        </div>
      </div>
    </div>
  );
}
