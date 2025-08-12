import { Dialog, DialogContent } from './ui/dialog';
import { Progress } from './ui/progress';
import { Brain, Users, MessageSquare, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AiSummaryLoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const LOADING_STEPS = [
  { icon: MessageSquare, label: '발언 내용 수집', description: '토론 참여자들의 발언을 분석하고 있습니다.' },
  { icon: Users, label: '입장별 분류', description: 'A입장과 B입장의 주요 논점을 분류하고 있습니다.' },
  { icon: BarChart3, label: '여론 분석', description: '토론 중 여론 변화를 분석하고 있습니다.' },
  { icon: Brain, label: '결론 도출', description: 'AI가 토론의 핵심 내용을 요약하고 있습니다.' }
];

export function AiSummaryLoadingModal({ isOpen, onComplete }: AiSummaryLoadingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const totalDuration = 4000; // 4초
    const stepDuration = totalDuration / LOADING_STEPS.length;
    let startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      const newStep = Math.min(Math.floor(elapsed / stepDuration), LOADING_STEPS.length - 1);
      
      setProgress(newProgress);
      setCurrentStep(newStep);

      if (elapsed >= totalDuration) {
        clearInterval(timer);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

  const CurrentIcon = LOADING_STEPS[currentStep]?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-4" hideCloseButton>
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* AI 아이콘과 제목 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium">토론 요약 생성 중</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI가 토론 내용을 분석하고 요약하고 있습니다.
              </p>
            </div>
          </div>

          {/* 진행 상황 */}
          <div className="w-full space-y-4">
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                {CurrentIcon && <CurrentIcon className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{LOADING_STEPS[currentStep]?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {LOADING_STEPS[currentStep]?.description}
                </p>
              </div>
            </div>
          </div>

          {/* 단계 인디케이터 */}
          <div className="flex items-center space-x-2">
            {LOADING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep 
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            예상 소요 시간: 약 4초
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}