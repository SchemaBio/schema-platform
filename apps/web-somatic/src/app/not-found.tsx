import Link from 'next/link';

/**
 * 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-fg-muted mb-4">404</h1>
        <h2 className="text-xl font-semibold text-fg-default mb-2">
          页面未找到
        </h2>
        <p className="text-fg-muted mb-6">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Link
          href="/samples"
          className="inline-flex items-center px-4 py-2 rounded-md bg-accent-emphasis text-fg-on-emphasis hover:bg-accent-fg transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
