import { ReactNode } from 'react';
import { TopNav } from '../TopNav';
import { Footer } from '../Footer';
import { Layout } from '../Layout';

interface BrowserLayoutProps {
  children: ReactNode;
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
}

export function BrowserLayout({ children, onNavigate }: BrowserLayoutProps) {
  return (
    <Layout>
      <TopNav onNavigate={onNavigate} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </Layout>
  );
}