'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar, Tooltip } from '@schema/ui-kit';
import { LogOut, Settings, User } from 'lucide-react';

interface UserMenuProps {
  collapsed?: boolean;
}

interface UserData {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar: string | null;
}

/**
 * UserMenu displays user avatar and dropdown menu with account options.
 */
export function UserMenu({ collapsed = false }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState<UserData | null>(null);
  const router = useRouter();

  // 从 localStorage 获取用户信息
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setOpen(false);
    router.push('/login');
  };

  // 如果没有用户信息，显示默认头像
  const displayUser = user || {
    name: '未登录',
    username: '',
    role: 'guest',
    avatar: null,
  };

  const triggerButton = (
    <PopoverPrimitive.Trigger asChild>
      <button
        className={`
          flex items-center gap-2 rounded-md transition-all duration-fast
          hover:bg-canvas-inset p-1.5
          ${collapsed ? 'justify-center' : 'w-full'}
        `}
        aria-label="用户菜单"
      >
        <Avatar
          src={displayUser.avatar || undefined}
          name={displayUser.name}
          size="small"
          className="bg-accent-emphasis text-white ring-2 ring-accent-muted"
        />
        {!collapsed && (
          <span className="text-sm text-fg-default truncate">{displayUser.name}</span>
        )}
      </button>
    </PopoverPrimitive.Trigger>
  );

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      {collapsed ? (
        <Tooltip content={displayUser.name} placement="right" variant="nav">
          {triggerButton}
        </Tooltip>
      ) : (
        triggerButton
      )}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'start' : 'center'}
          sideOffset={4}
          className="z-50 w-56 rounded-md border border-border bg-canvas shadow-md"
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-fg-default">{displayUser.name}</p>
            <p className="text-xs text-fg-muted">@{displayUser.username || 'guest'}</p>
          </div>

          {/* Menu items */}
          <div className="py-1 border-b border-border">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-2 w-full px-3 py-2 text-sm text-left
                text-fg-default hover:bg-canvas-subtle
                transition-colors duration-fast
              `}
            >
              <User className="w-4 h-4" />
              个人设置
            </Link>
            {displayUser.role === 'admin' && (
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-2 w-full px-3 py-2 text-sm text-left
                  text-fg-default hover:bg-canvas-subtle
                  transition-colors duration-fast
                `}
              >
                <Settings className="w-4 h-4" />
                系统设置
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className={`
                flex items-center gap-2 w-full px-3 py-2 text-sm text-left
                text-danger-fg hover:bg-danger-subtle
                transition-colors duration-fast
              `}
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
