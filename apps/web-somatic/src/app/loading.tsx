/**
 * Loading component displayed during route transitions.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-accent-emphasis border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-fg-muted text-sm">加载中...</p>
      </div>
    </div>
  );
}
