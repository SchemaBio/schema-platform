import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: '绳墨生物 - 遗传病分析平台',
  description: '专业的全外显子遗传病基因组分析系统',
  keywords: ['基因组分析', '遗传病', 'ACMG', '变异分析', '全外显子'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
