import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/providers';
import PwaRegister from '../components/PwaRegister';

export const metadata: Metadata = {
  title: 'مدار — منصة التعلّم',
  description: 'منصة سحابية متطورة لإدارة التعلم، الفصول المباشرة، وحضور الطلاب والتقييمات',
  manifest: '/manifest.json',
  themeColor: '#04c3c9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <PwaRegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
