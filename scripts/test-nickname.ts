// Run command: npx tsx scripts/test-nickname.ts

import readline from 'readline';
import { generateNickname } from '../src/lib/nickname/generator';
import { validateUserNickname } from '../src/lib/nickname/validate-user-nickname';
import { adjectives, nouns } from '../src/lib/nickname/wordlists';

function getSafeNickname(): string {
  const nick = generateNickname(adjectives, nouns, true, 50);
  return nick ?? getSafeNickname();
}

function runValidation(nickname: string) {
  const result = validateUserNickname(nickname);
  console.log(`\n입력된 닉네임: ${nickname}`);
  if (result.isValid) {
    console.log('✅ 유효한 닉네임입니다.');
  } else {
    console.log('❌ 유효하지 않은 닉네임입니다.');
    console.log(`   이유: ${result.reason}`);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('닉네임을 직접 입력하시겠습니까? (y/n): ', (answer) => {
  const input = answer.trim().toLowerCase();
  if (input === 'y') {
    rl.question('\n닉네임을 입력하세요: ', (nickname) => {
      runValidation(nickname.trim());
      rl.close();
    });
  } else {
    const nickname = getSafeNickname();
    runValidation(nickname);
    rl.close();
  }
});
