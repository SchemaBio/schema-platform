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
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-success-emphasis via-success-fg to-success-emphasis relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl opacity-5" />
        </div>
        
        {/* DNA 螺旋装饰线条 */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none">
            <path d="M200 0 Q400 200 200 400 Q0 600 200 800" stroke="white" strokeWidth="2" fill="none" />
            <path d="M600 0 Q400 200 600 400 Q800 600 600 800" stroke="white" strokeWidth="2" fill="none" />
            <path d="M200 100 L600 100" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M250 200 L550 200" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M200 300 L600 300" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M250 400 L550 400" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M200 500 L600 500" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M250 600 L550 600" stroke="white" strokeWidth="1" opacity="0.5" />
            <path d="M200 700 L600 700" stroke="white" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
              <Image
                src="/logo.png"
                alt="Schema"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
              绳墨生物
            </h1>
            <p className="text-xl xl:text-2xl text-white/80 font-light">
              Schema Germline
            </p>
          </div>

          {/* 描述 */}
          <div className="space-y-4 text-white/70">
            <p className="text-lg">
              专业的遗传病基因组分析平台
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                胚系变异检测与 ACMG 分级
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                家系分析与遗传模式推断
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                CNV/SV 结构变异分析
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                遗传咨询报告生成与审核
              </li>
            </ul>
          </div>

          {/* 底部版权 */}
          <div className="absolute bottom-8 left-12 xl:left-20 text-white/40 text-sm">
            © 2024 绳墨生物科技
          </div>
        </div>
      </div>

      {/* 右侧 - 登录表单区 */}
      <div className="flex-1 flex items-center justify-center bg-canvas-default p-8">
        <div className="w-full max-w-md">
          {/* 移动端 Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success-emphasis rounded-2xl mb-4">
              <Image
                src="/logo.png"
                alt="Schema"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-semibold text-fg-default">绳墨生物</h1>
            <p className="text-fg-muted mt-1">遗传病基因组分析系统</p>
          </div>

          {/* 登录标题 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-fg-default">欢迎回来</h2>
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
              <label htmlFor="username" className="block text-sm font-medium text-fg-default mb-1.5">
                用户名
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-fg-default mb-1.5">
                密码
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg-default transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 记住我 & 忘记密码 */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border-default text-success-emphasis focus:ring-success-emphasis"
                />
                <span className="text-fg-muted">记住我</span>
              </label>
              <button type="button" className="text-success-fg hover:underline">
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
