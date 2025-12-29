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
              alt="Schema Germline"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-fg-default mb-2">Schema Germline</h1>
          <p className="text-fg-muted">全外显子测序（WES）分析平台</p>
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
              Schema Germline 是一款专为全外显子测序（Whole Exome Sequencing, WES）设计的遗传病分析平台。
              系统覆盖从原始数据到临床报告的完整分析流程，包括：
            </p>
            <ul className="mt-3 text-sm text-fg-muted space-y-1.5 list-disc list-inside">
              <li>SNV/InDel 变异检测与 ACMG/AMP 致病性分类</li>
              <li>CNV 拷贝数变异分析与 ClinGen 评估</li>
              <li>线粒体 DNA 变异检测与异质性分析</li>
              <li>基因列表管理与变异知识库</li>
              <li>IGV 基因组浏览器集成</li>
              <li>标准化临床报告生成</li>
            </ul>
          </section>

          {/* 适用场景 */}
          <section className="p-4 bg-canvas-subtle rounded-lg border border-border">
            <h2 className="text-sm font-medium text-fg-default mb-3">适用场景</h2>
            <p className="text-sm text-fg-muted leading-relaxed">
              本平台专注于胚系（Germline）变异分析，适用于单基因遗传病、罕见病的临床诊断与科研分析。
              支持单样本、Trio 家系等多种分析模式。
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
