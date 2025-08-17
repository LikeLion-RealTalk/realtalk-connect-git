// 프론트 타입 import (src/types/discussion.ts 기준)
import type {
  DebateType,
  DiscussionStatus,
  DiscussionCategory,
  Position,
  UserRole,
  Discussion,
  DiscussionData,
  DebateSummary
} from 'src/types/discussion'; // <- 실제 경로로 바꿔줘

/** --------------------------
 *  백엔드 코드 → 프론트 라벨 매핑
 *  -------------------------- */

// 토론 유형
const BE_DEBATE_TYPE_TO_FE: Record<string, DebateType> = {
  NORMAL: '일반토론',
  FAST_3M: '3분토론',
};

// 진행 상태
const BE_STATUS_TO_FE: Record<string, DiscussionStatus> = {
  WAITING: '대기중',
  ACTIVE: '진행중',
  EXTENDED: '진행중', // 백엔드 확장 상태는 프론트 '진행중'으로 묶기
  FINISHED: '종료됨',
};

// 참여 역할
const BE_ROLE_TO_FE: Record<string, UserRole> = {
  SPEAKER: 'speaker',
  AUDIENCE: 'audience',
};

// 포지션/입장
const BE_SIDE_TO_FE: Record<string, Position> = {
  A: 'A입장',
  B: 'B입장',
};

// 프론트 → 백엔드 역매핑
const FE_DEBATE_TYPE_TO_BE: Record<DebateType, string> = {
  '일반토론': 'NORMAL',
  '3분토론': 'FAST_3M',
};
const FE_STATUS_TO_BE: Record<DiscussionStatus, string> = {
  '대기중': 'WAITING',
  '진행중': 'ACTIVE',
  '종료됨': 'FINISHED',
};
const FE_ROLE_TO_BE: Record<UserRole, string> = {
  speaker: 'SPEAKER',
  audience: 'AUDIENCE',
};
const FE_SIDE_TO_BE: Record<Position, 'A' | 'B'> = {
  'A입장': 'A',
  'B입장': 'B',
};

/** ---------------------------------------
 *  카테고리 라벨 정규화 (백엔드 ↔ 프론트 이름 다를 수 있음)
 *  --------------------------------------- */

// 백엔드가 이모지 없는 이름을 줄 수 있으니, 프론트의 상수 라벨로 정규화
const CATEGORY_NAME_CANONICAL_MAP: Record<string, DiscussionCategory> = {
  '연애': '💕연애',
  '친구 & 인간관계': '👥친구 & 인간관계',
  '일상 & 라이프스타일': '🏠일상 & 라이프스타일',
  '취업 & 진로': '💼취업 & 진로',
  '밈 & 유행': '🔥밈 & 유행',
  'SNS & 온라인 문화': '📱SNS & 온라인 문화',
  'AI & 미래사회': '🤖AI & 미래사회',
  '게임 & e스포츠': '🎮게임 & e스포츠',
  'K-콘텐츠': '🎭K-콘텐츠',
  '논란 & 사회 이슈': '⚖️논란 & 사회 이슈',
  '돈 & 소비문화': '💰돈 & 소비문화',
  '자유 주제': '💬자유 주제',
};

// 백엔드 → 프론트 카테고리 이름 정규화
function normalizeCategoryName(name: string): DiscussionCategory {
  // 이미 프론트 라벨이면 그대로 반환
  if (Object.values(CATEGORY_NAME_CANONICAL_MAP).includes(name as DiscussionCategory)) {
    return name as DiscussionCategory;
  }
  // 이모지 없는 이름 → 라벨로 변환
  const canonical = CATEGORY_NAME_CANONICAL_MAP[name];
  if (canonical) return canonical;

  // 미정의인 경우: 마지막 항목으로 폴백(또는 throw)
  return '💬자유 주제';
}

/** --------------------------
 *  공용 포맷터
 *  -------------------------- */

