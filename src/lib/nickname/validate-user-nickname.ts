// lib/nickname/validate-user-nickname.ts

import { containsBadword } from './filter';

export type ValidationResult = {
  isValid: boolean;
  reason?: string;
};

export function validateUserNickname(nickname: string): ValidationResult {
  const trimmed = nickname.trim();

  if (!trimmed || trimmed.length === 0) {
    return { isValid: false, reason: '닉네임이 비어 있습니다.' };
  }

  if (trimmed.length > 20) {
    return { isValid: false, reason: '닉네임은 20자 이내여야 합니다.' };
  }

  if (/\s/.test(trimmed)) {
    return { isValid: false, reason: '닉네임에 공백을 포함할 수 없습니다.' };
  }

  // 자음/모음 단독 허용 포함
  if (/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9]/.test(trimmed)) {
    return { isValid: false, reason: '닉네임에 특수문자는 사용할 수 없습니다.' };
  }

  if (containsBadword(trimmed)) {
    return { isValid: false, reason: '부적절한 단어가 포함되어 있습니다.' };
  }

  return { isValid: true };
}
