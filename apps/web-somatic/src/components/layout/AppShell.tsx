'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Settings, Info, Shield } from 'lucide-react';
import { Breadcrumb, type BreadcrumbItem } from '@schema/ui-kit';
import { SidebarNav } from './SidebarNav';
import { useSidebarState } from '@/hooks/useSidebarState';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MobileNav } from './MobileNav';
import { mainNavItems, sidebarNavConfig } from '@/config/navigation';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * 路径段到中文标签的映射
 */
const pathLabelMap: Record<string, string> = {
  // 主模块
  dashboard: '概览',
  samples: '样本管理',
  lab: '实验中心',
  data: '数据管理',
  pipeline: '流程中心',
  analysis: '分析中心',
  reports: '报告中心',
  knowledge: '知识中心',
  settings: '系统设置',
  about: '关于',
  privacy: '隐私协议',
  // 样本管理子页面
  new: '新建',
  import: '批量导入',
  // 实验中心子页面
  sequencers: '测序仪',
  // 数据管理子页面
  samplesheet: '上机表',
  matching: '数据匹配',
  // 流程中心子页面
  bed: 'BED 文件',
  'gene-list': '基因列表',
  database: '数据库管理',
  baseline: '基线管理',
  templates: '报告模板',
  config: '流程配置',
  // 分析中心子页面
  running: '进行中',
  pending: '待解读',
  completed: '已完成',
  // 报告中心子页面
  review: '待审核',
  released: '已发放',
  // 知识中心子页面
  history: '历史检出位点',
  variants: '位点收录库',
  // 系统设置子页面
  permissions: '权限管理',
  ai: 'AI 设置',
  // 管理中心
  admin: '管理中心',
};

/**
 * 一级路径对应的默认子页面标签
 */
const defaultSubPageMap: Record<string, string> = {
  '/samples': '样本列表',
  '/lab': '上机表',
  '/data': '数据列表',
  '/pipeline': '流程列表',
  '/analysis': '任务列表',
  '/reports': '报告列表',
  '/knowledge': '知识库概览',
  '/settings': '个人设置',
};

/**
 * Generate breadcrumbs from pathname
 */
function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    // Find label from navigation config or path label map
    const navItem = mainNavItems.find(item => item.href === `/${segment}`);
    const label = navItem?.label || pathLabelMap[segment] || segment;
    items.push({ label, href: currentPath });
  }

  // 如果是一级路径，添加默认子页面标签
  const defaultSubPage = defaultSubPageMap[pathname];
  if (defaultSubPage) {
    items.push({ label: defaultSubPage });
  }

  // Last item should not have href (current page)
  if (items.length > 0) {
    delete items[items.length - 1].href;
  }

  return items;
}

/**
 * AppShell provides the main application layout structure.
 * Includes Sidebar with navigation and Main Content area.
 * Handles responsive behavior for different viewport sizes.
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarState();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Auto-collapse sidebar on tablet (only on initial detection)
  const hasAutoCollapsed = React.useRef(false);
  React.useEffect(() => {
    if (isTablet && !collapsed && !hasAutoCollapsed.current) {
      setCollapsed(true);
      hasAutoCollapsed.current = true;
    }
    // Reset when leaving tablet mode
    if (!isTablet) {
      hasAutoCollapsed.current = false;
    }
  }, [isTablet, collapsed, setCollapsed]);

  // Determine current section from pathname
  const currentSection = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    return segments[0] || 'samples';
  }, [pathname]);

  // Generate breadcrumbs from pathname
  const breadcrumbs = React.useMemo(() => getBreadcrumbs(pathname), [pathname]);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        {/* Mobile Header */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent-emphasis rounded-md flex items-center justify-center">
              <span className="text-fg-on-emphasis font-bold text-sm">🧬</span>
            </div>
            <span className="font-semibold text-fg-default">绳墨生物</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-canvas-inset"
            aria-label="Toggle menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </header>
        {mobileMenuOpen && (
          <MobileNav
            currentSection={currentSection}
            onClose={() => setMobileMenuOpen(false)}
          />
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-canvas">
      {/* Sidebar */}
      <SidebarNav
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border bg-canvas shrink-0">
          {/* Left: Breadcrumbs */}
          <div className="flex-1 min-w-0">
            {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
          </div>

          {/* Right: Settings + About + Privacy */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-inset transition-colors"
              aria-label="系统设置"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-inset transition-colors"
              aria-label="关于"
            >
              <Info className="w-5 h-5" />
            </Link>
            <Link
              href="/privacy"
              className="p-2 rounded-md text-fg-muted hover:text-fg-default hover:bg-canvas-inset transition-colors"
              aria-label="隐私协议"
            >
              <Shield className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
