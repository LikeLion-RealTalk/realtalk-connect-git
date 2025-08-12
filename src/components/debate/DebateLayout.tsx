import { ReactNode } from 'react';

interface DebateLayoutProps {
  children: ReactNode;
}

export function DebateLayout({ children }: DebateLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}