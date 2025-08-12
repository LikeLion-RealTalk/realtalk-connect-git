import { useState } from 'react';
import { Button } from './ui/button';
import { DebateMatchingModal } from './modal/DebateMatchingModal';
import { MaterialButton } from './MaterialDesign';

interface HeroSectionProps {
  onNavigate?: (page: 'landing' | 'browser' | 'debate') => void;
  onJoinDebate?: () => void;
  onCreateDebate?: () => void;
}

export function HeroSection({ onNavigate, onJoinDebate, onCreateDebate }: HeroSectionProps) {
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);

  const handleStartDebate = () => {
    setIsMatchingModalOpen(true);
  };

  const handleStartMatching = (category: string) => {
    console.log('매칭 시작:', category);
    // 실제로는 선택한 카테고리로 매칭을 시작하고 토론방으로 이동
    onCreateDebate?.();
  };

  return (
    <>
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-regular text-on-surface">
            진짜 토론이 시작되는 곳<br/>
            <span className="text-primary font-medium">RealTalk</span>
          </h1>
          <p className="mb-8 text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            AI 진행자가 이끄는 실시간 토론에 참여하세요. 관심있는 주제에 바로 참여하거나, 새로운 토론을 시작해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MaterialButton 
              variant="contained"
              color="primary"
              size="large"
              className="min-w-48 elevation-2 hover:elevation-6"
              onClick={handleStartDebate}
            >
              토론 시작하기
            </MaterialButton>
            <MaterialButton 
              variant="outlined"
              color="primary"
              size="large"
              className="min-w-48"
              onClick={() => onNavigate?.('browser')}
            >
              둘러보기
            </MaterialButton>
          </div>
        </div>
      </section>

      <DebateMatchingModal
        isOpen={isMatchingModalOpen}
        onClose={() => setIsMatchingModalOpen(false)}
        onStartMatching={handleStartMatching}
      />
    </>
  );
}