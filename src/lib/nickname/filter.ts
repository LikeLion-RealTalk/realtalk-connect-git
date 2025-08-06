// // lib/nickname/filter.ts (한글 + 영어 욕설 필터 통합)

import { extractInitials } from './extract-initials';
import { array as enBadwords } from 'badwords-list';

const badwords = [
  '씨발', 'ㅅㅂ', 'ㅁㅊ', '좆', '섹스', '10새', '애미', '자살'
];

const badInitials = badwords.map(extractInitials);

export function containsBadword(nickname: string): boolean {
  const lower = nickname.toLowerCase();
  const initials = extractInitials(lower);

  // ✅ 한글 비속어 검사 (원문 포함 + 초성 매칭)
  if (badwords.some(word => lower.includes(word))) return true;
  if (badInitials.some(ini => initials.includes(ini))) return true;

  // ✅ 영어 비속어 검사 (부분 포함 허용)
  if (enBadwords.some(word => lower.includes(word))) return true;

  return false;
}
