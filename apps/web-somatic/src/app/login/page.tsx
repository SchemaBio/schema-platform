'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Input } from '@schema/ui-kit';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    
    // Demo 模式：模拟登录验证
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo 账号验证
    if (username === 'demo' && password === 'demo123') {
      // 存储登录状态
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-001',
        username: 'demo',
        name: '演示用户',
        role: 'analyst',
        avatar: null,
      }));
      router.push('/dashboard');
    } else {
      setError('用户名或密码错误');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧 - 品牌展示区 */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden items-center justify-center">
        {/* 背景图片 */}
        <Image
          src="/login-bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />

        {/* 内容 */}
        <div className="relative z-10 flex items-center justify-center">
          <div className="text-left">
            <h1 className="text-2xl xl:text-3xl font-bold text-black tracking-wide leading-tight">
              Open Source<br />Genetic Exploration
            </h1>
            <p className="text-2xl xl:text-3xl font-bold text-black tracking-wide mt-2">
              Somatic
            </p>
          </div>
        </div>
      </div>

      {/* 右侧 - 登录表单区 */}
      <div className="flex-1 flex items-center justify-center bg-canvas-default p-8">
        <div className="w-full max-w-md">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-emphasis rounded-2xl mb-4">
              <Image
                src="/logo.png"
                alt="Schema"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-fg-default">绳墨生物</h1>
            <p className="text-fg-muted mt-1">肿瘤基因组分析系统</p>
          </div>

          {/* 登录标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-fg-default">开放分析平台</h2>
            <p className="text-fg-muted mt-1">请登录您的账号</p>
          </div>

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 错误提示 */}
            {error && (
              <div className="p-3 rounded-md bg-danger-subtle text-danger-fg text-sm">
                {error}
              </div>
            )}

            {/* 用户名 */}
            <div>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="用户名"
                autoComplete="username"
                autoFocus
                className="h-12 text-base"
              />
            </div>

            {/* 密码 */}
            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码"
                  autoComplete="current-password"
                  className="h-12 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-default transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 记住我 & 忘记密码 */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-default text-accent-emphasis focus:ring-accent-emphasis"
                />
                <span className="text-fg-muted">记住我</span>
              </label>
              <button type="button" className="text-accent-fg hover:underline">
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
              leftIcon={loading ? undefined : <LogIn className="w-4 h-4" />}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* Demo 提示 */}
          <div className="mt-8 pt-6 border-t border-border-default">
            <p className="text-xs text-fg-muted text-center mb-3">Demo 演示账号</p>
            <div className="bg-canvas-subtle rounded-md p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-fg-muted">用户名：</span>
                <code className="text-fg-default font-mono">demo</code>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-fg-muted">密码：</span>
                <code className="text-fg-default font-mono">demo123</code>
              </div>
            </div>
          </div>

          {/* 移动端底部信息 */}
          <p className="lg:hidden text-center text-xs text-fg-muted mt-8">
            © 2024 绳墨生物科技. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
