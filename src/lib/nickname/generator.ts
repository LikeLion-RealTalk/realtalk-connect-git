import { extractInitials } from './extract-initials';
import { containsBadword } from './filter';

const usedNicknames = new Set<string>();

export function generateNickname(
    adjectives: string[],
    nouns: string[],
    useNumber = true,
    maxRetries = 50
): string | null {
  for (let i = 0; i < maxRetries; i++) {
    const nickname = buildNickname(adjectives, nouns, useNumber);
    if (!isValidNickname(nickname)) continue;
    if (usedNicknames.has(nickname)) continue;

    usedNicknames.add(nickname);
    return nickname;
  }
  return null;
}

function buildNickname(adjectives: string[], nouns: string[], useNumber: boolean): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 990) + 10;
  return useNumber ? `${adj}${noun}${number}` : `${adj}${noun}`;
}

export function isValidNickname(nick: string): boolean {
  if (/\s/.test(nick)) return false;
  if (/[^가-힣0-9]/.test(nick)) return false;
  if (containsBadword(nick)) return false;
  return true;
}
