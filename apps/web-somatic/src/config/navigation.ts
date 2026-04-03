import {
  Users,
  List,
  HardDrive,
  FileText,
  Settings,
  User,
  Shield,
  Bot,
  Workflow,
  FileCode,
  TrendingUp,
  Library,
  LayoutDashboard,
  Activity,
  ListTodo,
  History,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  children?: SidebarNavItem[];
}

export interface SidebarNavConfig {
  dashboard: SidebarNavItem[];
  samples: SidebarNavItem[];
  analysis: SidebarNavItem[];
  pipeline: SidebarNavItem[];
  history: SidebarNavItem[];
  settings: SidebarNavItem[];
}

/**
 * Main navigation items displayed in the sidebar.
 * 业务流程：概览 → 样本管理 → 任务中心 → 历史检出 → 流程中心
 */
export const mainNavItems: NavItem[] = [
  { label: '概览', href: '/dashboard', icon: LayoutDashboard },
  { label: '样本管理', href: '/samples', icon: Users },
  { label: '任务中心', href: '/analysis', icon: ListTodo },
  { label: '历史检出', href: '/history', icon: History },
  { label: '流程中心', href: '/pipeline', icon: Workflow },
];

/**
 * Sidebar navigation configuration for each section.
 */
export const sidebarNavConfig: SidebarNavConfig = {
  // 概览 - 无子菜单
  dashboard: [],
  // 样本管理
  samples: [
    { label: '样本列表', href: '/samples', icon: List },
  ],
  // 任务中心（合并报告中心）- 无子菜单
  analysis: [],
  // 流程中心
  pipeline: [
    { label: '流程列表', href: '/pipeline', icon: List },
    { label: 'BED 文件', href: '/pipeline/bed', icon: FileCode },
    { label: '基因列表', href: '/pipeline/gene-list', icon: Library },
    { label: 'CNV 基线', href: '/pipeline/baseline', icon: TrendingUp },
    { label: 'MSI 基线', href: '/pipeline/msi-baseline', icon: Activity },
    { label: '报告模板', href: '/pipeline/templates', icon: FileText },
  ],
  // 历史检出 - 无子菜单
  history: [],
  // 系统设置
  settings: [
    { label: '个人设置', href: '/settings', icon: User },
    { label: 'AI 设置', href: '/settings/ai', icon: Bot },
    { label: '权限管理', href: '/settings/permissions', icon: Shield },
    { label: '管理员设置', href: '/settings/storage', icon: HardDrive },
  ],
};

/**
 * Get the section key from a pathname.
 */
export function getSectionFromPath(pathname: string): keyof SidebarNavConfig {
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] || 'samples';

  if (section in sidebarNavConfig) {
    return section as keyof SidebarNavConfig;
  }

  return 'samples';
}

/**
 * Check if a navigation item is active based on the current path.
 */
export function isNavItemActive(itemHref: string, currentPath: string): boolean {
  // Exact match for root paths
  if (itemHref === currentPath) {
    return true;
  }

  // Check if current path starts with item href (for nested routes)
  // But only if item href is not just a section root
  const itemSegments = itemHref.split('/').filter(Boolean);
  const currentSegments = currentPath.split('/').filter(Boolean);

  if (itemSegments.length === 1) {
    // Section root: only match if first segment matches
    return currentSegments[0] === itemSegments[0];
  }

  // For nested items, check prefix match
  return currentPath.startsWith(itemHref);
}