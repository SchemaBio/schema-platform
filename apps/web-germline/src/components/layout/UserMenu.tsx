'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Avatar } from '@schema/ui-kit';
import { LogOut } from 'lucide-react';

/**
 * UserMenu displays user avatar and dropdown menu with account options.
 */
export function UserMenu() {
  const [open, setOpen] = React.useState(false);

  // Mock user data - to be replaced with actual auth
  const user = {
    name: '张医生',
    email: 'zhang@example.com',
    avatar: undefined as string | undefined,
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout');
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          className="rounded-full hover:ring-2 hover:ring-accent-muted transition-all duration-fast"
          aria-label="用户菜单"
        >
          <Avatar
            src={user.avatar}
            name={user.name}
            size="medium"
          />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50 w-56 rounded-md border border-border bg-canvas shadow-md"
        >
          {/* User info */}
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-medium text-fg-default">{user.name}</p>
            <p className="text-xs text-fg-muted">{user.email}</p>
          </div>

          {/* Actions */}
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
