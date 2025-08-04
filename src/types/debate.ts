export interface Debate {
  id: string;
  title: string;
  category: string;
  type: 'quick' | 'normal';
  status: 'active' | 'waiting';
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
}

export interface DebateCategory {
  id: number;
  name: string;
  description: string;
}