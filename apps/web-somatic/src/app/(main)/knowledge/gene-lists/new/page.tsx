'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContent } from '@/components/layout';
import { Input } from '@schema/ui-kit';
import { ArrowLeft, Upload, Plus, X, Search } from 'lucide-react';

interface GeneInput {
  symbol: string;
  isValid: boolean;
  name?: string;
}

export default function NewGeneListPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'panel' | 'disease' | 'custom'>('custom');
  const [isPublic, setIsPublic] = useState(true);
  const [geneInput, setGeneInput] = useState('');
  const [genes, setGenes] = useState<GeneInput[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Mock gene validation
  const validateGenes = async (symbols: string[]) => {
    setIsValidating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const validGenes = ['MYH7', 'MYBPC3', 'TNNT2', 'TNNI3', 'TPM1', 'ACTC1', 'MYL2', 'MYL3', 
      'SCN5A', 'KCNQ1', 'KCNH2', 'LMNA', 'BRCA1', 'BRCA2', 'TP53', 'CFTR', 'DMD', 'PKD1'];
    
    const results: GeneInput[] = symbols.map(symbol => ({
      symbol: symbol.toUpperCase(),
      isValid: validGenes.includes(symbol.toUpperCase()),
      name: validGenes.includes(symbol.toUpperCase()) ? `${symbol} gene` : undefined,
    }));
    
    setIsValidating(false);
    return results;
  };

  const handleAddGenes = async () => {
    if (!geneInput.trim()) return;
    
    // Parse input (comma, space, newline separated)
    const symbols = geneInput
      .split(/[,\s\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    if (symbols.length === 0) return;
    
    const validated = await validateGenes(symbols);
    
    // Add only new genes (avoid duplicates)
    const existingSymbols = new Set(genes.map(g => g.symbol));
    const newGenes = validated.filter(g => !existingSymbols.has(g.symbol));
    
    setGenes([...genes, ...newGenes]);
    setGeneInput('');
  };

  const handleRemoveGene = (symbol: string) => {
    setGenes(genes.filter(g => g.symbol !== symbol));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const text = await file.text();
    const symbols = text
      .split(/[,\s\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('#')); // Skip comments
    
    if (symbols.length > 0) {
      const validated = await validateGenes(symbols);
      const existingSymbols = new Set(genes.map(g => g.symbol));
      const newGenes = validated.filter(g => !existingSymbols.has(g.symbol));
      setGenes([...genes, ...newGenes]);
    }
    
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!name.trim() || genes.length === 0) return;
    
    // In real app, call API to create gene list
    console.log('Create gene list:', { name, description, category, isPublic, genes });
    router.push('/knowledge/gene-lists');
  };

  const validGenes = genes.filter(g => g.isValid);
  const invalidGenes = genes.filter(g => !g.isValid);

  return (
    <PageContent>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/knowledge/gene-lists')}
          className="p-1 text-fg-muted hover:text-fg-default hover:bg-canvas-subtle rounded"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-medium text-fg-default">新建基因列表</h2>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Basic info */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border space-y-4">
          <h3 className="text-sm font-medium text-fg-default">基本信息</h3>
          
          <div>
            <label className="block text-sm text-fg-muted mb-1">列表名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：心血管疾病基因Panel"
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
            />
          </div>
          
          <div>
            <label className="block text-sm text-fg-muted mb-1">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="列表用途说明..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis resize-none"
            />
          </div>
          
          <div className="flex gap-6">
            <div>
              <label className="block text-sm text-fg-muted mb-1">类型</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                <option value="panel">Panel</option>
                <option value="disease">疾病</option>
                <option value="custom">自定义</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-fg-muted mb-1">可见性</label>
              <select
                value={isPublic ? 'public' : 'private'}
                onChange={(e) => setIsPublic(e.target.value === 'public')}
                className="px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis"
              >
                <option value="public">公开</option>
                <option value="private">私有</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gene input */}
        <div className="p-4 bg-canvas-default rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-fg-default">添加基因</h3>
            <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-canvas-subtle border border-border rounded-md hover:bg-canvas-inset transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              从文件导入
              <input
                type="file"
                accept=".txt,.tsv,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm text-fg-muted mb-1">
              输入基因符号（支持逗号、空格、换行分隔）
            </label>
            <div className="flex gap-2">
              <textarea
                value={geneInput}
                onChange={(e) => setGeneInput(e.target.value)}
                placeholder="MYH7, MYBPC3, TNNT2&#10;或每行一个基因"
                rows={3}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-canvas-default focus:outline-none focus:ring-2 focus:ring-accent-emphasis resize-none font-mono"
              />
              <button
                onClick={handleAddGenes}
                disabled={!geneInput.trim() || isValidating}
                className="px-4 py-2 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {isValidating ? '验证中...' : '添加'}
              </button>
            </div>
          </div>
        </div>

        {/* Gene list */}
        {genes.length > 0 && (
          <div className="p-4 bg-canvas-default rounded-lg border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-fg-default">
                已添加基因 ({validGenes.length} 个有效)
              </h3>
              {invalidGenes.length > 0 && (
                <span className="text-xs text-danger-fg">
                  {invalidGenes.length} 个无效基因
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {genes.map((gene) => (
                <span
                  key={gene.symbol}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md ${
                    gene.isValid
                      ? 'bg-success-subtle text-success-fg'
                      : 'bg-danger-subtle text-danger-fg'
                  }`}
                >
                  {gene.symbol}
                  <button
                    onClick={() => handleRemoveGene(gene.symbol)}
                    className="p-0.5 hover:bg-black/10 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            {invalidGenes.length > 0 && (
              <p className="text-xs text-fg-muted">
                提示：无效基因将不会被保存。请检查基因符号是否正确。
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            onClick={() => router.push('/knowledge/gene-lists')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-canvas-subtle transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || validGenes.length === 0}
            className="px-4 py-2 text-sm bg-accent-emphasis text-fg-on-emphasis rounded-md hover:bg-accent-emphasis/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建列表
          </button>
        </div>
      </div>
    </PageContent>
  );
}
