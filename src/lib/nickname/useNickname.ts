import { useState } from 'react';
import { adjectives, nouns } from './wordlists';
import { generateNickname } from './generator';

export function useNickname(useNumber = true) {
  const [nickname, setNickname] = useState<string | null>(null);

  const generate = () => {
    const newNick = generateNickname(adjectives, nouns, useNumber);
    setNickname(newNick);
  };

  return { nickname, generate };
}
