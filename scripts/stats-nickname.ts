// Run command: npx tsx scripts/stats-nickname.ts

import { generateNickname } from '../src/lib/nickname/generator';
import { validateUserNickname } from '../src/lib/nickname/validate-user-nickname';
import { adjectives, nouns } from '../src/lib/nickname/wordlists';

const TOTAL_COUNT = 100;

const stats = {
  total: 0,
  success: 0,
  fail: 0,
  reasons: new Map<string, number>(),
  failedNicknames: [] as { nickname: string | null; reason: string }[]
};

function getSafeNickname(maxRetries = 30): string | null {
  const nick = generateNickname(adjectives, nouns, true, maxRetries);
  return nick ?? null;
}

for (let i = 0; i < TOTAL_COUNT; i++) {
  const nickname = getSafeNickname();

  stats.total++;

  if (nickname === null) {
    stats.fail++;
    const reason = 'null 생성 실패';
    stats.reasons.set(reason, (stats.reasons.get(reason) || 0) + 1);
    stats.failedNicknames.push({ nickname: null, reason });
    continue;
  }

  const result = validateUserNickname(nickname);

  if (result.isValid) {
    stats.success++;
  } else {
    stats.fail++;
    const reason = result.reason!;
    stats.reasons.set(reason, (stats.reasons.get(reason) || 0) + 1);
    stats.failedNicknames.push({ nickname, reason });
  }
}

console.log(`✅ 테스트 완료 (${TOTAL_COUNT}개 시도)\n`);
console.log(`🟢 성공: ${stats.success}`);
console.log(`🔴 실패: ${stats.fail}`);
console.log(`📊 실패 사유:`);

for (const [reason, count] of stats.reasons.entries()) {
  console.log(`- ${reason}: ${count}회`);
}

if (stats.failedNicknames.length > 0) {
  console.log(`\n❌ 실패한 닉네임 목록:\n`);
  for (const entry of stats.failedNicknames) {
    const nickname = entry.nickname ?? '(null)';
    console.log(`- ${nickname} → ${entry.reason}`);
  }
}
