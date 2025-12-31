'use client';

import * as React from 'react';
import { Tag } from '@schema/ui-kit';

interface BiomarkersTabProps {
  taskId: string;
}

// TCGA-MC3 数据集各癌种 TMB 阈值 (mut/Mb)
// 基于各癌种的中位数和分布特征设定
const TCGA_TMB_THRESHOLDS: Record<string, { 
  name: string; 
  code: string;
  median: number;
  highThreshold: number; 
  intermediateThreshold: number;
  p90: number; // 90th percentile
}> = {
  'SKCM': { name: '皮肤黑色素瘤', code: 'SKCM', median: 13.5, highThreshold: 20, intermediateThreshold: 10, p90: 45.2 },
  'LUAD': { name: '肺腺癌', code: 'LUAD', median: 6.3, highThreshold: 10, intermediateThreshold: 5, p90: 18.7 },
  'LUSC': { name: '肺鳞癌', code: 'LUSC', median: 8.1, highThreshold: 12, intermediateThreshold: 6, p90: 22.4 },
  'BLCA': { name: '膀胱尿路上皮癌', code: 'BLCA', median: 5.8, highThreshold: 10, intermediateThreshold: 4, p90: 19.3 },
  'COAD': { name: '结肠腺癌', code: 'COAD', median: 3.5, highThreshold: 8, intermediateThreshold: 3, p90: 12.8 },
  'READ': { name: '直肠腺癌', code: 'READ', median: 3.2, highThreshold: 8, intermediateThreshold: 3, p90: 11.5 },
  'STAD': { name: '胃腺癌', code: 'STAD', median: 3.9, highThreshold: 8, intermediateThreshold: 3, p90: 15.6 },
  'UCEC': { name: '子宫内膜癌', code: 'UCEC', median: 3.8, highThreshold: 10, intermediateThreshold: 4, p90: 28.4 },
  'HNSC': { name: '头颈鳞癌', code: 'HNSC', median: 3.2, highThreshold: 8, intermediateThreshold: 3, p90: 10.2 },
  'ESCA': { name: '食管癌', code: 'ESCA', median: 4.1, highThreshold: 8, intermediateThreshold: 3, p90: 12.3 },
  'BRCA': { name: '乳腺癌', code: 'BRCA', median: 1.5, highThreshold: 5, intermediateThreshold: 2, p90: 4.8 },
  'OV': { name: '卵巢癌', code: 'OV', median: 1.8, highThreshold: 5, intermediateThreshold: 2, p90: 5.2 },
  'PRAD': { name: '前列腺癌', code: 'PRAD', median: 1.0, highThreshold: 4, intermediateThreshold: 2, p90: 3.5 },
  'KIRC': { name: '肾透明细胞癌', code: 'KIRC', median: 1.2, highThreshold: 4, intermediateThreshold: 2, p90: 3.8 },
  'KIRP': { name: '肾乳头状细胞癌', code: 'KIRP', median: 1.1, highThreshold: 4, intermediateThreshold: 2, p90: 3.2 },
  'LIHC': { name: '肝细胞癌', code: 'LIHC', median: 2.1, highThreshold: 5, intermediateThreshold: 2, p90: 6.8 },
  'PAAD': { name: '胰腺癌', code: 'PAAD', median: 1.5, highThreshold: 4, intermediateThreshold: 2, p90: 4.2 },
  'GBM': { name: '胶质母细胞瘤', code: 'GBM', median: 2.3, highThreshold: 5, intermediateThreshold: 2, p90: 7.1 },
  'LGG': { name: '低级别胶质瘤', code: 'LGG', median: 0.8, highThreshold: 3, intermediateThreshold: 1.5, p90: 2.8 },
  'THCA': { name: '甲状腺癌', code: 'THCA', median: 0.5, highThreshold: 2, intermediateThreshold: 1, p90: 1.8 },
  'CESC': { name: '宫颈癌', code: 'CESC', median: 2.8, highThreshold: 6, intermediateThreshold: 3, p90: 9.5 },
  'SARC': { name: '肉瘤', code: 'SARC', median: 1.3, highThreshold: 4, intermediateThreshold: 2, p90: 4.5 },
  'PAN_CANCER': { name: '泛癌种 (FDA标准)', code: 'PAN_CANCER', median: 3.6, highThreshold: 10, intermediateThreshold: 6, p90: 15.0 },
};

