import {
  Folder,
  Dna,
  FileText,
  BookOpen,
  Settings,
  List,
  Plus,
  Users,
  Layers,
  Table,
  CheckSquare,
  GitBranch,
  Eye,
  File,
  FilePlus,
  ClipboardCheck,
  Layout,
  Link,
  Database,
  Tag,
  User,
  Filter,
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
  samples: SidebarNavItem[];
  analysis: SidebarNavItem[];
  reports: SidebarNavItem[];
  knowledge: SidebarNavItem[];
  settings: SidebarNavItem[];
}

/**
 * Main navigation items displayed in the header.
 */
export const mainNavItems: NavItem[] = [
  { label: '样本管理', href: '/samples', icon: Folder },
  { label: '变异分析', href: '/analysis', icon: Dna },
  { label: '报告中心', href: '/reports', icon: FileText },
  { label: '知识库', href: '/knowledge', icon: BookOpen },
  { label: '设置', href: '/settings', icon: Settings },
];

/**
 * Sidebar navigation configuration for each section.
 */
export const sidebarNavConfig: SidebarNavConfig = {
  samples: [
    { label: '样本列表', href: '/samples', icon: List },
    { label: '新建样本', href: '/samples/new', icon: Plus },
    { label: '家系管理', href: '/samples/pedigree', icon: Users },
    { label: '批次管理', href: '/samples/batches', icon: Layers },
  ],
  analysis: [
    { label: '变异列表', href: '/analysis', icon: Table },
    { label: 'ACMG 打分', href: '/analysis/acmg', icon: CheckSquare },
    { label: '家系分析', href: '/analysis/pedigree', icon: GitBranch },
    { label: 'IGV 浏览器', href: '/analysis/igv', icon: Eye },
  ],
  reports: [
    { label: '报告列表', href: '/reports', icon: File },
    { label: '新建报告', href: '/reports/new', icon: FilePlus },
    { label: '审核队列', href: '/reports/review', icon: ClipboardCheck },
    { label: '模板管理', href: '/reports/templates', icon: Layout },
  ],
  knowledge: [
    { label: '基因-疾病', href: '/knowledge', icon: Link },
    { label: '本地变异库', href: '/knowledge/variants', icon: Database },
    { label: 'HPO 表型', href: '/knowledge/hpo', icon: Tag },
    { label: '解读模板', href: '/knowledge/templates', icon: FileText },
  ],
  settings: [
    { label: '个人设置', href: '/settings', icon: User },
    { label: '团队管理', href: '/settings/team', icon: Users },
    { label: '筛选策略', href: '/settings/filters', icon: Filter },
    { label: '审计日志', href: '/settings/audit', icon: History },
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
