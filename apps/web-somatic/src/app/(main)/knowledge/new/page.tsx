'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
import { Button } from '@schema/ui-kit';
import { Save, X, Search, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Literature {
  id: string;
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
}

interface Drug {
  id: string;
  name: string;
  response: 'sensitive' | 'resistant';
}

const TUMOR_TYPE_OPTIONS = [
  '非小细胞肺癌',
  '小细胞肺癌',
  '乳腺癌',
  '结直肠癌',
  '胃癌',
  '肝癌',
  '胰腺癌',
  '卵巢癌',
  '前列腺癌',
  '黑色素瘤',
  '甲状腺癌',
  '肾癌',
  '膀胱癌',
  '头颈部鳞癌',
  '胆管癌',
  '软组织肉瘤',
  '胶质瘤',
  '其他实体瘤',
];

const VARIANT_TYPE_OPTIONS = [
  { value: 'SNV', label: 'SNV (单核苷酸变异)' },
  { value: 'Insertion', label: 'Insertion (插入)' },
  { value: 'Deletion', label: 'Deletion (缺失)' },
  { value: 'Fusion', label: 'Fusion (融合)' },
  { value: 'CNV', label: 'CNV (拷贝数变异)' },
];

const EVIDENCE_LEVEL_OPTIONS = [
  { value: 'A', label: 'A级 - FDA获批适应症' },
  { value: 'B', label: 'B级 - 临床指南推荐' },
  { value: 'C', label: 'C级 - 临床研究证据' },
  { value: 'D', label: 'D级 - 病例报告/系列' },
  { value: 'E', label: 'E级 - 临床前研究' },
];

export default function NewVariantPage() {
  const [formData, setFormData] = useState({
    gene: '',
    variant: '',
    variantType: 'SNV',
    hgvsc: '',
    hgvsp: '',
    evidenceLevel: '',
    tumorTypes: [] as string[],
    oncokbId: '',
    civicId: '',
    notes: '',
  });

  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [newDrug, setNewDrug] = useState<{ name: string; response: 'sensitive' | 'resistant' }>({ name: '', response: 'sensitive' });
  const [literatures, setLiteratures] = useState<Literature[]>([]);
  const [pmidSearch, setPmidSearch] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTumorTypeToggle = (tumorType: string) => {
    setFormData((prev) => ({
      ...prev,
      tumorTypes: prev.tumorTypes.includes(tumorType)
        ? prev.tumorTypes.filter((t) => t !== tumorType)
        : [...prev.tumorTypes, tumorType],
    }));
  };

  const handleAddDrug = () => {
    if (!newDrug.name) return;
    setDrugs((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newDrug.name, response: newDrug.response },
    ]);
    setNewDrug({ name: '', response: 'sensitive' });
  };

  const handleRemoveDrug = (id: string) => {
    setDrugs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddLiterature = () => {
    if (!pmidSearch) return;
    const newLit: Literature = {
      id: Date.now().toString(),
      pmid: pmidSearch,
      title: '示例文献标题 - PMID:' + pmidSearch,
      authors: 'Author A, Author B, et al.',
      journal: 'Journal of Clinical Oncology',
      year: '2024',
    };
    setLiteratures((prev) => [...prev, newLit]);
    setPmidSearch('');
  };

  const handleRemoveLiterature = (id: string) => {
    setLiteratures((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting:', { ...formData, drugs, literatures });
  };

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">新增靶向药物位点</h2>
        <Link
          href="/knowledge/variants"
          className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg-default"
        >
          <X className="w-4 h-4" />
          取消
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基因与变异信息 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">基因与变异信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                基因 <span className="text-danger-fg">*</span>
              </label>
              <input
                type="text"
                name="gene"
                value={formData.gene}
                onChange={handleChange}
                placeholder="如: EGFR, KRAS, BRAF"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                变异 <span className="text-danger-fg">*</span>
              </label>
              <input
                type="text"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                placeholder="如: L858R, V600E, Exon 19 del"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                变异类型 <span className="text-danger-fg">*</span>
              </label>
              <select
                name="variantType"
                value={formData.variantType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                {VARIANT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">HGVSc</label>
              <input
                type="text"
                name="hgvsc"
                value={formData.hgvsc}
                onChange={handleChange}
                placeholder="如: c.2573T>G"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">HGVSp</label>
              <input
                type="text"
                name="hgvsp"
                value={formData.hgvsp}
                onChange={handleChange}
                placeholder="如: p.Leu858Arg"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
          </div>
        </div>

        {/* 证据等级与适应瘤种 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">证据等级与适应瘤种</h3>
          <div className="mb-4">
            <label className="block text-sm text-fg-muted mb-1">
              证据等级 <span className="text-danger-fg">*</span>
            </label>
            <select
              name="evidenceLevel"
              value={formData.evidenceLevel}
              onChange={handleChange}
              required
              className="w-full max-w-md px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
            >
              <option value="">选择证据等级</option>
              {EVIDENCE_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-fg-subtle mt-1">
              证据等级参考 OncoKB / CIViC 分级标准
            </p>
          </div>
          <div>
            <label className="block text-sm text-fg-muted mb-2">
              适应瘤种 <span className="text-danger-fg">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TUMOR_TYPE_OPTIONS.map((tumor) => (
                <button
                  key={tumor}
                  type="button"
                  onClick={() => handleTumorTypeToggle(tumor)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    formData.tumorTypes.includes(tumor)
                      ? 'bg-accent-emphasis text-fg-on-emphasis border-accent-emphasis'
                      : 'bg-canvas-default text-fg-muted border-border hover:border-accent-muted'
                  }`}
                >
                  {tumor}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 相关药物 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">相关靶向药物</h3>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={newDrug.name}
              onChange={(e) => setNewDrug((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="药物名称，如：奥希替尼"
              className="flex-1 max-w-xs px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
            />
            <select
              value={newDrug.response}
              onChange={(e) => setNewDrug((prev) => ({ ...prev, response: e.target.value as 'sensitive' | 'resistant' }))}
              className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
            >
              <option value="sensitive">敏感</option>
              <option value="resistant">耐药</option>
            </select>
            <button
              type="button"
              onClick={handleAddDrug}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-accent-subtle text-accent-fg rounded-md hover:bg-accent-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {drugs.length > 0 ? (
            <div className="space-y-2">
              {drugs.map((drug) => (
                <div
                  key={drug.id}
                  className="flex items-center justify-between p-3 bg-canvas-subtle rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-fg-default">{drug.name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      drug.response === 'sensitive' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {drug.response === 'sensitive' ? '敏感' : '耐药'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDrug(drug.id)}
                    className="p-1 text-fg-muted hover:text-danger-fg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-fg-muted text-center py-4">
              暂无关联药物，请添加相关靶向药物
            </div>
          )}
        </div>

        {/* 外部数据库链接 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">外部数据库链接</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">OncoKB ID</label>
              <input
                type="text"
                name="oncokbId"
                value={formData.oncokbId}
                onChange={handleChange}
                placeholder="如: EGFR L858R"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">CIViC ID</label>
              <input
                type="text"
                name="civicId"
                value={formData.civicId}
                onChange={handleChange}
                placeholder="如: EID12345"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
          </div>
        </div>

        {/* 相关文献 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">相关文献</h3>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-muted" />
              <input
                type="text"
                value={pmidSearch}
                onChange={(e) => setPmidSearch(e.target.value)}
                placeholder="输入 PMID 搜索文献..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <button
              type="button"
              onClick={handleAddLiterature}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-accent-subtle text-accent-fg rounded-md hover:bg-accent-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {literatures.length > 0 ? (
            <div className="space-y-2">
              {literatures.map((lit) => (
                <div
                  key={lit.id}
                  className="flex items-start justify-between p-3 bg-canvas-subtle rounded-md"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-fg-default">{lit.title}</div>
                    <div className="text-xs text-fg-muted mt-1">
                      {lit.authors} · {lit.journal} · {lit.year}
                    </div>
                    <div className="text-xs text-accent-fg mt-1">PMID: {lit.pmid}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLiterature(lit.id)}
                    className="p-1 text-fg-muted hover:text-danger-fg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-fg-muted text-center py-4">
              暂无关联文献，请通过 PMID 搜索添加
            </div>
          )}
        </div>

        {/* 备注 */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">备注</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="其他备注信息，如特殊用药说明、联合用药方案等..."
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/knowledge/variants"
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-canvas-subtle transition-colors"
          >
            取消
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存位点
          </button>
        </div>
      </form>
    </PageContent>
  );
}
