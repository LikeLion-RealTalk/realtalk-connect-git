import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Users, Clock, Tag, Brain } from 'lucide-react';
import { DebateSummary } from '../../types/discussion';
import { useEffect, useCallback } from 'react';

interface AiDebateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestExit: () => void;
  summary: DebateSummary | null;
}

export function AiDebateSummaryModal({ 
  isOpen, 
  onClose, 
  onRequestExit,
  summary 
}: AiDebateSummaryModalProps) {
  // 나가기 요청 핸들러
  const handleRequestExit = useCallback(() => {
    onRequestExit();
  }, [onRequestExit]);

  // 모달 닫기 이벤트를 나가기 요청으로 리다이렉트
  const handleModalClose = useCallback((open: boolean) => {
    if (!open) {
      handleRequestExit();
    }
  }, [handleRequestExit]);

  // ESC 키 이벤트 처리
  useEffect(() => {
    if (!isOpen || !summary) return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleRequestExit();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, summary, handleRequestExit]);

  // summary가 없으면 렌더링하지 않음
  if (!summary) return null;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] flex flex-col"
        // 기본 닫기 동작을 커스텀 핸들러로 처리
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          handleRequestExit();
        }}
        onPointerDownOutside={(e) => {
          e.preventDefault();
          handleRequestExit();
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>AI 토론 요약</DialogTitle>
              <DialogDescription>
                종료된 토론의 핵심 내용을 요약했습니다.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* 토론 기본 정보 */}
          <div className="space-y-3">
            <h4 className="font-medium">{summary.title}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <Badge variant="outline" className="px-2 py-1">
                {summary.debateType}
              </Badge>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {summary.category}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {summary.duration}분
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {summary.participantCount}명
              </div>
            </div>
          </div>

          <Separator />

          {/* 입장별 주요 발언 */}
          <div className="space-y-4">
            <h4 className="font-medium">입장별 주요 발언</h4>
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">{summary.sideA || 'A입장'}</span>
                </div>
                <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">
                  "{summary.keyStatements.aSide[0]}"
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">{summary.sideB || 'B입장'}</span>
                </div>
                <p className="text-sm text-red-900 dark:text-red-100 leading-relaxed">
                  "{summary.keyStatements.bSide[0]}"
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 여론 동향 */}
          <div className="space-y-4">
            <h4 className="font-medium">여론 동향</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-600 dark:text-green-400">{summary.sideA || 'A입장'}</span>
                <span className="font-medium">{summary.publicOpinion.aPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.publicOpinion.aPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 dark:text-red-400">{summary.sideB || 'B입장'}</span>
                <span className="font-medium">{summary.publicOpinion.bPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${summary.publicOpinion.bPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <Separator />

          {/* 최종 결론 */}
          <div className="space-y-3">
            <h4 className="font-medium">최종 결론</h4>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm leading-relaxed">
                "{summary.finalConclusion}"
              </p>
            </div>
          </div>

          {/* 완료 시간 */}
          <div className="text-center text-sm text-muted-foreground">
            {formatDate(summary.completedAt)} 완료
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            onClick={handleRequestExit}
            className="w-full"
          >
            다른 토론 둘러보기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}