export function formatElapsed(seconds: number | undefined): string {
  if (!seconds || seconds < 0) return '0초 경과';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}초 경과`;
  return `${m}분 ${s}초 경과`;
}

/** --------------------------
 *  백엔드 DTO 타입(최소 정의)
 *  -------------------------- */

// 상세/목록 공통으로 쓰는 카테고리 DTO
export interface CategoryDto {
  id: number;
  name: string;        // 백엔드가 이모지 없이 줄 수 있음
  description?: string;
}

// 상세 응답 DTO (백엔드)
export interface DebateRoomDto {
  roomUUID: string;
  title: string;
  status: string;              // WAITING | ACTIVE | EXTENDED | FINISHED
  category: CategoryDto;
  sideA: string;
  sideB: string;
  maxSpeaker: number;
  maxAudience: number;
  currentSpeaker: number;
  currentAudience: number;
  elapsedSeconds: number;
  debateType?: string;         // NORMAL | FAST_3M (선택적)
}

// 목록 아이템(요약) DTO (백엔드)
export interface DebateRoomSummaryDto {
  roomUUID: string;
  title: string;
  category: CategoryDto;
  summary?: string;
}

/** --------------------------
 *  매핑: 백엔드 → 프론트
 *  -------------------------- */

// 상세: DebateRoomDto → Discussion
export function toDiscussion(dto: DebateRoomDto): Discussion {
  return {
    id: dto.roomUUID,
    type: dto.debateType ? (BE_DEBATE_TYPE_TO_FE[dto.debateType] ?? '일반토론') : '일반토론',
    status: BE_STATUS_TO_FE[dto.status] ?? '대기중',
    title: dto.title,
    category: normalizeCategoryName(dto.category.name),
    timeStatus: formatElapsed(dto.elapsedSeconds),
    speakers: { current: dto.currentSpeaker, max: dto.maxSpeaker },
    audience: { current: dto.currentAudience, max: dto.maxAudience },
  };
}

// 목록: DebateRoomSummaryDto → Discussion(카드용 최소 필드 구축)
// elapsedSeconds / current 수치가 없으면 0 처리하거나 서버 확장 필요
export function toDiscussionFromSummary(dto: DebateRoomSummaryDto): Discussion {
  return {
    id: dto.roomUUID,
    type: '일반토론', // 서버에서 주면 매핑, 아니면 기본값
    status: '대기중', // 목록에 상태 없으면 기본값(서버 확장 추천)
    title: dto.title,
    category: normalizeCategoryName(dto.category.name),
    timeStatus: '0초 경과',
    speakers: { current: 0, max: 0 },
    audience: { current: 0, max: 0 },
  };
}

// 카테고리 배열: BE → FE (페이징 없음)
export function toFrontendCategories(categories: CategoryDto[]): DiscussionCategory[] {
  return categories.map((c) => normalizeCategoryName(c.name));
}

/** --------------------------
 *  매핑: 프론트 → 백엔드 (요청)
 *  -------------------------- */

// 방 생성 데이터 → 백엔드 생성 요청 payload
// - categoryId는 프론트가 이미 선택한 카테고리의 id를 알고 있어야 정확함
//   (모르면 resolveCategoryId() 주입해서 매핑)
export interface CreateRoomRequest {
  title: string;
  a_description: string;
  b_description: string;
  categoryId: number;
  debate_type: string; // NORMAL | FAST_3M
  duration: number;    // 초 단위
  maxSpeakers: number;
  maxAudience: number;
  position: 'A' | 'B'; // 생성자 입장
}

// label→id 매핑이 필요하면 resolver를 주입
export function toCreateRoomRequest(
    data: DiscussionData,
    opts: {
      categoryId?: number;
      resolveCategoryId?: (label: DiscussionCategory) => number;
    }
): CreateRoomRequest {
  const categoryId =
      opts.categoryId ??
      opts.resolveCategoryId?.(data.category);

  if (typeof categoryId !== 'number') {
    throw new Error('categoryId를 알 수 없습니다. opts.categoryId 또는 resolveCategoryId를 전달하세요.');
  }

  return {
    title: data.title,
    a_description: data.aPositionDescription,
    b_description: data.bPositionDescription,
    categoryId,
    debate_type: FE_DEBATE_TYPE_TO_BE[data.debateType],
    duration: data.duration * 60, // 분 → 초
    maxSpeakers: data.maxSpeakers,
    maxAudience: data.maxAudience,
    position: FE_SIDE_TO_BE[data.position],
  };
}

// 포지션/역할/상태 등 역매핑 유틸(필요 시 노출)
export const mapRoleToBE = (role: UserRole) => FE_ROLE_TO_BE[role];
export const mapSideToBE = (side: Position) => FE_SIDE_TO_BE[side];
export const mapStatusToBE = (status: DiscussionStatus) => FE_STATUS_TO_BE[status];
export const mapDebateTypeToBE = (type: DebateType) => FE_DEBATE_TYPE_TO_BE[type];

/** --------------------------
 *  AI 요약/최종 리포트 등 추가 매핑 예시 (원하면 확장)
 *  -------------------------- */

// 서버가 debate_final_reports/ai_summaries를 내려줄 때 프론트 Summary로 매핑
export interface DebateFinalReportDto {
  roomUUID: string;
  title: string;
  category: CategoryDto;
  durationMinutes: number;
  participantCount: number;
  keyStatements: { aSide: string[]; bSide: string[] };
  publicOpinion?: { totalVotes: number; aPercentage: number; bPercentage: number };
  finalConclusion?: string;
  summary: string;
  created_at: string;
}

export function toDebateSummary(dto: DebateFinalReportDto): DebateSummary {
  return {
    id: dto.roomUUID,
    discussionId: dto.roomUUID,
    debateType: '일반토론', // 서버에서 코드 주면 매핑
    title: dto.title,
    category: normalizeCategoryName(dto.category.name),
    duration: dto.durationMinutes,
    participantCount: dto.participantCount,
    keyStatements: dto.keyStatements,
    publicOpinion: dto.publicOpinion ?? { totalVotes: 0, aPercentage: 0, bPercentage: 0 },
    finalConclusion: dto.finalConclusion ?? '',
    summary: dto.summary,
    completedAt: new Date(dto.created_at),
  };
}
