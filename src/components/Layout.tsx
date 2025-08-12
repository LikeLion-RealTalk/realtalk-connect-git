import { ReactNode } from 'react';
import { ScrollButtons } from './ScrollButtons';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <ScrollButtons />
    </div>
  );
}