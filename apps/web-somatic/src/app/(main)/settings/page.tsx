'use client';

import { PageContent } from '@/components/layout';
import { ProfileSettings } from './components/ProfileSettings';

// 模拟当前用户数据
const mockCurrentUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '138****1234',
  role: 'admin' as const,
  avatar: '',
};

export default function SettingsProfilePage() {
  return (
    <PageContent>
      <h2 className="text-lg font-medium text-fg-default mb-4">个人设置</h2>
      <ProfileSettings user={mockCurrentUser} />
    </PageContent>
  );
}
