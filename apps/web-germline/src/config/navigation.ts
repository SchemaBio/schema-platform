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
  TestTube,
  Beaker,
  ListTodo,
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
  tasks: SidebarNavItem[];
  pipeline: SidebarNavItem[];
  knowledge: SidebarNavItem[];
  settings: SidebarNavItem[];
}

/**
 * Main navigation items displayed in the sidebar.
 * 业务流程：概览 → 样本管理 → 任务中心 → 知识中心 → 流程中心
 */
export const mainNavItems: NavItem[] = [
  { label: '概览', href: '/dashboard', icon: LayoutDashboard },
  { label: '样本管理', href: '/samples', icon: Users },
  { label: '任务中心', href: '/tasks', icon: ListTodo },
  { label: '知识中心', href: '/knowledge', icon: BookOpen },
  { label: '流程中心', href: '/pipeline', icon: Workflow },
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
    { label: '家系管理', href: '/samples/pedigree', icon: GitBranch },
  ],
  // 任务中心 - 解读工程师操作
  tasks: [
    { label: '任务列表', href: '/tasks', icon: List },
    { label: '进行中', href: '/tasks/running', icon: Clock },
    { label: '待解读', href: '/tasks/pending', icon: FlaskConical },
    { label: '已完成', href: '/tasks/completed', icon: CheckCircle },
  ],
  // 流程中心 - 生信工程师操作
  pipeline: [
    { label: '流程列表', href: '/pipeline', icon: List },
    { label: '基因列表', href: '/pipeline/gene-list', icon: Library },
    { label: 'BED 文件', href: '/pipeline/bed', icon: FileCode },
    { label: '数据库管理', href: '/pipeline/database', icon: Server },
    { label: 'CNV 基线', href: '/pipeline/baseline', icon: TrendingUp },
    { label: '报告模板', href: '/pipeline/templates', icon: FileText },
  ],
  // 知识中心 - 位点知识库
  knowledge: [
    { label: '知识库概览', href: '/knowledge', icon: List },
    { label: '历史检出位点', href: '/knowledge/history', icon: History },
    { label: '位点收录库', href: '/knowledge/variants', icon: Library },
    // { label: '新增位点', href: '/knowledge/new', icon: Plus }, // 暂时关闭
  ],
  // 系统设置
  settings: [
    { label: '个人设置', href: '/settings', icon: User },
    { label: 'AI 设置', href: '/settings/ai', icon: Bot },
    { label: '权限管理', href: '/settings/permissions', icon: Shield },
    { label: '存储管理', href: '/settings/storage', icon: HardDrive },
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
