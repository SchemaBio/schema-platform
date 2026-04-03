'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { PageContent } from '@/components/layout';

interface OpenSourceLibrary {
  name: string;
  version: string;
  license: string;
  description: string;
  url: string;
  category: string;
}

const openSourceLibraries: OpenSourceLibrary[] = [
  // 核心框架
  {
    name: 'React',
    version: '18.2.0',
    license: 'MIT',
    description: '用于构建用户界面的 JavaScript 库',
    url: 'https://react.dev',
    category: '核心框架',
  },
  {
    name: 'Next.js',
    version: '14.2.25',
    license: 'MIT',
    description: 'React 全栈应用框架，支持 SSR、SSG、API 路由',
    url: 'https://nextjs.org',
    category: '核心框架',
  },
  // 样式与UI
  {
    name: 'Tailwind CSS',
    version: '3.4.0',
    license: 'MIT',
    description: '实用优先的 CSS 框架，用于快速构建现代界面',
    url: 'https://tailwindcss.com',
    category: '样式与UI',
  },
  {
    name: 'Lucide',
    version: '0.344.0',
    license: 'ISC',
    description: '开源图标库，提供精美的 SVG 图标',
    url: 'https://lucide.dev',
    category: '样式与UI',
  },
  {
    name: 'Radix UI',
    version: '1.0.7',
    license: 'MIT',
    description: '无样式、可访问的 React UI 组件库',
    url: 'https://radix-ui.com',
    category: '样式与UI',
  },
  // 生物信息学
  {
    name: 'IGV.js',
    version: '2.15.11',
    license: 'MIT',
    description: 'Integrative Genomics Viewer 的 JavaScript 版本，用于基因组数据可视化',
    url: 'https://igv.org',
    category: '生物信息学',
  },
  // 工具库
  {
    name: 'clsx',
    version: '2.1.0',
    license: 'MIT',
    description: '用于构建 className 字符串的小型工具',
    url: 'https://github.com/lukeed/clsx',
    category: '工具库',
  },
  {
    name: 'tailwind-merge',
    version: '2.2.1',
    license: 'MIT',
    description: '用于合并 Tailwind CSS 类名而不产生冲突',
    url: 'https://github.com/dcastil/tailwind-merge',
    category: '工具库',
  },
  {
    name: 'mammoth.js',
    version: '1.8.0',
    license: 'MIT',
    description: '用于解析 .docx 文件的 JavaScript 库',
    url: 'https://github.com/mwilliamson/mammoth.js',
    category: '工具库',
  },
  // 开发工具
  {
    name: 'TypeScript',
    version: '5.3.0',
    license: 'Apache-2.0',
    description: 'JavaScript 的类型超集，提供静态类型检查',
    url: 'https://www.typescriptlang.org',
    category: '开发工具',
  },
  {
    name: 'PostCSS',
    version: '8.4.35',
    license: 'MIT',
    description: '用 JavaScript 转换 CSS 的工具',
    url: 'https://postcss.org',
    category: '开发工具',
  },
];

const licenseColors: Record<string, string> = {
  MIT: 'bg-green-50 text-green-700 border-green-200',
  ISC: 'bg-blue-50 text-blue-700 border-blue-200',
  Apache: 'bg-orange-50 text-orange-700 border-orange-200',
  'Apache-2.0': 'bg-orange-50 text-orange-700 border-orange-200',
};

function LicenseBadge({ license }: { license: string }) {
  const colorClass = licenseColors[license] || 'bg-gray-50 text-gray-700 border-gray-200';
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${colorClass}`}>
      {license}
    </span>
  );
}

export default function AboutPage() {
  // 按类别分组
  const groupedLibraries = openSourceLibraries.reduce((acc, lib) => {
    if (!acc[lib.category]) acc[lib.category] = [];
    acc[lib.category].push(lib);
    return acc;
  }, {} as Record<string, OpenSourceLibrary[]>);

  const categoryOrder = ['核心框架', '样式与UI', '生物信息学', '工具库', '开发工具'];

  return (
    <PageContent>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/logo.png"
              alt="知几"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-fg-default mb-2">开源软件声明</h1>
          <p className="text-fg-muted">本项目使用的开源软件及其许可证信息</p>
        </div>

        {/* Apache 2.0 许可证说明 */}
        <div className="mb-6 p-4 bg-canvas-subtle rounded-lg border border-border">
          <h2 className="text-sm font-medium text-fg-default mb-2">本项目许可证</h2>
          <p className="text-sm text-fg-muted leading-relaxed">
            知几 采用 <span className="font-medium text-fg-default">Apache License 2.0</span> 开源协议发布。
            您可以自由使用、修改和分发本软件，但需保留原作者的版权声明和许可证文本。
          </p>
        </div>

        {/* 第三方开源库 */}
        <div className="space-y-6">
          {categoryOrder.map(category => {
            const libs = groupedLibraries[category];
            if (!libs) return null;
            return (
              <section key={category} className="p-4 bg-canvas-subtle rounded-lg border border-border">
                <h2 className="text-sm font-medium text-fg-default mb-4">{category}</h2>
                <div className="space-y-3">
                  {libs.map(lib => (
                    <div
                      key={lib.name}
                      className="flex items-start justify-between gap-4 p-3 bg-canvas rounded border border-border-subtle"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-fg-default">{lib.name}</span>
                          <LicenseBadge license={lib.license} />
                        </div>
                        <p className="text-sm text-fg-muted leading-relaxed">{lib.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs text-fg-muted font-mono">v{lib.version}</span>
                        <a
                          href={lib.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          官网
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* 许可证说明 */}
        <section className="mt-6 p-4 bg-canvas-subtle rounded-lg border border-border">
          <h2 className="text-sm font-medium text-fg-default mb-3">许可证类型说明</h2>
          <div className="space-y-2 text-sm text-fg-muted">
            <div className="flex items-start gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${licenseColors['MIT']}`}>MIT</span>
              <p>最宽松的开源许可证，允许任意使用、修改和分发，仅需保留版权声明</p>
            </div>
            <div className="flex items-start gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${licenseColors['Apache-2.0']}`}>Apache-2.0</span>
              <p>类似 MIT，但提供专利授权保护，需保留版权、专利、商标声明</p>
            </div>
            <div className="flex items-start gap-2">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border shrink-0 ${licenseColors['ISC']}`}>ISC</span>
              <p>功能上与 MIT 类似，但文本更简洁</p>
            </div>
          </div>
        </section>

        {/* 致谢 */}
        <section className="mt-6 p-4 bg-canvas-subtle rounded-lg border border-border">
          <h2 className="text-sm font-medium text-fg-default mb-2">致谢</h2>
          <p className="text-sm text-fg-muted leading-relaxed">
            感谢以上开源社区的贡献者们，他们的工作使本项目得以实现。
            我们尊重并遵守各开源项目的许可证要求。
          </p>
        </section>
      </div>
    </PageContent>
  );
}