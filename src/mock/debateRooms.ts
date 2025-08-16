import { DiscussionCategory, DebateType, Position } from '../types/discussion';

export interface DebateRoomInfo {
  id: string;
  title: string;
  category: DiscussionCategory;
  debateType: DebateType;
  isCreatedByUser: boolean;
  userPosition?: Position;
  userRole?: 'SPEAKER' | 'AUDIENCE';
  aDescription: string;
  bDescription: string;
  creator: {
    name: string;
    avatar?: string;
  };
  duration: number;
  maxSpeakers: number;
  maxAudience: number;
  currentSpeakers: number;
  currentAudience: number;
  startTime?: Date;
  remainingTime?: number;
}

// 토론방별 맞춤형 입장 설명 데이터
export const DEBATE_ROOM_CONFIGS: Record<string, Omit<DebateRoomInfo, 'id' | 'isCreatedByUser' | 'userPosition' | 'userRole' | 'currentSpeakers' | 'currentAudience' | 'startTime' | 'remainingTime'>> = {
  'ai-creativity': {
    title: 'AI 시대, 인간의 창의성은 여전히 중요할까?',
    category: '🤖AI & 미래사회',
    debateType: '일반토론',
    aDescription: 'AI는 인간의 창의성을 보완하고 향상시키는 도구',
    bDescription: '진정한 창의성은 인간만이 가진 고유한 능력',
    creator: {
      name: '김민수'
    },
    duration: 40,
    maxSpeakers: 6,
    maxAudience: 20
  },
  'remote-work': {
    title: '원격근무 vs 사무실 근무, 어떤 것이 더 효율적일까?',
    category: '💼취업 & 진로',
    debateType: '일반토론',
    aDescription: '원격근무는 시간 절약과 워라밸로 더 높은 생산성 제공',
    bDescription: '사무실 근무는 직접 소통과 협업으로 더 효과적',
    creator: {
      name: '김민수'
    },
    duration: 60,
    maxSpeakers: 4,
    maxAudience: 30
  },
  'environment-protection': {
    title: '환경보호를 위한 개인의 실천, 어디까지 해야 할까?',
    category: '⚖️논란 & 사회 이슈',
    debateType: '일반토론',
    aDescription: '개인의 작은 실천들이 모여 큰 환경 변화를 만듦',
    bDescription: '환경 문제는 구조적 문제로 개인 실천만으론 한계',
    creator: {
      name: '김민수'
    },
    duration: 40,
    maxSpeakers: 6,
    maxAudience: 50
  },
  'metaverse-future': {
    title: '메타버스는 미래의 주류가 될 수 있을까?',
    category: '🤖AI & 미래사회',
    debateType: '3분토론',
    aDescription: '메타버스는 업무, 교육, 엔터테인먼트의 새로운 패러다임',
    bDescription: '메타버스는 기술적 한계로 일시적 트렌드에 그칠 것',
    creator: {
      name: '김민수'
    },
    duration: 6,
    maxSpeakers: 6,
    maxAudience: 15
  }
};

// 토론방 정보 생성 함수
export const getDebateRoomConfig = (roomKey: string): DebateRoomInfo => {
  const config = DEBATE_ROOM_CONFIGS[roomKey] || DEBATE_ROOM_CONFIGS['ai-creativity'];
  return {
    id: `room-${roomKey}`,
    isCreatedByUser: false,
    currentSpeakers: Math.floor(Math.random() * config.maxSpeakers),
    currentAudience: Math.floor(Math.random() * config.maxAudience),
    startTime: new Date(Date.now() - Math.random() * 10 * 60 * 1000), // 0-10분 전에 시작
    remainingTime: config.duration - Math.floor(Math.random() * 10), // 랜덤하게 진행된 시간
    ...config
  };
};