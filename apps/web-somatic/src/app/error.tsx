'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary component for handling runtime errors.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center px-4 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-subtle flex items-center justify-center">
          <svg
            className="w-8 h-8 text-danger-fg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-fg-default mb-2">
          出错了
        </h2>
        <p className="text-fg-muted mb-6">
          抱歉，应用程序遇到了一个错误。请尝试刷新页面或稍后再试。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-4 py-2 rounded-md bg-accent-emphasis text-fg-on-emphasis hover:bg-accent-fg transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
}
