import { useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dice6, Shuffle } from 'lucide-react';

interface NicknameInputProps {
  nickname: string;
  onNicknameChange: (nickname: string) => void;
  autoGenerate?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  label?: string;
  description?: string;
  buttonVariant?: 'dice' | 'shuffle'; // 버튼 아이콘 스타일 선택
}

export function NicknameInput({ 
  nickname, 
  onNicknameChange, 
  autoGenerate = true,
  disabled = false,
  placeholder = "닉네임을 입력하세요",
  maxLength = 20,
  label = "토론방에서 사용할 닉네임",
  description = "최대 20자까지 입력 가능합니다.",
  buttonVariant = 'dice'
}: NicknameInputProps) {
  // 닉네임 생성을 위한 배열들 (JoinDiscussionModal 스타일과 통합)
  const adjectives = [
    '지혜로운', '용감한', '따뜻한', '창의적인', '활동적인', '차분한', '영리한', '열정적인',
    '신중한', '유쾌한', '진취적인', '사려깊은', '역동적인', '친근한', '성실한', '긍정적인',
    '논리적인', '똑똑한', '활발한', '재미있는', '멋진', '훌륭한', '뛰어난'
  ];
  
  const nouns = [
    '토론자', '사자', '독수리', '여우', '호랑이', '늑대', '치타', '곰',
    '펭귄', '올빼미', '거북이', '코끼리', '돌고래', '나비', '햇살', '바람',
    '토론가', '사색가', '분석가', '철학자', '탐구자', '관찰자', '학습자', '토론러',
    '논객', '연구자', '사상가', '비판가', '검토자', '토의자'
  ];

  const generateRandomNickname = useCallback(() => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  }, []);

  // 컴포넌트가 마운트될 때 닉네임 자동 생성
  useEffect(() => {
    if (autoGenerate && !nickname) {
      onNicknameChange(generateRandomNickname());
    }
  }, [autoGenerate, nickname, onNicknameChange, generateRandomNickname]);

  const handleRegenerateNickname = () => {
    onNicknameChange(generateRandomNickname());
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNicknameChange(e.target.value);
  };

  return (
    <div className="space-y-3">
      <Label htmlFor="nickname">{label}</Label>
      <div className="flex gap-2">
        <Input
          id="nickname"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className="transition-all focus:scale-[1.02] disabled:hover:scale-100"
        />
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRegenerateNickname}
            disabled={disabled}
            className="hover:scale-105 transition-transform"
            title="랜덤 닉네임 생성"
          >
            {buttonVariant === 'shuffle' ? (
              <Shuffle className="h-4 w-4" />
            ) : (
              <Dice6 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {description.replace('20', maxLength.toString())}
      </p>
    </div>
  );
}