// Mock数据
const mockBiomarkers = {
  msi: {
    status: 'MSS' as 'MSI-H' | 'MSI-L' | 'MSS',
    score: 2.3,
    unstableSites: 2,
    totalSites: 110,
  },
  hrd: {
    score: 42,
    loh: 15,
    tai: 18,
    lst: 9,
    status: 'HRD-positive' as 'HRD-positive' | 'HRD-negative',
  },
  tmb: {
    value: 8.5,
    unit: 'mut/Mb',
    totalMutations: 289,
    codingRegionSize: 34.0, // Mb
  },
  pdl1: {
    tps: 45,
    cps: 52,
  },
  tumorPurity: {
    purity: 0.65, // 65%
    ploidy: 2.1,
    method: 'FACETS' as 'FACETS' | 'ABSOLUTE' | 'PureCN' | 'Sequenza',
    confidence: 'High' as 'High' | 'Medium' | 'Low',
    // 用于评估的指标
    snvCount: 1250,
    hetSites: 8500,
    segmentCount: 45,
  },
};

export function BiomarkersTab({ taskId }: BiomarkersTabProps) {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState(mockBiomarkers);
  const [selectedCancerType, setSelectedCancerType] = React.useState('PAN_CANCER');

  React.useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setData(mockBiomarkers);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-emphasis" />
      </div>
    );
  }

  const getMSIVariant = (status: string): 'danger' | 'warning' | 'success' => {
    switch (status) {
      case 'MSI-H': return 'danger';
      case 'MSI-L': return 'warning';
      default: return 'success';
    }
  };

  // 根据选定癌种计算 TMB 等级
  const getTMBLevel = (value: number, cancerType: string): 'TMB-High' | 'TMB-Intermediate' | 'TMB-Low' => {
    const threshold = TCGA_TMB_THRESHOLDS[cancerType] || TCGA_TMB_THRESHOLDS['PAN_CANCER'];
    if (value >= threshold.highThreshold) return 'TMB-High';
    if (value >= threshold.intermediateThreshold) return 'TMB-Intermediate';
    return 'TMB-Low';
  };

  const getTMBVariant = (level: string): 'danger' | 'warning' | 'success' => {
    switch (level) {
      case 'TMB-High': return 'danger';
      case 'TMB-Intermediate': return 'warning';
      default: return 'success';
    }
  };

  // 计算 TMB 百分位数（相对于选定癌种）
  const getTMBPercentile = (value: number, cancerType: string): number => {
    const threshold = TCGA_TMB_THRESHOLDS[cancerType] || TCGA_TMB_THRESHOLDS['PAN_CANCER'];
    // 简化计算：基于中位数和 P90 估算
    if (value <= threshold.median) {
      return Math.round((value / threshold.median) * 50);
    } else {
      const aboveMedian = value - threshold.median;
      const p90AboveMedian = threshold.p90 - threshold.median;
      const percentileAbove = Math.min(40, (aboveMedian / p90AboveMedian) * 40);
      return Math.round(50 + percentileAbove);
    }
  };

  const currentThreshold = TCGA_TMB_THRESHOLDS[selectedCancerType] || TCGA_TMB_THRESHOLDS['PAN_CANCER'];
  const tmbLevel = getTMBLevel(data.tmb.value, selectedCancerType);
  const tmbPercentile = getTMBPercentile(data.tmb.value, selectedCancerType);

  return (
    <div className="flex gap-6">
      {/* 左侧列：MSI、HRD、PD-L1 */}
      <div className="flex-1 space-y-4">
        {/* MSI */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-fg-default">微卫星不稳定性 (MSI)</h3>
            <Tag variant={getMSIVariant(data.msi.status)}>{data.msi.status}</Tag>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">MSI Score</dt>
              <dd className="text-fg-default font-mono">{data.msi.score.toFixed(1)}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">不稳定位点</dt>
              <dd className="text-fg-default">{data.msi.unstableSites} / {data.msi.totalSites}</dd>
            </div>
          </dl>
        </div>

        {/* HRD */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-fg-default">同源重组缺陷 (HRD)</h3>
            <Tag variant={data.hrd.status === 'HRD-positive' ? 'danger' : 'success'}>{data.hrd.status}</Tag>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">HRD Score</dt>
              <dd className="text-fg-default font-mono">{data.hrd.score}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">LOH</dt>
              <dd className="text-fg-default">{data.hrd.loh}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">TAI</dt>
              <dd className="text-fg-default">{data.hrd.tai}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">LST</dt>
              <dd className="text-fg-default">{data.hrd.lst}</dd>
            </div>
          </dl>
        </div>

        {/* PD-L1 */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-fg-default">PD-L1 表达</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">TPS (肿瘤比例评分)</dt>
              <dd className="text-fg-default font-mono">{data.pdl1.tps}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">CPS (联合阳性评分)</dt>
              <dd className="text-fg-default font-mono">{data.pdl1.cps}</dd>
            </div>
          </dl>
        </div>

        {/* 肿瘤纯度 (生信计算) */}
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-fg-default">肿瘤纯度</h3>
              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                生信估算
              </span>
            </div>
            <Tag variant={data.tumorPurity.confidence === 'High' ? 'success' : data.tumorPurity.confidence === 'Medium' ? 'warning' : 'danger'}>
              {data.tumorPurity.confidence === 'High' ? '高置信' : data.tumorPurity.confidence === 'Medium' ? '中置信' : '低置信'}
            </Tag>
          </div>
          
          {/* 纯度可视化 */}
          <div className="mb-3">
            <div className="flex items-end justify-between mb-1">
              <span className="text-2xl font-bold text-fg-default">{(data.tumorPurity.purity * 100).toFixed(0)}%</span>
              <span className="text-xs text-fg-muted">倍性: {data.tumorPurity.ploidy.toFixed(1)}</span>
            </div>
            <div className="relative h-2 bg-canvas-inset rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ 
                  width: `${data.tumorPurity.purity * 100}%`,
                  background: data.tumorPurity.purity >= 0.3 ? '#22c55e' : data.tumorPurity.purity >= 0.2 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-fg-muted mt-1">
              <span>0%</span>
              <span className="text-fg-subtle">推荐 ≥30%</span>
              <span>100%</span>
            </div>
          </div>

          <dl className="space-y-2 text-sm border-t border-border-subtle pt-2">
            <div className="flex justify-between">
              <dt className="text-fg-muted">计算方法</dt>
              <dd className="text-fg-default">{data.tumorPurity.method}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">体细胞突变数</dt>
              <dd className="text-fg-default">{data.tumorPurity.snvCount.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">杂合位点数</dt>
              <dd className="text-fg-default">{data.tumorPurity.hetSites.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">CNV片段数</dt>
              <dd className="text-fg-default">{data.tumorPurity.segmentCount}</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-fg-muted border-t border-border-subtle pt-2">
            基于SNV等位基因频率和CNV分析的生物信息学估算，仅供参考，不替代病理评估
          </p>
        </div>
      </div>

      {/* 右侧列：TMB */}
      <div className="flex-1">
        <div className="p-4 bg-canvas-subtle rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-fg-default">肿瘤突变负荷 (TMB)</h3>
            <Tag variant={getTMBVariant(tmbLevel)}>{tmbLevel}</Tag>
          </div>
          
          {/* 癌种选择 */}
          <div className="mb-3">
            <label className="block text-xs text-fg-muted mb-1">参考癌种 (TCGA-MC3)</label>
            <select
              value={selectedCancerType}
              onChange={(e) => setSelectedCancerType(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-border-default rounded-md bg-canvas-default text-fg-default"
            >
              <option value="PAN_CANCER">泛癌种 (FDA标准)</option>
              <optgroup label="常见实体瘤">
                <option value="LUAD">肺腺癌 (LUAD)</option>
                <option value="LUSC">肺鳞癌 (LUSC)</option>
                <option value="BRCA">乳腺癌 (BRCA)</option>
                <option value="COAD">结肠腺癌 (COAD)</option>
                <option value="READ">直肠腺癌 (READ)</option>
                <option value="STAD">胃腺癌 (STAD)</option>
                <option value="LIHC">肝细胞癌 (LIHC)</option>
                <option value="PAAD">胰腺癌 (PAAD)</option>
                <option value="ESCA">食管癌 (ESCA)</option>
              </optgroup>
              <optgroup label="泌尿生殖系统">
                <option value="BLCA">膀胱尿路上皮癌 (BLCA)</option>
                <option value="KIRC">肾透明细胞癌 (KIRC)</option>
                <option value="KIRP">肾乳头状细胞癌 (KIRP)</option>
                <option value="PRAD">前列腺癌 (PRAD)</option>
                <option value="UCEC">子宫内膜癌 (UCEC)</option>
                <option value="OV">卵巢癌 (OV)</option>
                <option value="CESC">宫颈癌 (CESC)</option>
              </optgroup>
              <optgroup label="其他">
                <option value="SKCM">皮肤黑色素瘤 (SKCM)</option>
                <option value="HNSC">头颈鳞癌 (HNSC)</option>
                <option value="GBM">胶质母细胞瘤 (GBM)</option>
                <option value="LGG">低级别胶质瘤 (LGG)</option>
                <option value="THCA">甲状腺癌 (THCA)</option>
                <option value="SARC">肉瘤 (SARC)</option>
              </optgroup>
            </select>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-fg-muted">TMB值</dt>
              <dd className="text-fg-default font-mono">{data.tmb.value} {data.tmb.unit}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">总突变数</dt>
              <dd className="text-fg-default">{data.tmb.totalMutations}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">编码区大小</dt>
              <dd className="text-fg-default">{data.tmb.codingRegionSize} Mb</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-fg-muted">百分位数</dt>
              <dd className="text-fg-default">
                <span className="font-mono">{tmbPercentile}%</span>
                <span className="text-fg-muted ml-1">({currentThreshold.name})</span>
              </dd>
            </div>
          </dl>

          {/* TMB 分布条 */}
          <div className="mt-3">
            <div className="flex items-center gap-1 text-xs text-fg-muted mb-1">
              <span>Low</span>
              <span className="flex-1" />
              <span>Intermediate</span>
              <span className="flex-1" />
              <span>High</span>
            </div>
            <div className="relative h-2 bg-canvas-inset rounded-full overflow-hidden">
              {/* 背景渐变 */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(to right, 
                    #22c55e 0%, 
                    #22c55e ${(currentThreshold.intermediateThreshold / currentThreshold.p90) * 100}%, 
                    #f59e0b ${(currentThreshold.intermediateThreshold / currentThreshold.p90) * 100}%, 
                    #f59e0b ${(currentThreshold.highThreshold / currentThreshold.p90) * 100}%, 
                    #ef4444 ${(currentThreshold.highThreshold / currentThreshold.p90) * 100}%, 
                    #ef4444 100%)`
                }}
              />
              {/* 当前值指示器 */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-fg-default rounded-full shadow"
                style={{ 
                  left: `${Math.min(100, (data.tmb.value / currentThreshold.p90) * 100)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-fg-muted mt-1">
              <span>0</span>
              <span>{currentThreshold.intermediateThreshold}</span>
              <span>{currentThreshold.highThreshold}</span>
              <span>{currentThreshold.p90}+</span>
            </div>
          </div>

          <p className="mt-3 text-xs text-fg-muted border-t border-border-subtle pt-2">
            阈值 ({currentThreshold.code}): High ≥{currentThreshold.highThreshold} | Intermediate {currentThreshold.intermediateThreshold}-{currentThreshold.highThreshold} | Low &lt;{currentThreshold.intermediateThreshold} mut/Mb
          </p>
        </div>
      </div>
    </div>
  );
}
