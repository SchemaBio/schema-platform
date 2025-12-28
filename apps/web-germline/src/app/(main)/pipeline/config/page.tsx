'use client';

import { PageContent } from '@/components/layout';
import { Button, Input, Select, FormItem } from '@schema/ui-kit';
import { Save } from 'lucide-react';
import * as React from 'react';

export default function PipelineConfigPage() {
  const [config, setConfig] = React.useState({
    defaultBed: 'Agilent_SureSelect_V7.bed',
    genomeVersion: 'hg38',
    minDepth: '20',
    minBaseQuality: '20',
    minMappingQuality: '30',
    variantCallers: ['gatk', 'deepvariant'],
    cnvEnabled: true,
    svEnabled: false,
    annotationDatabases: ['gnomad', 'clinvar', 'hgmd', 'omim'],
  });

  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('配置已保存');
  };

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">流程配置</h2>

      <div className="max-w-2xl space-y-8">
        {/* 基本配置 */}
        <section>
          <h3 className="text-sm font-medium text-fg-default mb-4 pb-2 border-b border-border">
            基本配置
          </h3>
          <div className="space-y-4">
            <FormItem label="默认 BED 文件">
              <Select
                options={[
                  { value: 'Agilent_SureSelect_V7.bed', label: 'Agilent SureSelect V7' },
                  { value: 'IDT_xGen_Exome_v2.bed', label: 'IDT xGen Exome v2' },
                  { value: 'Cardio_Panel_v2.bed', label: 'Cardio Panel v2' },
                ]}
                value={config.defaultBed}
                onChange={(v) => setConfig((prev) => ({ ...prev, defaultBed: v as string }))}
              />
            </FormItem>
            <FormItem label="参考基因组版本">
              <Select
                options={[
                  { value: 'hg38', label: 'GRCh38 (hg38)' },
                  { value: 'hg19', label: 'GRCh37 (hg19)' },
                ]}
                value={config.genomeVersion}
                onChange={(v) => setConfig((prev) => ({ ...prev, genomeVersion: v as string }))}
              />
            </FormItem>
          </div>
        </section>

        {/* 质控参数 */}
        <section>
          <h3 className="text-sm font-medium text-fg-default mb-4 pb-2 border-b border-border">
            质控参数
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <FormItem label="最小测序深度">
              <Input
                type="number"
                value={config.minDepth}
                onChange={(e) => setConfig((prev) => ({ ...prev, minDepth: e.target.value }))}
                rightElement={<span className="text-fg-muted text-xs">X</span>}
              />
            </FormItem>
            <FormItem label="最小碱基质量">
              <Input
                type="number"
                value={config.minBaseQuality}
                onChange={(e) => setConfig((prev) => ({ ...prev, minBaseQuality: e.target.value }))}
              />
            </FormItem>
            <FormItem label="最小比对质量">
              <Input
                type="number"
                value={config.minMappingQuality}
                onChange={(e) => setConfig((prev) => ({ ...prev, minMappingQuality: e.target.value }))}
              />
            </FormItem>
          </div>
        </section>

        {/* 变异检测 */}
        <section>
          <h3 className="text-sm font-medium text-fg-default mb-4 pb-2 border-b border-border">
            变异检测
          </h3>
          <div className="space-y-4">
            <FormItem label="SNV/InDel 检测工具">
              <Select
                options={[
                  { value: 'gatk', label: 'GATK HaplotypeCaller' },
                  { value: 'deepvariant', label: 'DeepVariant' },
                  { value: 'strelka2', label: 'Strelka2' },
                ]}
                value={config.variantCallers}
                onChange={(v) => setConfig((prev) => ({ ...prev, variantCallers: v as string[] }))}
                multiple
              />
            </FormItem>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cnvEnabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, cnvEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-border-default text-accent-emphasis focus:ring-accent-emphasis"
                />
                <span className="text-sm text-fg-default">启用 CNV 检测</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.svEnabled}
                  onChange={(e) => setConfig((prev) => ({ ...prev, svEnabled: e.target.checked }))}
                  className="w-4 h-4 rounded border-border-default text-accent-emphasis focus:ring-accent-emphasis"
                />
                <span className="text-sm text-fg-default">启用 SV 检测</span>
              </label>
            </div>
          </div>
        </section>

        {/* 注释数据库 */}
        <section>
          <h3 className="text-sm font-medium text-fg-default mb-4 pb-2 border-b border-border">
            注释数据库
          </h3>
          <FormItem label="启用的注释数据库">
            <Select
              options={[
                { value: 'gnomad', label: 'gnomAD' },
                { value: 'clinvar', label: 'ClinVar' },
                { value: 'hgmd', label: 'HGMD' },
                { value: 'omim', label: 'OMIM' },
                { value: 'dbsnp', label: 'dbSNP' },
                { value: 'spliceai', label: 'SpliceAI' },
              ]}
              value={config.annotationDatabases}
              onChange={(v) => setConfig((prev) => ({ ...prev, annotationDatabases: v as string[] }))}
              multiple
            />
          </FormItem>
        </section>

        {/* 保存按钮 */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            loading={saving}
          >
            保存配置
          </Button>
        </div>
      </div>
    </PageContent>
  );
}
