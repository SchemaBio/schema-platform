'use client';

import * as React from 'react';
import { PageContent } from '@/components/layout';
import { StorageManagement } from '../components/StorageManagement';

// 模拟当前用户角色
const mockUserRole = 'admin'; // 'admin' | 'user'

export default function StorageSettingsPage() {
  // 非管理员显示无权限提示
  if (mockUserRole !== 'admin') {
    return (
      <PageContent>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-fg-muted">您没有权限访问此页面</p>
            <p className="text-sm text-fg-muted mt-1">请联系管理员获取权限</p>
          </div>
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">存储管理</h2>
      <StorageManagement />
    </PageContent>
  );
}
