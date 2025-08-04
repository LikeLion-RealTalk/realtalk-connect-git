export interface Debate {
  id: string;
  title: string;
  category: string;
  type: 'quick' | 'normal';
  status: 'active' | 'waiting' | 'ended';
  duration: number; // in minutes
  participants: {
    current: number;
    max: number;
  };
  audience: {
    current: number;
    max: number;
  };
  icon: string;
  description?: string;
  date?: string;
}

export interface DebateCategory {
  id: number;
  name: string;
  description: string;
}