'use client';

import { PageContent } from '@/components/layout';

export default function AboutPage() {
  return (
    <PageContent>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-emphasis rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧬</span>
          </div>
          <h1 className="text-2xl font-semibold text-fg-default mb-2">绳墨生物</h1>
          <p className="text-fg-muted">遗传病分析平台</p>
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
              绳墨生物遗传病分析平台是一款专业的全外显子遗传病基因组分析系统，
              提供样本管理、数据处理、变异分析、ACMG 分类、报告生成等一站式解决方案，
              助力临床遗传病诊断和科研工作。
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
