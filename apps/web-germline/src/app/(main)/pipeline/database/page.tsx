'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Tag } from '@schema/ui-kit';
import { Plus, Search, Pencil, Trash2, Database } from 'lucide-react';
import * as React from 'react';

interface AnnotationDatabase {
  id: string;
  name: string;
  version: string;
  description: string;
  path: string;
  vepParams: string;
  createdAt: string;
  updatedAt: string;
}

const mockDatabases: AnnotationDatabase[] = [
  {
    id: '1',
    name: 'gnomAD',
    version: 'v4.0',
    description: '人群等位基因频率数据库',
    path: '/data/vep/gnomad_v4',
    vepParams: '--custom file=/data/vep/gnomad_v4/gnomad.genomes.v4.0.sites.vcf.bgz,short_name=gnomAD,format=vcf,type=exact,coords=0,fields=AF%AC%AN',
    createdAt: '2024-11-01',
    updatedAt: '2024-11-01',
  },
  {
    id: '2',
    name: 'ClinVar',
    version: '2024-12',
    description: '临床变异数据库',
    path: '/data/vep/clinvar',
    vepParams: '--custom file=/data/vep/clinvar/clinvar_20241215.vcf.gz,short_name=ClinVar,format=vcf,type=exact,coords=0,fields=CLNSIG%CLNREVSTAT%CLNDN',
    createdAt: '2024-12-15',
    updatedAt: '2024-12-15',
  },
  {
    id: '3',
    name: 'HGMD',
    version: '2024.3',
    description: '人类基因突变数据库（专业版）',
    path: '/data/vep/hgmd',
    vepParams: '--custom file=/data/vep/hgmd/hgmd_pro_2024.3.vcf.gz,short_name=HGMD,format=vcf,type=exact,coords=0,fields=CLASS%PHEN%GENE',
    createdAt: '2024-09-01',
    updatedAt: '2024-09-01',
  },
  {
    id: '4',
    name: 'SpliceAI',
    version: 'v1.3',
    description: '剪接位点预测数据库',
    path: '/data/vep/spliceai',
    vepParams: '--plugin SpliceAI,snv=/data/vep/spliceai/spliceai_scores.raw.snv.hg38.vcf.gz,indel=/data/vep/spliceai/spliceai_scores.raw.indel.hg38.vcf.gz',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
  {
    id: '5',
    name: 'dbNSFP',
    version: '4.5a',
    description: '功能预测综合数据库（SIFT, PolyPhen2, CADD 等）',
    path: '/data/vep/dbnsfp',
    vepParams: '--plugin dbNSFP,/data/vep/dbnsfp/dbNSFP4.5a_grch38.gz,SIFT_score,Polyphen2_HDIV_score,CADD_phred,REVEL_score,MutationTaster_pred',
    createdAt: '2024-08-01',
    updatedAt: '2024-08-01',
  },
  {
    id: '6',
    name: 'OMIM',
    version: '2024-12',
    description: '在线人类孟德尔遗传数据库',
    path: '/data/vep/omim',
    vepParams: '--custom file=/data/vep/omim/genemap2.txt,short_name=OMIM,format=tab,type=overlap,coords=1,fields=Phenotypes%Inheritance',
    createdAt: '2024-12-20',
    updatedAt: '2024-12-20',
  },
];

export default function DatabaseManagementPage() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredDatabases = React.useMemo(() => {
    if (!searchQuery) return mockDatabases;
    const query = searchQuery.toLowerCase();
    return mockDatabases.filter(
      (db) =>
        db.name.toLowerCase().includes(query) ||
        db.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">数据库管理</h2>

      <div className="p-4 bg-canvas-subtle rounded-lg border border-border mb-4">
        <p className="text-sm text-fg-muted">
          管理 VEP 变异注释所需的自定义数据库。配置数据库名称、版本、文件路径及对应的 VEP 注释参数。
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-64">
          <Input
            placeholder="搜索数据库..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          添加数据库
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredDatabases.map((db) => (
          <div
            key={db.id}
            className="p-4 bg-canvas-default rounded-lg border border-border hover:border-border-muted transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-4 h-4 text-fg-muted shrink-0" />
                  <h3 className="text-base font-medium text-fg-default">{db.name}</h3>
                  <Tag variant="neutral">{db.version}</Tag>
                </div>
                <p className="text-sm text-fg-muted mb-3">{db.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-fg-muted shrink-0 w-16">路径:</span>
                    <code className="text-xs bg-canvas-subtle px-1.5 py-0.5 rounded font-mono text-fg-default break-all">
                      {db.path}
                    </code>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-fg-muted shrink-0 w-16">VEP 参数:</span>
                    <code className="text-xs bg-canvas-subtle px-1.5 py-0.5 rounded font-mono text-fg-default break-all">
                      {db.vepParams}
                    </code>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-fg-muted mt-3">
                  <span>创建: {db.createdAt}</span>
                  <span>更新: {db.updatedAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <Button variant="ghost" size="small" iconOnly aria-label="编辑">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="small" iconOnly aria-label="删除">
                  <Trash2 className="w-4 h-4 text-danger-fg" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageContent>
  );
}
