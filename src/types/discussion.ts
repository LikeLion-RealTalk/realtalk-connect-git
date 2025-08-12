// Web Speech API 타입 선언
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// 토론 방식 옵션
export const DEBATE_TYPES = ['일반토론', '3분토론'] as const;
export type DebateType = typeof DEBATE_TYPES[number];

// 토론 진행 상태
export const DISCUSSION_STATUSES = ['진행중', '대기중', '종료됨'] as const;
export type DiscussionStatus = typeof DISCUSSION_STATUSES[number];

// 토론 카테고리
export const DISCUSSION_CATEGORIES = [
  '💕연애',
  '👥친구 & 인간관계',
  '🏠일상 & 라이프스타일',
  '💼취업 & 진로',
  '🔥밈 & 유행',
  '📱SNS & 온라인 문화',
  '🤖AI & 미래사회',
  '🎮게임 & e스포츠',
  '🎭K-콘텐츠',
  '⚖️논란 & 사회 이슈',
  '💰돈 & 소비문화',
  '💬자유 주제'
] as const;
export type DiscussionCategory = typeof DISCUSSION_CATEGORIES[number];

// 토론 입장
export const POSITIONS = ['A입장', 'B입장'] as const;
export type Position = typeof POSITIONS[number];

// 발언자 역할
export const USER_ROLES = ['speaker', 'audience'] as const;
export type UserRole = typeof USER_ROLES[number];

// 발언자 상태
export const SPEAKER_STATUSES = ['발언중', '대기중', '발언완료'] as const;
export type SpeakerStatus = typeof SPEAKER_STATUSES[number];

// 발언 입력 방식
export const SPEECH_INPUT_TYPES = ['voice', 'text'] as const;
export type SpeechInputType = typeof SPEECH_INPUT_TYPES[number];

// 팩트체크 결과
export const FACT_CHECK_RESULTS = ['사실', '거짓', '불분명'] as const;
export type FactCheckResult = typeof FACT_CHECK_RESULTS[number];

// 참여 역할 (한국어)
export const PARTICIPATION_ROLES = ['발언자', '청중'] as const;
export type ParticipationRole = typeof PARTICIPATION_ROLES[number];

// 토론 단계
export const DEBATE_STAGES = ['1. 발언', '2. 논의'] as const;
export type DebateStage = typeof DEBATE_STAGES[number];

// 발언자 수 옵션
export const SPEAKER_OPTIONS = [2, 4, 6, 8] as const;
export type SpeakerCount = typeof SPEAKER_OPTIONS[number];

// 청중 수 옵션
export const AUDIENCE_OPTIONS = [0, 20, 40, 60, 80, 100] as const;
export type AudienceCount = typeof AUDIENCE_OPTIONS[number];

// 토론 시간 옵션 (분)
export const DURATION_OPTIONS = [20, 40, 60, 80] as const;
export type Duration = typeof DURATION_OPTIONS[number];

// 토론방 인터페이스
export interface Discussion {
  id: string;
  type: DebateType;
  status: DiscussionStatus;
  title: string;
  category: DiscussionCategory;
  timeStatus: string;
  speakers: { current: number; max: number };
  audience: { current: number; max: number };
}

// 토론방 생성 데이터 인터페이스
export interface DiscussionData {
  title: string;
  description: string;
  category: DiscussionCategory;
  position: Position;
  aPositionDescription: string; // A입장(첫 번째 입장)에 대한 설명
  bPositionDescription: string; // B입장(두 번째 입장)에 대한 설명
  debateType: DebateType;
  duration: number;
  maxSpeakers: number;
  maxAudience: number;
}

// 필터 옵션 인터페이스
export interface FilterOptions {
  categories: DiscussionCategory[];
  discussionTypes: DebateType[];
  statuses: DiscussionStatus[];
}

// 토론 시간 계산 유틸리티 함수
export const getMinDuration = (speakers: number): number => {
  return speakers * 10;
};

export const getDefaultDuration = (speakers: number): number => {
  return getMinDuration(speakers);
};

export const getAvailableDurations = (speakers: number): Duration[] => {
  const minDuration = getMinDuration(speakers);
  return DURATION_OPTIONS.filter(duration => duration >= minDuration);
};

// 3분토론 시간 계산
export const getThreeMinuteDebateDuration = (speakers: number): number => {
  return speakers === 2 ? 3 : speakers;
};

// AI 토론 요약 관련 타입
export interface DebateSummary {
  id: string;
  discussionId: string;
  debateType: DebateType;
  title: string;
  category: DiscussionCategory;
  duration: number; // 실제 소요 시간 (분)
  participantCount: number;
  keyStatements: {
    aSide: string[];
    bSide: string[];
  };
  publicOpinion: {
    totalVotes: number;
    aPercentage: number;
    bPercentage: number;
  };
  finalConclusion: string;
  summary: string;
  completedAt: Date;
}