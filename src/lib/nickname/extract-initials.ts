export function extractInitials(text: string): string {
  const INITIALS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
    'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
    'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  let result = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const uni = code - 0xac00;
      result += INITIALS[Math.floor(uni / (21 * 28))];
    } else if (/[ㄱ-ㅎ]/.test(ch)) {
      result += ch;
    }
  }
  return result;
}
