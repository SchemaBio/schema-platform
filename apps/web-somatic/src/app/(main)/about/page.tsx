'use client';

import Image from 'next/image';
import { PageContent } from '@/components/layout';

export default function AboutPage() {
  return (
    <PageContent>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Schema Somatic"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-fg-default mb-2">Schema Somatic</h1>
          <p className="text-fg-muted">肿瘤基因组分析平台</p>
        </div>

        <div className="space-y-6">
          {/* 版本信息 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">版本信息</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-muted">版本号</dt>
                <dd className="text-fg-default font-mono">v1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">构建时间</dt>
                <dd className="text-fg-default font-mono">2024-12-28</dd>
              </div>
            </dl>
          </section>

          {/* 产品介绍 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">产品介绍</h2>
            <p className="text-sm text-fg-muted leading-relaxed">
              Schema Somatic 是一款专为肿瘤基因组测序设计的体细胞突变分析平台。
              系统覆盖从原始数据到临床报告的完整分析流程，包括：
            </p>
            <ul className="mt-3 text-sm text-fg-muted space-y-1.5 list-disc list-inside">
              <li>SNV/InDel 体细胞突变检测与临床意义注释</li>
              <li>CNV 基因水平与染色体臂水平拷贝数变异分析</li>
              <li>基因融合（Fusion）检测</li>
              <li>新抗原（Neoantigen）预测</li>
              <li>MSI、HRD-score、TMB 等生物标志物分析</li>
              <li>IGV 基因组浏览器集成</li>
              <li>标准化临床报告生成</li>
            </ul>
          </section>

          {/* 适用场景 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">适用场景</h2>
            <p className="text-sm text-fg-muted leading-relaxed">
              本平台专注于体细胞（Somatic）突变分析，适用于肿瘤精准医疗、靶向用药指导、免疫治疗评估等临床场景。
              支持肿瘤-正常配对分析、纯肿瘤分析等多种模式。
            </p>
          </section>

          {/* 技术支持 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">技术支持</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-fg-muted">邮箱</dt>
                <dd className="text-fg-default">support@shengmo.bio</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-fg-muted">官网</dt>
                <dd className="text-fg-default">www.shengmo.bio</dd>
              </div>
            </dl>
          </section>

          {/* 版权信息 */}
          <div className="text-center text-xs text-fg-muted pt-4">
            <p>© 2024 绳墨生物科技有限公司 版权所有</p>
          </div>
        </div>
      </div>
    </PageContent>
  );
}
