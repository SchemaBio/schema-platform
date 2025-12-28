'use client';

import { PageContent } from '@/components/layout';
import { Button, Tag } from '@schema/ui-kit';
import { RefreshCw, Download, ExternalLink } from 'lucide-react';
import * as React from 'react';

interface DatabaseInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  lastUpdated: string;
  size: string;
  status: 'current' | 'outdated' | 'updating';
  source: string;
}

const mockDatabases: DatabaseInfo[] = [
  {
    id: '1',
    name: 'gnomAD',
    version: 'v4.0',
    description: '人群等位基因频率数据库',
    lastUpdated: '2024-11-01',
    size: '45.2 GB',
    status: 'current',
    source: 'https://gnomad.broadinstitute.org',
  },
  {
    id: '2',
    name: 'ClinVar',
    version: '2024-12',
    description: '临床变异数据库',
    lastUpdated: '2024-12-15',
    size: '2.8 GB',
    status: 'current',
    source: 'https://www.ncbi.nlm.nih.gov/clinvar',
  },
  {
    id: '3',
    name: 'HGMD',
    version: '2024.3',
    description: '人类基因突变数据库（专业版）',
    lastUpdated: '2024-09-01',
    size: '1.5 GB',
    status: 'outdated',
    source: 'https://www.hgmd.cf.ac.uk',
  },
  {
    id: '4',
    name: 'OMIM',
    version: '2024-12',
    description: '在线人类孟德尔遗传数据库',
    lastUpdated: '2024-12-20',
    size: '856 MB',
    status: 'current',
    source: 'https://www.omim.org',
  },
  {
    id: '5',
    name: 'dbSNP',
    version: 'b156',
    description: 'SNP 数据库',
    lastUpdated: '2024-10-15',
    size: '18.6 GB',
    status: 'current',
    source: 'https://www.ncbi.nlm.nih.gov/snp',
  },
  {
    id: '6',
    name: 'SpliceAI',
    version: 'v1.3',
    description: '剪接位点预测数据库',
    lastUpdated: '2024-06-01',
    size: '12.3 GB',
    status: 'current',
    source: 'https://github.com/Illumina/SpliceAI',
  },
];

export default function DatabaseManagementPage() {
  const getStatusTag = (status: DatabaseInfo['status']) => {
    switch (status) {
      case 'current':
        return <Tag variant="success">最新</Tag>;
      case 'outdated':
        return <Tag variant="warning">需更新</Tag>;
      case 'updating':
        return <Tag variant="info">更新中</Tag>;
    }
  };

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">数据库管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          管理变异注释所需的各类数据库，包括人群频率、临床意义、功能预测等。建议定期更新以获取最新数据。
        </p>
      </div>

      <div className="grid gap-4">
        {mockDatabases.map((db) => (
          <div
            key={db.id}
            className="p-4 bg-canvas-default rounded-lg border border-border hover:border-border-muted transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-medium text-fg-default">{db.name}</h3>
                  <Tag variant="neutral">{db.version}</Tag>
                  {getStatusTag(db.status)}
                </div>
                <p className="text-sm text-fg-muted mb-2">{db.description}</p>
                <div className="flex items-center gap-4 text-xs text-fg-muted">
                  <span>大小: {db.size}</span>
                  <span>更新时间: {db.lastUpdated}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="small"
                  leftIcon={<ExternalLink className="w-3 h-3" />}
                  onClick={() => window.open(db.source, '_blank')}
                >
                  来源
                </Button>
                <Button
                  variant={db.status === 'outdated' ? 'primary' : 'secondary'}
                  size="small"
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                >
                  {db.status === 'outdated' ? '更新' : '检查更新'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContent>
  );
}
