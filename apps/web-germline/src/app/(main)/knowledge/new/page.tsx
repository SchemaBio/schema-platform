'use client';

import { useState } from 'react';
import { PageContent } from '@/components/layout';
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

export default function NewVariantPage() {
  const [formData, setFormData] = useState({
    gene: '',
    chromosome: '',
    position: '',
    refAllele: '',
    altAllele: '',
    hgvsc: '',
    hgvsp: '',
    acmg: '',
    clinvarId: '',
    rsId: '',
    disease: '',
    inheritance: '',
    notes: '',
  });

  const [literatures, setLiteratures] = useState<Literature[]>([]);
  const [pmidSearch, setPmidSearch] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLiterature = () => {
    if (!pmidSearch) return;
    // Mock adding literature
    const newLit: Literature = {
      id: Date.now().toString(),
      pmid: pmidSearch,
      title: '示例文献标题 - ' + pmidSearch,
      authors: 'Author A, Author B, et al.',
      journal: 'Nature Genetics',
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
    console.log('Submitting:', { ...formData, literatures });
    // TODO: Submit to API
  };

  return (
    <PageContent>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-fg-default">新增位点</h2>
        <Link
          href="/knowledge/variants"
          className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg-default"
        >
          <X className="w-4 h-4" />
          取消
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">基本信息</h3>
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
                placeholder="如: BRCA1"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                染色体 <span className="text-danger-fg">*</span>
              </label>
              <select
                name="chromosome"
                value={formData.chromosome}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                <option value="">选择染色体</option>
                {Array.from({ length: 22 }, (_, i) => (
                  <option key={i + 1} value={`chr${i + 1}`}>chr{i + 1}</option>
                ))}
                <option value="chrX">chrX</option>
                <option value="chrY">chrY</option>
                <option value="chrM">chrM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                位置 <span className="text-danger-fg">*</span>
              </label>
              <input
                type="number"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="基因组坐标"
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
          </div>
        </div>

        {/* Variant Details */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">变异信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">Ref</label>
              <input
                type="text"
                name="refAllele"
                value={formData.refAllele}
                onChange={handleChange}
                placeholder="参考等位基因"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">Alt</label>
              <input
                type="text"
                name="altAllele"
                value={formData.altAllele}
                onChange={handleChange}
                placeholder="变异等位基因"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                HGVSc <span className="text-danger-fg">*</span>
              </label>
              <input
                type="text"
                name="hgvsc"
                value={formData.hgvsc}
                onChange={handleChange}
                placeholder="如: c.5266dupC"
                required
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
                placeholder="如: p.Gln1756ProfsTer74"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border">
          <h3 className="text-sm font-medium text-fg-default mb-4">分类与注释</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">
                ACMG 分类 <span className="text-danger-fg">*</span>
              </label>
              <select
                name="acmg"
                value={formData.acmg}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                <option value="">选择分类</option>
                <option value="pathogenic">致病 (Pathogenic)</option>
                <option value="likely-pathogenic">可能致病 (Likely Pathogenic)</option>
                <option value="vus">意义未明 (VUS)</option>
                <option value="likely-benign">可能良性 (Likely Benign)</option>
                <option value="benign">良性 (Benign)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">ClinVar ID</label>
              <input
                type="text"
                name="clinvarId"
                value={formData.clinvarId}
                onChange={handleChange}
                placeholder="如: VCV000017661"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">rsID</label>
              <input
                type="text"
                name="rsId"
                value={formData.rsId}
                onChange={handleChange}
                placeholder="如: rs80357906"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm text-fg-muted mb-1">相关疾病</label>
              <input
                type="text"
                name="disease"
                value={formData.disease}
                onChange={handleChange}
                placeholder="如: 遗传性乳腺癌-卵巢癌综合征"
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              />
            </div>
            <div>
              <label className="block text-sm text-fg-muted mb-1">遗传模式</label>
              <select
                name="inheritance"
                value={formData.inheritance}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                <option value="">选择遗传模式</option>
                <option value="AD">常染色体显性 (AD)</option>
                <option value="AR">常染色体隐性 (AR)</option>
                <option value="XLD">X连锁显性 (XLD)</option>
                <option value="XLR">X连锁隐性 (XLR)</option>
                <option value="MT">线粒体遗传 (MT)</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm text-fg-muted mb-1">备注</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="其他备注信息..."
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis resize-none"
            />
          </div>
        </div>

        {/* Literature */}
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
