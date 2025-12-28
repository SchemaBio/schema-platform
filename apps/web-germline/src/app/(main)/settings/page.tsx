'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { User, Shield } from 'lucide-react';

// 模拟当前用户数据
const mockCurrentUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '138****1234',
  role: 'admin' as const,
  avatar: '',
};

type TabType = 'profile' | 'permissions';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>('profile');
  const isAdmin = mockCurrentUser.role === 'admin';

  const tabs = [
    { id: 'profile' as const, label: '个人设置', icon: User },
    ...(isAdmin ? [{ id: 'permissions' as const, label: '权限管理', icon: Shield }] : []),
  ];

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">系统设置</h2>
      
      {/* Tab 导航 */}
      <div className="flex border-b border-border mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-medium
                border-b-2 -mb-px transition-colors
                ${activeTab === tab.id
                  ? 'border-accent-emphasis text-accent-fg'
                  : 'border-transparent text-fg-muted hover:text-fg-default'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      {activeTab === 'profile' && <ProfileSettings user={mockCurrentUser} />}
      {activeTab === 'permissions' && isAdmin && <PermissionsManagement />}
    </PageContent>
  );
}

// 导入子组件
import { ProfileSettings } from './components/ProfileSettings';
import { PermissionsManagement } from './components/PermissionsManagement';
