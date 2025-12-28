import {
  Users,
  Plus,
  GitBranch,
  HardDrive,
  FolderOpen,
  Upload,
  FlaskConical,
  List,
  Play,
  Clock,
  CheckCircle,
  Settings,
  User,
  Shield,
  Bot,
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
  samples: SidebarNavItem[];
  data: SidebarNavItem[];
  analysis: SidebarNavItem[];
  settings: SidebarNavItem[];
}

/**
 * Main navigation items displayed in the sidebar.
 * 核心业务流程：样本管理 → 数据管理 → 分析中心
 */
export const mainNavItems: NavItem[] = [
  { label: '样本管理', href: '/samples', icon: Users },
  { label: '数据管理', href: '/data', icon: HardDrive },
  { label: '分析中心', href: '/analysis', icon: FlaskConical },
];

/**
 * Sidebar navigation configuration for each section.
 */
export const sidebarNavConfig: SidebarNavConfig = {
  samples: [
    { label: '样本列表', href: '/samples', icon: List },
    { label: '新建样本', href: '/samples/new', icon: Plus },
    { label: '家系管理', href: '/samples/pedigree', icon: GitBranch },
  ],
  data: [
    { label: '数据列表', href: '/data', icon: List },
    { label: '数据源配置', href: '/data/sources', icon: FolderOpen },
    { label: '数据导入', href: '/data/import', icon: Upload },
  ],
  analysis: [
    { label: '任务列表', href: '/analysis', icon: List },
    { label: '新建任务', href: '/analysis/new', icon: Play },
    { label: '进行中', href: '/analysis/running', icon: Clock },
    { label: '已完成', href: '/analysis/completed', icon: CheckCircle },
  ],
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
