import {
  Users,
  Plus,
  GitBranch,
  List,
  Upload,
  FileSpreadsheet,
  Database,
  HardDrive,
  FlaskConical,
  Play,
  Clock,
  CheckCircle,
  FileText,
  FilePlus,
  FileCheck,
  Send,
  Settings,
  User,
  Shield,
  Bot,
  Workflow,
  FileCode,
  Server,
  TrendingUp,
  BookOpen,
  History,
  Library,
  LayoutDashboard,
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
  data: SidebarNavItem[];
  pipeline: SidebarNavItem[];
  analysis: SidebarNavItem[];
  reports: SidebarNavItem[];
  knowledge: SidebarNavItem[];
  settings: SidebarNavItem[];
}

/**
 * Main navigation items displayed in the sidebar.
 * 业务流程：概览 → 样本管理 → 数据管理 → 流程中心 → 分析中心 → 报告中心 → 知识中心
 */
export const mainNavItems: NavItem[] = [
  { label: '概览', href: '/dashboard', icon: LayoutDashboard },
  { label: '样本管理', href: '/samples', icon: Users },
  { label: '数据管理', href: '/data', icon: HardDrive },
  { label: '流程中心', href: '/pipeline', icon: Workflow },
  { label: '分析中心', href: '/analysis', icon: FlaskConical },
  { label: '报告中心', href: '/reports', icon: FileText },
  { label: '知识中心', href: '/knowledge', icon: BookOpen },
];

/**
 * Sidebar navigation configuration for each section.
 */
export const sidebarNavConfig: SidebarNavConfig = {
  // 概览 - 无子菜单
  dashboard: [],
  // 样本管理 - 实验员操作
  samples: [
    { label: '样本列表', href: '/samples', icon: List },
    { label: '新建样本', href: '/samples/new', icon: Plus },
    { label: '批量导入', href: '/samples/import', icon: Upload },
    { label: '家系管理', href: '/samples/pedigree', icon: GitBranch },
  ],
  // 数据管理 - 实验员操作
  data: [
    { label: '数据列表', href: '/data', icon: List },
    { label: '上机表', href: '/data/samplesheet', icon: FileSpreadsheet },
    { label: '数据匹配', href: '/data/matching', icon: Database },
  ],
  // 流程中心 - 生信工程师操作
  pipeline: [
    { label: '流程列表', href: '/pipeline', icon: List },
    { label: 'BED 文件', href: '/pipeline/bed', icon: FileCode },
    { label: '数据库管理', href: '/pipeline/database', icon: Server },
    { label: '基线文件', href: '/pipeline/baseline', icon: TrendingUp },
    { label: '流程配置', href: '/pipeline/config', icon: Settings },
  ],
  // 分析中心 - 解读工程师操作
  analysis: [
    { label: '任务列表', href: '/analysis', icon: List },
    { label: '新建任务', href: '/analysis/new', icon: Play },
    { label: '进行中', href: '/analysis/running', icon: Clock },
    { label: '待解读', href: '/analysis/pending', icon: FlaskConical },
    { label: '已完成', href: '/analysis/completed', icon: CheckCircle },
  ],
  // 报告中心 - 解读工程师/审核操作
  reports: [
    { label: '报告列表', href: '/reports', icon: List },
    { label: '生成报告', href: '/reports/new', icon: FilePlus },
    { label: '待审核', href: '/reports/review', icon: FileCheck },
    { label: '已发放', href: '/reports/released', icon: Send },
  ],
  // 知识中心 - 位点知识库
  knowledge: [
    { label: '知识库概览', href: '/knowledge', icon: List },
    { label: '历史检出位点', href: '/knowledge/history', icon: History },
    { label: '位点收录库', href: '/knowledge/variants', icon: Library },
    { label: '新增位点', href: '/knowledge/new', icon: Plus },
  ],
  // 系统设置
  settings: [
    { label: '个人设置', href: '/settings', icon: User },
    { label: 'AI 设置', href: '/settings/ai', icon: Bot },
    { label: '权限管理', href: '/settings/permissions', icon: Shield },
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
